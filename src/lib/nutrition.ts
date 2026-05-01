/**
 * USDA FoodData Central client.
 *
 * Free public API: https://fdc.nal.usda.gov/api-guide
 *
 * - The DEMO_KEY is shared and rate-limited to ~30 req/hr/IP. Fine for
 *   trying it out. For real use, sign up at https://api.data.gov/signup/
 *   (instant, free) and set USDA_API_KEY env var.
 * - We restrict to the Foundation + SR Legacy data types — those return
 *   nutrient values per 100g, which is what we want for scaling by grams.
 *   (Branded foods use serving sizes which complicates the math.)
 * - CORS is supported, so we can call this directly from the browser.
 */

const ENDPOINT = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export type Macros = {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type FoodResult = {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  /** Macros per 100g of the food (always — we filter to per-100g datasets). */
  per100g: Macros;
};

/** USDA nutrient IDs for the four macros we care about. */
const NUTRIENT_IDS = {
  kcal: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
} as const;

type RawNutrient = {nutrientId: number; value: number; unitName?: string};
type RawFood = {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  foodNutrients?: RawNutrient[];
};

function nutrientValue(food: RawFood, nutrientId: number): number {
  const n = food.foodNutrients?.find((x) => x.nutrientId === nutrientId);
  return n?.value ?? 0;
}

/**
 * Search the USDA database by free-text query. Returns up to `limit` results
 * with per-100g macros. Throws on network/auth errors.
 */
export async function searchFoods(
  query: string,
  apiKey: string,
  limit: number = 10,
): Promise<FoodResult[]> {
  const params = new URLSearchParams({
    api_key: apiKey || 'DEMO_KEY',
    query: query.trim(),
    dataType: 'Foundation,SR Legacy',
    pageSize: String(limit),
    sortBy: 'dataType.keyword',
    sortOrder: 'asc',
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`USDA API ${res.status}: ${txt.slice(0, 200) || 'request failed'}`);
  }
  const data = await res.json();
  const foods = (data.foods ?? []) as RawFood[];
  return foods.map((f) => ({
    fdcId: f.fdcId,
    description: f.description,
    dataType: f.dataType,
    brandOwner: f.brandOwner,
    per100g: {
      kcal: nutrientValue(f, NUTRIENT_IDS.kcal),
      protein_g: nutrientValue(f, NUTRIENT_IDS.protein),
      carbs_g: nutrientValue(f, NUTRIENT_IDS.carbs),
      fat_g: nutrientValue(f, NUTRIENT_IDS.fat),
    },
  }));
}

/** Scale per-100g macros by an arbitrary gram amount. */
export function scaleMacros(per100g: Macros, grams: number): Macros {
  const f = grams / 100;
  return {
    kcal: per100g.kcal * f,
    protein_g: per100g.protein_g * f,
    carbs_g: per100g.carbs_g * f,
    fat_g: per100g.fat_g * f,
  };
}

/* ══════════════════════════════════════════════════════════════════
   OPEN FOOD FACTS — public, no auth, CORS-enabled, GET-only.
   3M+ crowdsourced products. Strong coverage of branded/packaged
   foods (yogurts, protein powders, drinks, snacks, restaurant chains).
   Complements USDA, which is best for raw whole foods.
   Docs: https://openfoodfacts.github.io/api-documentation/
   ══════════════════════════════════════════════════════════════════ */

const OFF_ENDPOINT = 'https://world.openfoodfacts.org/cgi/search.pl';

type OFFProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_es?: string;
  brands?: string;
  nutriments?: Record<string, number | string | undefined>;
};

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number | undefined);
  return Number.isFinite(n) ? (n as number) : 0;
}

export async function searchOpenFoodFacts(
  query: string,
  limit: number = 10,
): Promise<FoodResult[]> {
  const params = new URLSearchParams({
    search_terms: query.trim(),
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(limit),
    fields: 'code,product_name,product_name_en,brands,nutriments',
  });
  const res = await fetch(`${OFF_ENDPOINT}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open Food Facts ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  const products = (data.products ?? []) as OFFProduct[];
  return products
    .map((p) => {
      const n = p.nutriments ?? {};
      const kcal = num(n['energy-kcal_100g']) || num(n['energy_100g']) / 4.184;
      const result: FoodResult = {
        fdcId: p.code ? Number(p.code) || 0 : 0,
        description:
          [p.product_name || p.product_name_en, p.brands].filter(Boolean).join(' — ') ||
          p.product_name ||
          '(unnamed)',
        dataType: 'OpenFoodFacts',
        brandOwner: p.brands,
        per100g: {
          kcal,
          protein_g: num(n['proteins_100g']),
          carbs_g: num(n['carbohydrates_100g']),
          fat_g: num(n['fat_100g']),
        },
      };
      return result;
    })
    // Filter out products with no usable macro data (some entries are sparse)
    .filter((r) => r.per100g.kcal > 0 || r.per100g.protein_g > 0 || r.per100g.fat_g > 0);
}

export type NutritionSource = 'usda' | 'off' | 'both';

/**
 * Unified search — runs USDA, Open Food Facts, or both in parallel.
 * Tags each result with its source so the UI can label them.
 */
export async function searchNutrition(
  query: string,
  source: NutritionSource,
  usdaApiKey: string,
  limit: number = 10,
): Promise<FoodResult[]> {
  if (source === 'usda') return searchFoods(query, usdaApiKey, limit);
  if (source === 'off') return searchOpenFoodFacts(query, limit);
  // both
  const [a, b] = await Promise.all([
    searchFoods(query, usdaApiKey, limit).catch(() => [] as FoodResult[]),
    searchOpenFoodFacts(query, limit).catch(() => [] as FoodResult[]),
  ]);
  return [...a, ...b];
}
