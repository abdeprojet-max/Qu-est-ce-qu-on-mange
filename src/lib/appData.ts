import { GOALS, MEAL_ORDER } from '../data/labels';
import { RECIPES_BY_ID } from '../data/recipes';
import { generatePlan, type Plan, type Settings } from './planner';
import { DEFAULT_PROFILE, type Profile, type WeightEntry } from './profile';
import { loadRaw, save } from './storage';

export interface SavedPlan {
  plan: Plan;
  /** Empreinte des préférences utilisées pour générer ce menu. */
  key: string;
}

/** Tout ce que l'utilisateur retrouve sur ses appareils. */
export interface AppData {
  version: 1;
  settings: Settings;
  saved: SavedPlan;
  checked: Record<string, boolean>;
  profile: Profile | null;
  weights: WeightEntry[];
}

export function today(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const DEFAULT_SETTINGS: Settings = {
  days: 7,
  startDate: today(),
  people: 2,
  meals: ['dejeuner', 'diner'],
  cuisines: [],
  restrictions: [],
  excludedIngredients: [],
  goal: 'equilibre',
  dailyKcal: GOALS.equilibre.defaultKcal,
  maxPrepMinutes: null,
};

/** Préférences qui changent le choix des recettes (le reste s'applique en direct). */
export const selectionKey = (s: Settings) =>
  JSON.stringify([s.days, s.startDate, s.meals, s.cuisines, s.restrictions, s.excludedIngredients, s.goal, s.maxPrepMinutes]);

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

function isValidPlan(p: unknown): p is SavedPlan {
  const sp = p as SavedPlan | null;
  return (
    !!sp?.plan?.days?.length &&
    typeof sp.key === 'string' &&
    sp.plan.days.every(
      (d) => d && typeof d.date === 'string' && Object.values(d.meals ?? {}).every((m) => m === null || !!RECIPES_BY_ID[m?.recipeId]),
    )
  );
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Remet d'aplomb des données venant du navigateur ou du serveur (versions anciennes, champs manquants). */
export function sanitize(raw: unknown): AppData {
  const r = isObj(raw) ? raw : {};
  const settings: Settings = { ...DEFAULT_SETTINGS, ...(isObj(r.settings) ? (r.settings as Partial<Settings>) : {}) };
  settings.meals = MEAL_ORDER.filter((m) => settings.meals?.includes(m));
  if (!settings.meals.length) settings.meals = DEFAULT_SETTINGS.meals;
  const saved = isValidPlan(r.saved)
    ? r.saved
    : { plan: generatePlan(settings, newSeed()), key: selectionKey(settings) };
  const profile = isObj(r.profile) ? { ...DEFAULT_PROFILE, ...(r.profile as Partial<Profile>) } : null;
  const weights = Array.isArray(r.weights)
    ? (r.weights as WeightEntry[]).filter((w) => w && typeof w.date === 'string' && typeof w.kg === 'number')
    : [];
  const checked = isObj(r.checked) ? (r.checked as Record<string, boolean>) : {};
  return { version: 1, settings, saved, checked, profile, weights };
}

const KEY = 'qcom:data';

export function loadLocal(): AppData {
  const current = loadRaw<unknown>(KEY);
  if (current) return sanitize(current);
  // Reprise des données de la première version de l'app.
  return sanitize({
    settings: loadRaw('qcom:settings'),
    saved: loadRaw('qcom:plan'),
    checked: loadRaw('qcom:checked'),
  });
}

export function saveLocal(data: AppData): void {
  save(KEY, data);
}
