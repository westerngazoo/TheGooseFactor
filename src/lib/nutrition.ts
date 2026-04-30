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
