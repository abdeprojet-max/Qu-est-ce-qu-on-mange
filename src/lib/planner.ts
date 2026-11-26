import { CATEGORY_ORDER, INGREDIENTS } from '../data/ingredients';
import { MEAL_ORDER } from '../data/labels';
import { RECIPES, RECIPES_BY_ID } from '../data/recipes';
import type {
  Category,
  Contains,
  Cuisine,
  Goal,
  MealType,
  Nutrition,
  Recipe,
  Restriction,
  Unit,
} from '../data/types';

export interface Settings {
  days: number;
  startDate: string; // AAAA-MM-JJ
  people: number;
  meals: MealType[];
  cuisines: Cuisine[]; // vide = toutes
  restrictions: Restriction[];
  excludedIngredients: string[];
  goal: Goal;
  /** Objectif calorique journalier par personne. */
  dailyKcal: number;
  /** Temps de préparation maximum en minutes (null = pas de limite). */
  maxPrepMinutes: number | null;
}

export interface PlannedMeal {
  recipeId: string;
  /** Multiplicateur de portion par personne (1 = portion standard). */
  portion: number;
}

export interface DayPlan {
  date: string;
  meals: Partial<Record<MealType, PlannedMeal | null>>;
}

export interface Plan {
  days: DayPlan[];
}

// ─────────────── Filtres ───────────────

const RESTRICTION_EXCLUDES: Record<Restriction, Contains[]> = {
  vegetarien: ['viande', 'volaille', 'porc', 'poisson', 'fruits-de-mer'],
  vegan: ['viande', 'volaille', 'porc', 'poisson', 'fruits-de-mer', 'oeuf', 'lactose'],
  'sans-porc': ['porc'],
  'sans-poisson': ['poisson', 'fruits-de-mer'],
  'sans-gluten': ['gluten'],
  'sans-lactose': ['lactose'],
  'sans-arachide': ['arachide'],
};

/** Ingrédients d'origine animale non couverts par `contains`. */
const NON_VEGAN_INGREDIENTS = ['Miel', 'Beurre'];

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .trim();
}

export function isRecipeAllowed(recipe: Recipe, settings: Settings): boolean {
  for (const r of settings.restrictions) {
    if (RESTRICTION_EXCLUDES[r].some((c) => recipe.contains.includes(c))) return false;
    if (r === 'vegan' && recipe.ingredients.some(([n]) => NON_VEGAN_INGREDIENTS.includes(n))) return false;
  }
  const excluded = settings.excludedIngredients.map(normalize).filter(Boolean);
  if (excluded.length && recipe.ingredients.some(([n]) => excluded.some((e) => normalize(n).includes(e)))) {
    return false;
  }
  if (settings.maxPrepMinutes != null && recipe.prepMinutes > settings.maxPrepMinutes) return false;
  return true;
}

export function candidatesFor(mealType: MealType, settings: Settings, recipes: Recipe[] = RECIPES): Recipe[] {
  const allowed = recipes.filter((r) => r.mealTypes.includes(mealType) && isRecipeAllowed(r, settings));
  if (settings.cuisines.length === 0) return allowed;
  const byCuisine = allowed.filter((r) => settings.cuisines.includes(r.cuisine));
  // Le petit-déjeuner reste possible même si aucune recette de la cuisine choisie n'existe.
  return byCuisine.length > 0 ? byCuisine : mealType === 'petit-dejeuner' ? allowed : [];
}

// ─────────────── Portions ───────────────

const MEAL_SHARE: Record<MealType, number> = { 'petit-dejeuner': 0.25, dejeuner: 0.4, diner: 0.35 };

export function portionFor(recipe: Recipe, mealType: MealType, settings: Settings): number {
  const totalShare = settings.meals.reduce((s, m) => s + MEAL_SHARE[m], 0) || 1;
  const targetKcal = (settings.dailyKcal * MEAL_SHARE[mealType]) / totalShare;
  const raw = targetKcal / recipe.nutrition.kcal;
  const clamped = Math.min(2, Math.max(0.6, raw));
  return Math.round(clamped * 10) / 10;
}

// ─────────────── Génération ───────────────

/** Générateur pseudo-aléatoire reproductible (mulberry32). */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function proteinRatio(r: Recipe): number {
  return (r.nutrition.proteines * 4) / r.nutrition.kcal;
}

function goalWeight(r: Recipe, goal: Goal): number {
  const ratio = proteinRatio(r) / 0.2; // ≈1 pour un plat moyen
  if (goal === 'perte') return ratio ** 2;
  if (goal === 'masse') return ratio ** 1.5;
  return 1;
}

function pickRecipe(
  candidates: Recipe[],
  goal: Goal,
  usage: Map<string, number>,
  avoid: Set<string>,
  rng: () => number,
): Recipe | null {
  const pool = candidates.filter((r) => !avoid.has(r.id));
  const list = pool.length ? pool : candidates;
  if (!list.length) return null;
  const weights = list.map((r) => goalWeight(r, goal) / (1 + 4 * (usage.get(r.id) ?? 0)));
  const total = weights.reduce((a, b) => a + b, 0);
  let x = rng() * total;
  for (let i = 0; i < list.length; i++) {
    x -= weights[i];
    if (x <= 0) return list[i];
  }
  return list[list.length - 1];
}

export function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function generatePlan(settings: Settings, seed: number, recipes: Recipe[] = RECIPES): Plan {
  const rng = createRng(seed);
  const usage = new Map<string, number>();
  const meals = MEAL_ORDER.filter((m) => settings.meals.includes(m));
  const candidates = Object.fromEntries(meals.map((m) => [m, candidatesFor(m, settings, recipes)])) as Record<
    MealType,
    Recipe[]
  >;

  const days: DayPlan[] = [];
  for (let d = 0; d < settings.days; d++) {
    const dayMeals: DayPlan['meals'] = {};
    const usedToday = new Set<string>();
    for (const m of meals) {
      const r = pickRecipe(candidates[m], settings.goal, usage, usedToday, rng);
      if (r) {
        usage.set(r.id, (usage.get(r.id) ?? 0) + 1);
        usedToday.add(r.id);
        dayMeals[m] = { recipeId: r.id, portion: portionFor(r, m, settings) };
      } else {
        dayMeals[m] = null;
      }
    }
    days.push({ date: addDays(settings.startDate, d), meals: dayMeals });
  }
  return { days };
}

/** Remplace un repas par une autre recette compatible. */
export function swapMeal(
  plan: Plan,
  settings: Settings,
  dayIndex: number,
  mealType: MealType,
  rng: () => number = Math.random,
  recipes: Recipe[] = RECIPES,
): Plan {
  const usage = new Map<string, number>();
  for (const day of plan.days) {
    for (const pm of Object.values(day.meals)) {
      if (pm) usage.set(pm.recipeId, (usage.get(pm.recipeId) ?? 0) + 1);
    }
  }
  const day = plan.days[dayIndex];
  const avoid = new Set(
    Object.values(day.meals)
      .filter((pm): pm is PlannedMeal => !!pm)
      .map((pm) => pm.recipeId),
  );
  const r = pickRecipe(candidatesFor(mealType, settings, recipes), settings.goal, usage, avoid, rng);
  const days = plan.days.map((d, i) =>
    i === dayIndex
      ? { ...d, meals: { ...d.meals, [mealType]: r ? { recipeId: r.id, portion: portionFor(r, mealType, settings) } : null } }
      : d,
  );
  return { days };
}

/** Recalcule les portions (ex. après changement d'objectif calorique) sans changer les recettes. */
export function recomputePortions(plan: Plan, settings: Settings): Plan {
  return {
    days: plan.days.map((d) => ({
      ...d,
      meals: Object.fromEntries(
        Object.entries(d.meals).map(([m, pm]) => {
          const r = pm && RECIPES_BY_ID[pm.recipeId];
          return [m, pm && r ? { ...pm, portion: portionFor(r, m as MealType, settings) } : pm];
        }),
      ),
    })),
  };
}

// ─────────────── Nutrition ───────────────

export function scaledNutrition(recipe: Recipe, portion: number): Nutrition {
  const n = recipe.nutrition;
  return {
    kcal: n.kcal * portion,
    proteines: n.proteines * portion,
    glucides: n.glucides * portion,
    lipides: n.lipides * portion,
  };
}

/** Apports d'une journée, par personne. */
export function dayNutrition(day: DayPlan): Nutrition {
  const total: Nutrition = { kcal: 0, proteines: 0, glucides: 0, lipides: 0 };
  for (const pm of Object.values(day.meals)) {
    const r = pm && RECIPES_BY_ID[pm.recipeId];
    if (!pm || !r) continue;
    const n = scaledNutrition(r, pm.portion);
    total.kcal += n.kcal;
    total.proteines += n.proteines;
    total.glucides += n.glucides;
    total.lipides += n.lipides;
  }
  return total;
}

// ─────────────── Liste de courses ───────────────

export interface ShoppingItem {
  name: string;
  unit: Unit;
  quantity: number;
  /** Nombre de repas qui utilisent cet ingrédient. */
  usedIn: number;
}

export interface ShoppingCategory {
  category: Category;
  items: ShoppingItem[];
}

export function roundQuantity(qty: number, unit: Unit): number {
  switch (unit) {
    case 'g':
    case 'ml':
      if (qty < 50) return Math.ceil(qty / 5) * 5;
      if (qty < 500) return Math.ceil(qty / 10) * 10;
      return Math.ceil(qty / 50) * 50;
    case 'pièce':
    case 'gousse':
      return qty <= 0.5 ? 0.5 : Math.ceil(qty);
    default:
      return Math.max(0.5, Math.ceil(qty * 2) / 2);
  }
}

export function formatQuantity(qty: number, unit: Unit): string {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  if (unit === 'g' && qty >= 1000) return `${fmt(qty / 1000)} kg`;
  if (unit === 'ml' && qty >= 1000) return `${fmt(qty / 1000)} L`;
  if (unit === 'pièce') return fmt(qty);
  if (unit === 'gousse') return `${fmt(qty)} gousse${qty > 1 ? 's' : ''}`;
  if (unit === 'pincée') return `${fmt(qty)} pincée${qty > 1 ? 's' : ''}`;
  if (unit === 'c. à s.' && qty >= 8) {
    const ml = qty * 15;
    return `${fmt(qty)} c. à s. (≈ ${ml >= 1000 ? `${fmt(Math.round(ml / 100) / 10)} L` : `${Math.round(ml / 10) * 10} ml`})`;
  }
  return `${fmt(qty)} ${unit}`;
}

/** Quantité affichée dans une recette (arrondi pratique en cuisine). */
export function formatRecipeQuantity(qty: number, unit: Unit): string {
  let rounded: number;
  if (unit === 'g' || unit === 'ml') rounded = Math.max(1, qty >= 20 ? Math.round(qty / 5) * 5 : Math.round(qty));
  else if (unit === 'pièce' || unit === 'gousse') rounded = qty >= 3 ? Math.round(qty) : Math.max(0.25, Math.round(qty * 4) / 4);
  else rounded = Math.max(0.5, Math.round(qty * 2) / 2);
  return formatQuantity(rounded, unit);
}

export function buildShoppingList(plan: Plan, people: number): ShoppingCategory[] {
  const totals = new Map<string, { qty: number; usedIn: number }>();
  for (const day of plan.days) {
    for (const pm of Object.values(day.meals)) {
      const r = pm && RECIPES_BY_ID[pm.recipeId];
      if (!pm || !r) continue;
      for (const [name, qty] of r.ingredients) {
        const t = totals.get(name) ?? { qty: 0, usedIn: 0 };
        t.qty += qty * pm.portion * people;
        t.usedIn += 1;
        totals.set(name, t);
      }
    }
  }

  const byCategory = new Map<Category, ShoppingItem[]>();
  for (const [name, { qty, usedIn }] of totals) {
    const info = INGREDIENTS[name];
    if (!info) throw new Error(`Ingrédient inconnu dans le catalogue : ${name}`);
    const items = byCategory.get(info.category) ?? [];
    items.push({ name, unit: info.unit, quantity: roundQuantity(qty, info.unit), usedIn });
    byCategory.set(info.category, items);
  }

  return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => ({
    category,
    items: byCategory.get(category)!.sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  }));
}

export function shoppingListAsText(list: ShoppingCategory[]): string {
  return list
    .map(
      (c) =>
        `${c.category}\n` + c.items.map((i) => `- ${i.name} : ${formatQuantity(i.quantity, i.unit)}`).join('\n'),
    )
    .join('\n\n');
}
