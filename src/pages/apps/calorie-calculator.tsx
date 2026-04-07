import {useState, useMemo, type ReactNode, type ChangeEvent} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './calorie-calculator.module.css';

/* ─── types ─── */
type Sex = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
type Goal = 'cut' | 'maintain' | 'lean_bulk' | 'bulk';
type DietMode = 'mixed' | 'keto';
type FastingWindow = 'none' | '12' | '8' | '4';

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (office job)',
  light: 'Light (1-2 days/wk)',
  moderate: 'Moderate (3-4 days/wk)',
  heavy: 'Intense (5-6 days/wk)',
  athlete: 'Athlete (2x/day)',
};

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  athlete: 1.9,
};

const GOAL_LABELS: Record<Goal, string> = {
  cut: 'Cutting (-500 kcal)',
  maintain: 'Maintenance',
  lean_bulk: 'Lean Bulk (+200 kcal)',
  bulk: 'Bulk (+500 kcal)',
};

const GOAL_OFFSET: Record<Goal, number> = {
  cut: -500,
  maintain: 0,
  lean_bulk: 200,
  bulk: 500,
};

const FASTING_LABELS: Record<FastingWindow, string> = {
  none: 'No IF',
  '12': '12 hr window (12:12)',
  '8': '8 hr window (16:8)',
  '4': '4 hr window (20:4)',
};

/* ─── BMR (Mifflin-St Jeor) ─── */
function calcBMR(weight: number, height: number, age: number, sex: Sex): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/* ─── Macro windows ─── */
type MacroWindow = {
  name: string;
  timing: string;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
};

function calcTotals(totalCal: number, weight: number, mode: DietMode) {
  const totalProtein = Math.round(weight * 2.2);
  const proteinCal = totalProtein * 4;
  const remaining = totalCal - proteinCal;

  if (mode === 'keto') {
    const totalCarbs = 25;
    const carbsCal = totalCarbs * 4;
    const fatCal = totalCal - proteinCal - carbsCal;
    const totalFat = Math.round(fatCal / 9);
    return {totalProtein, totalCarbs, totalFat};
  }

  const carbsCal = remaining * 0.6;
  const fatCal = remaining * 0.4;
  return {
    totalProtein,
    totalCarbs: Math.round(carbsCal / 4),
    totalFat: Math.round(fatCal / 9),
  };
}

function calcStandardWindows(
  totalCal: number,
  weight: number,
  mode: DietMode,
): MacroWindow[] {
  const {totalProtein, totalCarbs, totalFat} = calcTotals(totalCal, weight, mode);

  if (mode === 'keto') {
    return [
      {
        name: 'Pre-Workout',
        timing: '60-90 min before',
        protein: Math.round(totalProtein * 0.2),
        carbs: 0,
        fat: Math.round(totalFat * 0.15),
        notes: '1 tbsp MCT oil. Does not break ketosis.',
      },
      {
        name: 'Intra-Workout',
        timing: 'During session',
        protein: 0, carbs: 0, fat: 0,
        notes: '500ml water + electrolytes. Optional BCAAs.',
      },
      {
        name: 'Post-Workout',
        timing: '0-120 min after',
        protein: Math.round(totalProtein * 0.3),
        carbs: Math.round(totalCarbs * 0.5),
        fat: Math.round(totalFat * 0.1),
        notes: 'Whey isolate + green vegetables.',
      },
      {
        name: 'Main Meal',
        timing: 'Lunch/Dinner',
        protein: Math.round(totalProtein * 0.3),
        carbs: Math.round(totalCarbs * 0.3),
        fat: Math.round(totalFat * 0.45),
        notes: 'Salmon, beef, avocado, olive oil.',
      },
      {
        name: 'Night',
        timing: '2-3 hrs before sleep',
        protein: Math.round(totalProtein * 0.2),
        carbs: Math.round(totalCarbs * 0.2),
        fat: Math.round(totalFat * 0.3),
        notes: 'Casein or eggs. Low insulin \u2192 GH peak.',
      },
    ];
  }

  return [
    {
      name: 'Pre-Workout',
      timing: '60-90 min before',
      protein: Math.round(totalProtein * 0.2),
      carbs: Math.round(totalCarbs * 0.3),
      fat: Math.round(totalFat * 0.1),
      notes: 'Oats 40g + fruit + egg whites. Avoid high fat.',
    },
    {
      name: 'Intra-Workout',
      timing: 'During session',
      protein: 0, carbs: 0, fat: 0,
      notes: '500ml water + electrolytes. Creatine intra if not tolerated pre.',
    },
    {
      name: 'Post-Workout',
      timing: '0-120 min after',
      protein: Math.round(totalProtein * 0.3),
      carbs: Math.round(totalCarbs * 0.4),
      fat: Math.round(totalFat * 0.1),
      notes: 'Whey isolate 30-40g + white rice 50-80g.',
    },
    {
      name: 'Main Meal',
      timing: 'Lunch/Dinner',
      protein: Math.round(totalProtein * 0.3),
      carbs: Math.round(totalCarbs * 0.2),
      fat: Math.round(totalFat * 0.45),
      notes: 'Chicken/beef/fish + rice + vegetables.',
    },
    {
      name: 'Night',
      timing: '2-3 hrs before sleep',
      protein: Math.round(totalProtein * 0.2),
      carbs: Math.round(totalCarbs * 0.1),
      fat: Math.round(totalFat * 0.35),
      notes: 'Chicken, salmon or eggs. Minimize carbs. Casein if available.',
    },
  ];
}

/* ─── Intermittent Fasting windows ─── */
function calcIFWindows(
  totalCal: number,
  weight: number,
  mode: DietMode,
  fastingHrs: '12' | '8' | '4',
): MacroWindow[] {
  const {totalProtein, totalCarbs, totalFat} = calcTotals(totalCal, weight, mode);

  // 12hr → 3 meals, 8hr → 3 meals, 4hr → 2 meals
  const mealCount = fastingHrs === '4' ? 2 : 3;
  const fastHrs = fastingHrs === '12' ? 12 : fastingHrs === '8' ? 16 : 20;
  const eatHrs = 24 - fastHrs;

  const ketoNote = mode === 'keto' ? ' High fat, minimal carbs.' : '';

  if (mealCount === 2) {
    // 20:4 — 2 meals within 4 hour window
    return [
      {
        name: 'Fasting Window',
        timing: `${fastHrs} hrs fasted`,
        protein: 0, carbs: 0, fat: 0,
        notes: `Water, black coffee, electrolytes only. GH elevated 3-5x baseline.${mode === 'keto' ? ' Deep ketosis during fast.' : ''}`,
      },
      {
        name: 'Meal 1 (Post-Workout)',
        timing: `Start of ${eatHrs}hr window`,
        protein: Math.round(totalProtein * 0.55),
        carbs: Math.round(totalCarbs * 0.6),
        fat: Math.round(totalFat * 0.4),
        notes: `Break fast with largest meal. Train fasted or just before this meal.${ketoNote}`,
      },
      {
        name: 'Meal 2 (Final)',
        timing: `End of ${eatHrs}hr window`,
        protein: Math.round(totalProtein * 0.45),
        carbs: Math.round(totalCarbs * 0.4),
        fat: Math.round(totalFat * 0.6),
        notes: `Slow-digesting protein + fats. Casein ideal. Sets up overnight recovery.${ketoNote}`,
      },
    ];
  }

  // 3 meals (12:12 or 16:8)
  return [
    {
      name: 'Fasting Window',
      timing: `${fastHrs} hrs fasted`,
      protein: 0, carbs: 0, fat: 0,
      notes: `Water, black coffee, electrolytes only.${fastHrs >= 16 ? ' GH elevated 3-5x baseline.' : ''}${mode === 'keto' ? ' Ketones as brain fuel.' : ''}`,
    },
    {
      name: 'Meal 1 (Break Fast)',
      timing: `Start of ${eatHrs}hr window`,
      protein: Math.round(totalProtein * 0.3),
      carbs: Math.round(totalCarbs * 0.35),
      fat: Math.round(totalFat * 0.25),
      notes: `Break fast gently. ${mode === 'keto' ? 'Eggs + avocado + MCT oil.' : 'Oats + eggs + fruit.'}`,
    },
    {
      name: 'Meal 2 (Post-Workout)',
      timing: 'Mid eating window',
      protein: Math.round(totalProtein * 0.4),
      carbs: Math.round(totalCarbs * 0.45),
      fat: Math.round(totalFat * 0.3),
      notes: `Largest meal. Schedule training before this.${mode === 'keto' ? ' Beef/salmon + greens + olive oil.' : ' Chicken/beef + rice + vegetables.'}`,
    },
    {
      name: 'Meal 3 (Final)',
      timing: `End of ${eatHrs}hr window`,
      protein: Math.round(totalProtein * 0.3),
      carbs: Math.round(totalCarbs * 0.2),
      fat: Math.round(totalFat * 0.45),
      notes: `Slow protein + fats. Minimize carbs.${mode === 'keto' ? ' Casein or eggs + nuts.' : ' Salmon or eggs + casein.'}`,
    },
  ];
}

/* ══════════════════════════════════════════
   FOOD DATABASE — per 100g unless noted
   ══════════════════════════════════════════ */

type Food = {
  name: string;
  unit: string;       // display unit
  unitGrams: number;  // grams per display unit
  protein: number;    // per 100g
  carbs: number;
  fat: number;
  keto: boolean;      // suitable for keto
  mixed: boolean;     // suitable for mixed
  category: 'protein' | 'fat' | 'carb' | 'combo';
  meal: ('pre' | 'post' | 'main' | 'night' | 'any')[];
};

const FOODS: Food[] = [
  // ── Protein sources ──
  {name: 'Whole Egg', unit: '1 egg (50g)', unitGrams: 50, protein: 12.6, carbs: 0.7, fat: 9.5, keto: true, mixed: true, category: 'combo', meal: ['main', 'night', 'pre', 'any']},
  {name: 'Egg Whites', unit: '100g (~3 whites)', unitGrams: 100, protein: 10.9, carbs: 0.7, fat: 0.2, keto: true, mixed: true, category: 'protein', meal: ['pre', 'post', 'any']},
  {name: 'Chicken Breast', unit: '100g', unitGrams: 100, protein: 31, carbs: 0, fat: 3.6, keto: true, mixed: true, category: 'protein', meal: ['main', 'night', 'any']},
  {name: 'Ground Beef (90/10)', unit: '100g', unitGrams: 100, protein: 26, carbs: 0, fat: 10, keto: true, mixed: true, category: 'protein', meal: ['main', 'any']},
  {name: 'Salmon Fillet', unit: '100g', unitGrams: 100, protein: 20, carbs: 0, fat: 13, keto: true, mixed: true, category: 'combo', meal: ['main', 'night', 'any']},
  {name: 'Canned Tuna', unit: '1 can (120g)', unitGrams: 120, protein: 26, carbs: 0, fat: 1, keto: true, mixed: true, category: 'protein', meal: ['main', 'post', 'any']},
  {name: 'Canned Sardines', unit: '1 can (125g)', unitGrams: 125, protein: 25, carbs: 0, fat: 11, keto: true, mixed: true, category: 'combo', meal: ['main', 'any']},
  {name: 'Whey Isolate', unit: '1 scoop (30g)', unitGrams: 30, protein: 83, carbs: 3.3, fat: 1.7, keto: true, mixed: true, category: 'protein', meal: ['post', 'pre', 'any']},
  {name: 'Casein Protein', unit: '1 scoop (33g)', unitGrams: 33, protein: 76, carbs: 6, fat: 3, keto: false, mixed: true, category: 'protein', meal: ['night']},
  {name: 'Greek Yogurt (0% fat)', unit: '170g', unitGrams: 170, protein: 10, carbs: 3.6, fat: 0.7, keto: false, mixed: true, category: 'protein', meal: ['pre', 'night', 'any']},
  // ── Fat sources ──
  {name: 'Avocado', unit: '1/2 avocado (100g)', unitGrams: 100, protein: 2, carbs: 8.5, fat: 14.7, keto: true, mixed: true, category: 'fat', meal: ['main', 'any']},
  {name: 'Olive Oil', unit: '1 tbsp (14g)', unitGrams: 14, protein: 0, carbs: 0, fat: 100, keto: true, mixed: true, category: 'fat', meal: ['main', 'any']},
  {name: 'MCT Oil', unit: '1 tbsp (14g)', unitGrams: 14, protein: 0, carbs: 0, fat: 100, keto: true, mixed: false, category: 'fat', meal: ['pre']},
  {name: 'Almonds', unit: '30g (~23 almonds)', unitGrams: 30, protein: 21, carbs: 22, fat: 49, keto: true, mixed: true, category: 'fat', meal: ['night', 'any']},
  {name: 'Peanut Butter', unit: '1 tbsp (16g)', unitGrams: 16, protein: 25, carbs: 20, fat: 50, keto: false, mixed: true, category: 'fat', meal: ['pre', 'night', 'any']},
  {name: 'Cream Cheese', unit: '30g', unitGrams: 30, protein: 6, carbs: 4, fat: 34, keto: true, mixed: false, category: 'fat', meal: ['main', 'night']},
  {name: 'Bacon', unit: '2 slices (30g)', unitGrams: 30, protein: 37, carbs: 1.4, fat: 42, keto: true, mixed: false, category: 'combo', meal: ['main', 'any']},
  {name: 'Butter', unit: '1 tbsp (14g)', unitGrams: 14, protein: 0.9, carbs: 0, fat: 81, keto: true, mixed: false, category: 'fat', meal: ['main', 'any']},
  // ── Carb sources ──
  {name: 'Oats', unit: '40g (dry)', unitGrams: 40, protein: 13, carbs: 66, fat: 7, keto: false, mixed: true, category: 'carb', meal: ['pre']},
  {name: 'White Rice', unit: '100g (cooked)', unitGrams: 100, protein: 2.7, carbs: 28, fat: 0.3, keto: false, mixed: true, category: 'carb', meal: ['post', 'main']},
  {name: 'Sweet Potato', unit: '100g (cooked)', unitGrams: 100, protein: 1.6, carbs: 20, fat: 0.1, keto: false, mixed: true, category: 'carb', meal: ['pre', 'main']},
  {name: 'Banana', unit: '1 medium (120g)', unitGrams: 120, protein: 1.1, carbs: 23, fat: 0.3, keto: false, mixed: true, category: 'carb', meal: ['pre', 'post']},
  {name: 'Whole Wheat Bread', unit: '1 slice (30g)', unitGrams: 30, protein: 13, carbs: 43, fat: 3.4, keto: false, mixed: true, category: 'carb', meal: ['pre', 'main']},
  // ── Keto-friendly veggies (very low carb) ──
  {name: 'Broccoli', unit: '100g', unitGrams: 100, protein: 2.8, carbs: 7, fat: 0.4, keto: true, mixed: true, category: 'carb', meal: ['main', 'any']},
  {name: 'Spinach', unit: '100g', unitGrams: 100, protein: 2.9, carbs: 3.6, fat: 0.4, keto: true, mixed: true, category: 'carb', meal: ['main', 'any']},
  // ── Soy ──
  {name: 'Tofu (firm)', unit: '100g', unitGrams: 100, protein: 17, carbs: 2, fat: 9, keto: true, mixed: true, category: 'protein', meal: ['main', 'any']},
  {name: 'Edamame', unit: '100g (shelled)', unitGrams: 100, protein: 11, carbs: 8.9, fat: 5, keto: false, mixed: true, category: 'protein', meal: ['main', 'any']},
  {name: 'Soy Milk (unsweetened)', unit: '240ml', unitGrams: 240, protein: 2.9, carbs: 0.4, fat: 1.7, keto: true, mixed: true, category: 'protein', meal: ['pre', 'any']},
  {name: 'Lala 100 Lactose-Free +Protein', unit: '250ml', unitGrams: 250, protein: 5.4, carbs: 3.4, fat: 2, keto: false, mixed: true, category: 'protein', meal: ['pre', 'post', 'night', 'any']},
  {name: 'Lala 100 Light +Protein', unit: '250ml', unitGrams: 250, protein: 5.4, carbs: 3.4, fat: 1, keto: false, mixed: true, category: 'protein', meal: ['pre', 'post', 'night', 'any']},
];

/* ── Build suggested meals per window ── */
type MealSuggestion = {
  food: string;
  amount: string;
  protein: number;
  carbs: number;
  fat: number;
  kcal: number;
};

type WindowSuggestion = {
  windowName: string;
  items: MealSuggestion[];
  totalP: number;
  totalC: number;
  totalF: number;
  totalKcal: number;
};

function suggestMeals(
  windows: MacroWindow[],
  mode: DietMode,
): WindowSuggestion[] {
  return windows
    .filter((w) => w.protein > 0 || w.carbs > 0 || w.fat > 0)
    .map((w) => {
      const items: MealSuggestion[] = [];
      let remainP = w.protein;
      let remainC = w.carbs;
      let remainF = w.fat;

      // Determine meal slot
      const slot = w.name.toLowerCase().includes('pre') ? 'pre'
        : w.name.toLowerCase().includes('post') || w.name.toLowerCase().includes('meal 1') || w.name.toLowerCase().includes('meal 2') ? 'post'
        : w.name.toLowerCase().includes('night') || w.name.toLowerCase().includes('final') || w.name.toLowerCase().includes('meal 3') ? 'night'
        : 'main';

      const available = FOODS.filter((f) => {
        if (mode === 'keto' && !f.keto) return false;
        if (mode === 'mixed' && !f.mixed) return false;
        return f.meal.includes(slot) || f.meal.includes('any');
      });

      // 1. Pick main protein source
      const proteinFoods = available.filter((f) => f.category === 'protein' || (f.category === 'combo' && f.protein > 10));
      if (remainP > 5 && proteinFoods.length > 0) {
        // Prefer whey for post, casein for night, otherwise rotate
        let pick: Food;
        if (slot === 'post') {
          pick = proteinFoods.find((f) => f.name.includes('Whey')) || proteinFoods[0];
        } else if (slot === 'night') {
          pick = proteinFoods.find((f) => f.name.includes('Casein') || f.name.includes('Salmon') || f.name.includes('Egg')) || proteinFoods[0];
        } else if (slot === 'pre') {
          pick = proteinFoods.find((f) => f.name.includes('Egg White') || f.name.includes('Greek') || f.name.includes('Whey')) || proteinFoods[0];
        } else {
          pick = proteinFoods.find((f) => f.name.includes('Chicken') || f.name.includes('Beef') || f.name.includes('Salmon')) || proteinFoods[0];
        }

        const protPer100 = pick.protein;
        const gramsNeeded = Math.round((remainP / protPer100) * 100);
        const units = Math.max(1, Math.round(gramsNeeded / pick.unitGrams));
        const actualGrams = units * pick.unitGrams;
        const factor = actualGrams / 100;
        const p = Math.round(pick.protein * factor);
        const c = Math.round(pick.carbs * factor);
        const f = Math.round(pick.fat * factor);

        items.push({
          food: pick.name,
          amount: units === 1 ? pick.unit : `${units} x ${pick.unit}`,
          protein: p, carbs: c, fat: f,
          kcal: p * 4 + c * 4 + f * 9,
        });
        remainP -= p;
        remainC -= c;
        remainF -= f;
      }

      // 2. Add carb source (if mixed and carbs remaining)
      if (remainC > 10 && mode === 'mixed') {
        const carbFoods = available.filter((f) => f.category === 'carb' && f.carbs > 15);
        if (carbFoods.length > 0) {
          let pick: Food;
          if (slot === 'pre') {
            pick = carbFoods.find((f) => f.name.includes('Oat') || f.name.includes('Sweet')) || carbFoods[0];
          } else if (slot === 'post') {
            pick = carbFoods.find((f) => f.name.includes('Rice') || f.name.includes('Banana')) || carbFoods[0];
          } else {
            pick = carbFoods.find((f) => f.name.includes('Rice') || f.name.includes('Sweet')) || carbFoods[0];
          }

          const carbsPer100 = pick.carbs;
          const gramsNeeded = Math.round((remainC / carbsPer100) * 100);
          const units = Math.max(1, Math.round(gramsNeeded / pick.unitGrams));
          const actualGrams = units * pick.unitGrams;
          const factor = actualGrams / 100;
          const p = Math.round(pick.protein * factor);
          const c = Math.round(pick.carbs * factor);
          const f = Math.round(pick.fat * factor);

          items.push({
            food: pick.name,
            amount: units === 1 ? pick.unit : `${units} x ${pick.unit}`,
            protein: p, carbs: c, fat: f,
            kcal: p * 4 + c * 4 + f * 9,
          });
          remainP -= p;
          remainC -= c;
          remainF -= f;
        }
      }

      // 2b. Keto: add veggies
      if (mode === 'keto' && (slot === 'main' || slot === 'night')) {
        const veggie = available.find((f) => f.name === 'Broccoli' || f.name === 'Spinach');
        if (veggie) {
          items.push({
            food: veggie.name,
            amount: '100g',
            protein: Math.round(veggie.protein),
            carbs: Math.round(veggie.carbs),
            fat: 0,
            kcal: Math.round(veggie.protein * 4 + veggie.carbs * 4),
          });
          remainC -= Math.round(veggie.carbs);
        }
      }

      // 3. Add fat source if needed
      if (remainF > 5) {
        const fatFoods = available.filter((f) => f.category === 'fat' && f.fat > 10);
        if (fatFoods.length > 0) {
          let pick: Food;
          if (mode === 'keto' && slot === 'pre') {
            pick = fatFoods.find((f) => f.name.includes('MCT')) || fatFoods[0];
          } else if (slot === 'main') {
            pick = fatFoods.find((f) => f.name.includes('Avocado') || f.name.includes('Olive')) || fatFoods[0];
          } else {
            pick = fatFoods.find((f) => f.name.includes('Almond') || f.name.includes('Avocado')) || fatFoods[0];
          }

          const fatPer100 = pick.fat;
          const gramsNeeded = Math.round((remainF / fatPer100) * 100);
          const units = Math.max(1, Math.round(gramsNeeded / pick.unitGrams));
          const actualGrams = units * pick.unitGrams;
          const factor = actualGrams / 100;
          const p = Math.round(pick.protein * factor);
          const c = Math.round(pick.carbs * factor);
          const f = Math.round(pick.fat * factor);

          items.push({
            food: pick.name,
            amount: units === 1 ? pick.unit : `${units} x ${pick.unit}`,
            protein: p, carbs: c, fat: f,
            kcal: p * 4 + c * 4 + f * 9,
          });
        }
      }

      // 3b. Keto main meal — add a second protein/fat combo if needed
      if (mode === 'keto' && remainP > 15 && slot === 'main') {
        const extras = available.filter((f) => f.category === 'combo' && !items.some((i) => i.food === f.name));
        if (extras.length > 0) {
          const pick = extras[0];
          const gramsNeeded = Math.round((remainP / pick.protein) * 100);
          const units = Math.max(1, Math.round(gramsNeeded / pick.unitGrams));
          const actualGrams = units * pick.unitGrams;
          const factor = actualGrams / 100;
          items.push({
            food: pick.name,
            amount: units === 1 ? pick.unit : `${units} x ${pick.unit}`,
            protein: Math.round(pick.protein * factor),
            carbs: Math.round(pick.carbs * factor),
            fat: Math.round(pick.fat * factor),
            kcal: Math.round((pick.protein * 4 + pick.carbs * 4 + pick.fat * 9) * factor),
          });
        }
      }

      const totalP = items.reduce((s, i) => s + i.protein, 0);
      const totalC = items.reduce((s, i) => s + i.carbs, 0);
      const totalF = items.reduce((s, i) => s + i.fat, 0);

      return {
        windowName: w.name,
        items,
        totalP,
        totalC,
        totalF,
        totalKcal: totalP * 4 + totalC * 4 + totalF * 9,
      };
    });
}

/* ─── Food Reference Table ─── */
type FoodRef = {name: string; unit: string; p: number; c: number; f: number; kcal: number};

function buildFoodRef(): FoodRef[] {
  return FOODS.map((f) => {
    const factor = f.unitGrams / 100;
    const p = Math.round(f.protein * factor);
    const c = Math.round(f.carbs * factor);
    const fat = Math.round(f.fat * factor);
    return {
      name: f.name,
      unit: f.unit,
      p, c, f: fat,
      kcal: p * 4 + c * 4 + fat * 9,
    };
  });
}

const FOOD_REF = buildFoodRef();

/* ─── component ─── */
export default function CalorieCalculator(): ReactNode {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(28);
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState<ActivityLevel>('heavy');
  const [goal, setGoal] = useState<Goal>('lean_bulk');
  const [dietMode, setDietMode] = useState<DietMode>('mixed');
  const [fasting, setFasting] = useState<FastingWindow>('none');

  const bmr = useMemo(() => calcBMR(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => Math.round(bmr * ACTIVITY_FACTORS[activity]), [bmr, activity]);
  const targetCal = useMemo(() => tdee + GOAL_OFFSET[goal], [tdee, goal]);

  const windows = useMemo(() => {
    if (fasting === 'none') {
      return calcStandardWindows(targetCal, weight, dietMode);
    }
    return calcIFWindows(targetCal, weight, dietMode, fasting);
  }, [targetCal, weight, dietMode, fasting]);

  const totalProtein = windows.reduce((s, w) => s + w.protein, 0);
  const totalCarbs = windows.reduce((s, w) => s + w.carbs, 0);
  const totalFat = windows.reduce((s, w) => s + w.fat, 0);

  const suggestions = useMemo(
    () => suggestMeals(windows, dietMode),
    [windows, dietMode],
  );

  const [showFoodRef, setShowFoodRef] = useState(false);

  function clampedHandler(setter: (v: number) => void, min: number, max: number) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) setter(Math.min(max, Math.max(min, v)));
    };
  }

  return (
    <Layout title="Calorie Calculator" description="TDEE and macros by time window - Goose Method">
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>Calorie Calculator</Heading>
          <p className={styles.subtitle}>
            TDEE + Macros by Time Window &mdash; Goose Method Section VI
          </p>
        </header>

        <div className={styles.layout}>
          {/* ── INPUT PANEL ── */}
          <div className={styles.inputPanel}>
            <div className={styles.card}>
              <Heading as="h3">Personal Data</Heading>

              <label className={styles.label}>
                Sex
                <div className={styles.toggleRow}>
                  <button
                    className={`${styles.toggleBtn} ${sex === 'male' ? styles.active : ''}`}
                    onClick={() => setSex('male')}
                  >Male</button>
                  <button
                    className={`${styles.toggleBtn} ${sex === 'female' ? styles.active : ''}`}
                    onClick={() => setSex('female')}
                  >Female</button>
                </div>
              </label>

              <label className={styles.label}>
                Age
                <input type="number" min={14} max={80} value={age}
                  onChange={clampedHandler(setAge, 14, 80)} className={styles.input} />
              </label>

              <label className={styles.label}>
                Weight (kg)
                <input type="number" min={30} max={250} step={0.5} value={weight}
                  onChange={clampedHandler(setWeight, 30, 250)} className={styles.input} />
              </label>

              <label className={styles.label}>
                Height (cm)
                <input type="number" min={100} max={230} value={height}
                  onChange={clampedHandler(setHeight, 100, 230)} className={styles.input} />
              </label>

              <label className={styles.label}>
                Activity
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                  className={styles.input}
                >
                  {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Goal
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as Goal)}
                  className={styles.input}
                >
                  {Object.entries(GOAL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Diet Mode
                <div className={styles.toggleRow}>
                  <button
                    className={`${styles.toggleBtn} ${dietMode === 'mixed' ? styles.active : ''}`}
                    onClick={() => setDietMode('mixed')}
                  >Mixed</button>
                  <button
                    className={`${styles.toggleBtn} ${dietMode === 'keto' ? styles.active : ''}`}
                    onClick={() => setDietMode('keto')}
                  >Keto</button>
                </div>
              </label>

              <label className={styles.label}>
                Intermittent Fasting
                <select
                  value={fasting}
                  onChange={(e) => setFasting(e.target.value as FastingWindow)}
                  className={styles.input}
                >
                  {Object.entries(FASTING_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ── RESULTS ── */}
          <div className={styles.resultsPanel}>
            {/* Summary cards */}
            <div className={styles.summaryRow}>
              <div className={`${styles.summaryCard} ${styles.bmrCard}`}>
                <span className={styles.summaryLabel}>BMR</span>
                <span className={styles.summaryValue}>{Math.round(bmr)}</span>
                <span className={styles.summaryUnit}>kcal</span>
              </div>
              <div className={`${styles.summaryCard} ${styles.tdeeCard}`}>
                <span className={styles.summaryLabel}>TDEE</span>
                <span className={styles.summaryValue}>{tdee}</span>
                <span className={styles.summaryUnit}>kcal</span>
              </div>
              <div className={`${styles.summaryCard} ${styles.targetCard}`}>
                <span className={styles.summaryLabel}>Target</span>
                <span className={styles.summaryValue}>{targetCal}</span>
                <span className={styles.summaryUnit}>kcal</span>
              </div>
            </div>

            {/* Macro totals */}
            <div className={styles.macroTotals}>
              <div className={styles.macroChip}>
                <span className={styles.macroDot} style={{background: '#e74c3c'}} />
                Protein: <strong>{totalProtein}g</strong> ({totalProtein * 4} kcal)
              </div>
              <div className={styles.macroChip}>
                <span className={styles.macroDot} style={{background: '#f39c12'}} />
                Carbs: <strong>{totalCarbs}g</strong> ({totalCarbs * 4} kcal)
              </div>
              <div className={styles.macroChip}>
                <span className={styles.macroDot} style={{background: '#3498db'}} />
                Fat: <strong>{totalFat}g</strong> ({totalFat * 9} kcal)
              </div>
            </div>

            {/* IF info badge */}
            {fasting !== 'none' && (
              <div className={styles.ifBadge}>
                <strong>Intermittent Fasting:</strong>{' '}
                {fasting === '12' ? '12:12' : fasting === '8' ? '16:8' : '20:4'} protocol
                &mdash; {fasting === '4' ? '2 meals' : '3 meals'} in a{' '}
                {fasting} hour eating window.
                {dietMode === 'keto' && ' Keto + IF maximizes fat oxidation and GH response.'}
              </div>
            )}

            {/* Timing windows */}
            <Heading as="h3" className={styles.sectionTitle}>
              {fasting === 'none' ? 'Distribution by Time Window' : 'IF Meal Distribution'}
            </Heading>
            <div className={styles.windowGrid}>
              {windows.map((w) => (
                <div key={w.name} className={`${styles.windowCard} ${w.protein === 0 && w.carbs === 0 && w.fat === 0 ? styles.fastingCard : ''}`}>
                  <div className={styles.windowHeader}>
                    <strong>{w.name}</strong>
                    <span className={styles.windowTiming}>{w.timing}</span>
                  </div>
                  <div className={styles.windowMacros}>
                    {w.protein > 0 && <span className={styles.wMacro}>P: {w.protein}g</span>}
                    {w.carbs > 0 && <span className={styles.wMacro}>C: {w.carbs}g</span>}
                    {w.fat > 0 && <span className={styles.wMacro}>F: {w.fat}g</span>}
                    {w.protein === 0 && w.carbs === 0 && w.fat === 0 && (
                      <span className={styles.wMacroFast}>
                        {fasting !== 'none' ? 'Fasting' : 'Hydration'}
                      </span>
                    )}
                  </div>
                  <p className={styles.windowNote}>{w.notes}</p>
                </div>
              ))}
            </div>

            {dietMode === 'keto' && fasting === 'none' && (
              <div className={styles.ketoNote}>
                <strong>Keto Note:</strong> Compatibility with Heavy Duty requires full
                ketogenic adaptation (4-8 weeks). MCT oil pre-gym as immediate fuel.
                GH elevated 3-5x baseline with 16-20 hr fasting.
              </div>
            )}

            {/* ── SUGGESTED MEALS ── */}
            <Heading as="h3" className={styles.sectionTitle}>
              Suggested Meals {dietMode === 'keto' ? '(Keto)' : '(Mixed Diet)'}
            </Heading>
            <div className={styles.windowGrid}>
              {suggestions.map((s) => (
                <div key={s.windowName} className={styles.mealCard}>
                  <div className={styles.windowHeader}>
                    <strong>{s.windowName}</strong>
                    <span className={styles.mealTotals}>
                      {s.totalKcal} kcal &middot; P:{s.totalP}g C:{s.totalC}g F:{s.totalF}g
                    </span>
                  </div>
                  <table className={styles.mealTable}>
                    <thead>
                      <tr>
                        <th>Food</th>
                        <th>Amount</th>
                        <th>P</th>
                        <th>C</th>
                        <th>F</th>
                        <th>kcal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.food}</td>
                          <td className={styles.mealAmt}>{item.amount}</td>
                          <td>{item.protein}g</td>
                          <td>{item.carbs}g</td>
                          <td>{item.fat}g</td>
                          <td>{item.kcal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* ── FOOD REFERENCE ── */}
            <button
              className={styles.refToggle}
              onClick={() => setShowFoodRef(!showFoodRef)}
            >
              {showFoodRef ? 'Hide' : 'Show'} Food Reference Table
            </button>

            {showFoodRef && (
              <div className={styles.refTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Serving</th>
                      <th>P</th>
                      <th>C</th>
                      <th>F</th>
                      <th>kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FOOD_REF.filter((f) => {
                      const food = FOODS.find((fd) => fd.name === f.name)!;
                      return dietMode === 'keto' ? food.keto : food.mixed;
                    }).map((f) => (
                      <tr key={f.name}>
                        <td>{f.name}</td>
                        <td className={styles.mealAmt}>{f.unit}</td>
                        <td>{f.p}g</td>
                        <td>{f.c}g</td>
                        <td>{f.f}g</td>
                        <td>{f.kcal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
