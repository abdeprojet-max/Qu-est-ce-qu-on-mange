import { describe, expect, it } from 'vitest';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES, RECIPES_BY_ID } from '../data/recipes';
import {
  buildShoppingList,
  dayNutrition,
  generatePlan,
  isRecipeAllowed,
  swapMeal,
  type Settings,
} from './planner';

const base: Settings = {
  days: 7,
  startDate: '2026-11-30',
  people: 2,
  meals: ['petit-dejeuner', 'dejeuner', 'diner'],
  cuisines: [],
  restrictions: [],
  excludedIngredients: [],
  goal: 'equilibre',
  dailyKcal: 2100,
  maxPrepMinutes: null,
};

const allRecipeIds = (s: Settings, seed = 1) =>
  generatePlan(s, seed).days.flatMap((d) => Object.values(d.meals).map((m) => m?.recipeId));

describe('données', () => {
  it('chaque ingrédient de recette existe dans le catalogue', () => {
    for (const r of RECIPES) for (const [n] of r.ingredients) expect(INGREDIENTS[n], `${r.id} → ${n}`).toBeDefined();
  });

  it('les identifiants de recettes sont uniques', () => {
    expect(new Set(RECIPES.map((r) => r.id)).size).toBe(RECIPES.length);
  });
});

describe('generatePlan', () => {
  it('produit le bon nombre de jours et de repas', () => {
    const plan = generatePlan(base, 42);
    expect(plan.days).toHaveLength(7);
    expect(plan.days[0].date).toBe('2026-11-30');
    expect(plan.days[6].date).toBe('2026-12-06');
    for (const d of plan.days) expect(Object.keys(d.meals).sort()).toEqual(['dejeuner', 'diner', 'petit-dejeuner']);
  });

  it('est reproductible avec la même graine', () => {
    expect(generatePlan(base, 7)).toEqual(generatePlan(base, 7));
  });

  it('ne répète pas une recette dans la même journée', () => {
    for (const d of generatePlan(base, 3).days) {
      const ids = Object.values(d.meals).map((m) => m!.recipeId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('respecte le régime végétarien', () => {
    const ids = allRecipeIds({ ...base, restrictions: ['vegetarien'] });
    for (const id of ids) {
      expect(RECIPES_BY_ID[id!].contains).not.toContain('viande');
      expect(RECIPES_BY_ID[id!].contains).not.toContain('volaille');
      expect(RECIPES_BY_ID[id!].contains).not.toContain('poisson');
    }
  });

  it('respecte les cuisines choisies pour les repas principaux', () => {
    const plan = generatePlan({ ...base, cuisines: ['africaine'] }, 5);
    for (const d of plan.days) {
      expect(RECIPES_BY_ID[d.meals.dejeuner!.recipeId].cuisine).toBe('africaine');
      expect(RECIPES_BY_ID[d.meals.diner!.recipeId].cuisine).toBe('africaine');
    }
  });

  it('exclut les ingrédients indiqués (sans tenir compte des accents)', () => {
    const s = { ...base, excludedIngredients: ['oeuf', 'poulet'] };
    for (const id of allRecipeIds(s)) {
      expect(RECIPES_BY_ID[id!].ingredients.some(([n]) => /œuf|poulet/i.test(n))).toBe(false);
    }
  });

  it('marque un repas comme impossible si aucune recette ne correspond', () => {
    const plan = generatePlan({ ...base, cuisines: ['latino'], restrictions: ['vegan'], maxPrepMinutes: 10 }, 1);
    expect(plan.days[0].meals.dejeuner).toBeNull();
  });

  it('ajuste les portions à l’objectif calorique', () => {
    const light = generatePlan({ ...base, goal: 'perte', dailyKcal: 1600 }, 9);
    const heavy = generatePlan({ ...base, goal: 'masse', dailyKcal: 3000 }, 9);
    const avg = (p: typeof light) => p.days.reduce((s, d) => s + dayNutrition(d).kcal, 0) / p.days.length;
    expect(avg(light)).toBeLessThan(1900);
    expect(avg(heavy)).toBeGreaterThan(2600);
  });
});

describe('isRecipeAllowed', () => {
  it('le régime végan exclut le miel', () => {
    expect(isRecipeAllowed(RECIPES_BY_ID['porridge-banane'], { ...base, restrictions: ['vegan'] })).toBe(false);
    expect(isRecipeAllowed(RECIPES_BY_ID['dal-lentilles'], { ...base, restrictions: ['vegan'] })).toBe(true);
  });
});

describe('swapMeal', () => {
  it('remplace le repas par une autre recette', () => {
    const plan = generatePlan(base, 11);
    const before = plan.days[2].meals.diner!.recipeId;
    const after = swapMeal(plan, base, 2, 'diner', () => 0.5).days[2].meals.diner!.recipeId;
    expect(after).not.toBe(before);
  });
});

describe('buildShoppingList', () => {
  it('les quantités augmentent avec le nombre de personnes', () => {
    const plan = generatePlan(base, 4);
    const total = (people: number) =>
      buildShoppingList(plan, people)
        .flatMap((c) => c.items)
        .filter((i) => i.unit === 'g')
        .reduce((s, i) => s + i.quantity, 0);
    expect(total(4)).toBeGreaterThan(total(2) * 1.8);
  });

  it('additionne un même ingrédient utilisé dans plusieurs repas', () => {
    const plan = {
      days: [
        { date: '2026-11-30', meals: { dejeuner: { recipeId: 'jollof-poulet', portion: 1 } } },
        { date: '2026-12-01', meals: { dejeuner: { recipeId: 'poulet-brocoli', portion: 1 } } },
      ],
    };
    const poulet = buildShoppingList(plan, 1)
      .flatMap((c) => c.items)
      .find((i) => i.name === 'Blanc de poulet')!;
    expect(poulet.quantity).toBe(290); // 140 + 150
    expect(poulet.usedIn).toBe(2);
  });
});
