import type { Goal } from '../data/types';

export type Sex = 'homme' | 'femme';
export type Activity = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres-actif';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  targetWeightKg: number | null;
  /** Si vrai, les calories des menus sont calculées depuis le profil. */
  autoKcal: boolean;
}

export interface WeightEntry {
  date: string; // AAAA-MM-JJ
  kg: number;
}

export const ACTIVITY_LEVELS: Record<Activity, { label: string; hint: string; factor: number }> = {
  sedentaire: { label: 'Sédentaire', hint: 'Travail assis, peu ou pas de sport', factor: 1.2 },
  leger: { label: 'Légèrement actif', hint: 'Sport 1 à 3 fois par semaine', factor: 1.375 },
  modere: { label: 'Modérément actif', hint: 'Sport 3 à 5 fois par semaine', factor: 1.55 },
  actif: { label: 'Très actif', hint: 'Sport intense 6 à 7 fois par semaine', factor: 1.725 },
  'tres-actif': { label: 'Extrêmement actif', hint: 'Travail physique et entraînement quotidien', factor: 1.9 },
};

export const DEFAULT_PROFILE: Profile = {
  sex: 'femme',
  age: 30,
  heightCm: 165,
  weightKg: 65,
  activity: 'leger',
  targetWeightKg: null,
  autoKcal: true,
};

/** Métabolisme de base (formule de Mifflin-St Jeor), en kcal/jour. */
export function basalMetabolism(p: Profile): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'homme' ? 5 : -161);
}

/** Dépense énergétique journalière totale, en kcal/jour. */
export function dailyExpenditure(p: Profile): number {
  return basalMetabolism(p) * ACTIVITY_LEVELS[p.activity].factor;
}

const MIN_KCAL: Record<Sex, number> = { femme: 1200, homme: 1500 };

/** Calories journalières conseillées selon l'objectif, arrondies à 50 kcal. */
export function targetCalories(p: Profile, goal: Goal): number {
  const tdee = dailyExpenditure(p);
  let kcal = tdee;
  if (goal === 'perte') kcal = Math.max(tdee - 500, tdee * 0.8, MIN_KCAL[p.sex]);
  if (goal === 'masse') kcal = tdee + 350;
  return Math.round(kcal / 50) * 50;
}

/** Protéines conseillées en g/jour. */
export function targetProteins(p: Profile, goal: Goal): number {
  const perKg = goal === 'perte' ? 1.6 : goal === 'masse' ? 1.8 : 1.2;
  return Math.round(p.weightKg * perKg);
}

export function bmi(p: Pick<Profile, 'weightKg' | 'heightCm'>): number {
  const m = p.heightCm / 100;
  return p.weightKg / (m * m);
}

export function bmiLabel(value: number): string {
  if (value < 18.5) return 'Insuffisance pondérale';
  if (value < 25) return 'Corpulence normale';
  if (value < 30) return 'Surpoids';
  return 'Obésité';
}

export function isProfileValid(p: Profile): boolean {
  return p.age >= 14 && p.age <= 100 && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 30 && p.weightKg <= 300;
}

/** Ajoute ou remplace la pesée d'une date, triée par date. */
export function upsertWeight(entries: WeightEntry[], entry: WeightEntry): WeightEntry[] {
  return [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date));
}
