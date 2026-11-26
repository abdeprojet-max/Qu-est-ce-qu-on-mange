import type { Cuisine, Goal, MealType, Restriction } from './types';

export const MEAL_LABELS: Record<MealType, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
};

export const MEAL_ORDER: MealType[] = ['petit-dejeuner', 'dejeuner', 'diner'];

export const CUISINE_LABELS: Record<Cuisine, string> = {
  africaine: 'Africaine',
  asiatique: 'Asiatique',
  arabe: 'Arabe / orientale',
  europeenne: 'Européenne',
  indienne: 'Indienne',
  latino: 'Latino',
};

export const RESTRICTION_LABELS: Record<Restriction, string> = {
  vegetarien: 'Végétarien',
  vegan: 'Végan',
  'sans-porc': 'Sans porc',
  'sans-poisson': 'Sans poisson ni fruits de mer',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose',
  'sans-arachide': 'Sans arachide',
};

export const GOALS: Record<Goal, { label: string; description: string; defaultKcal: number }> = {
  perte: {
    label: 'Perte de poids',
    description: 'Portions plus légères, plats riches en protéines privilégiés.',
    defaultKcal: 1700,
  },
  equilibre: {
    label: 'Équilibre',
    description: 'Portions standard, menus variés.',
    defaultKcal: 2100,
  },
  masse: {
    label: 'Prise de masse',
    description: 'Portions plus copieuses, plats protéinés privilégiés.',
    defaultKcal: 2800,
  },
};
