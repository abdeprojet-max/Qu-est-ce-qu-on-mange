import type { Cuisine } from './types';

/** Illustration de chaque plat (en attendant de vraies photos). */
export const RECIPE_EMOJI: Record<string, string> = {
  'porridge-banane': '🥣',
  'omelette-legumes': '🍳',
  chakchouka: '🍳',
  'bouillie-mil': '🥣',
  congee: '🍚',
  'fromage-blanc-fruits': '🍓',
  'tartine-avocat-oeuf': '🥑',
  'yassa-poulet': '🍗',
  'mafe-boeuf': '🥜',
  thieboudienne: '🐟',
  'jollof-poulet': '🍛',
  'red-red': '🫘',
  'attieke-poisson': '🐟',
  'poulet-brocoli': '🥦',
  'pad-thai': '🍜',
  'bibimbap-tofu': '🍲',
  'pho-boeuf': '🍜',
  'saumon-teriyaki': '🍣',
  'nouilles-tofu': '🥢',
  'couscous-poulet': '🥘',
  'tajine-poulet-citron': '🍋',
  harira: '🥣',
  'tajine-kefta': '🧆',
  'falafel-taboule': '🧆',
  mujaddara: '🍚',
  'fattouch-poulet': '🥗',
  'saumon-papillote': '🐟',
  'ratatouille-quinoa': '🍆',
  'spaghetti-bolognaise': '🍝',
  'poulet-roti': '🍗',
  'salade-nicoise': '🥗',
  'risotto-champignons': '🍄',
  'dal-lentilles': '🍛',
  'poulet-tikka': '🍛',
  'chili-con-carne': '🌶️',
  'burrito-bowl': '🌯',
};

/**
 * Photos optionnelles : déposez un fichier dans `public/photos/<id>.jpg`
 * puis ajoutez son id ici pour qu'il remplace l'illustration.
 */
export const RECIPE_PHOTOS: Record<string, string> = {};

export const CUISINE_GRADIENT: Record<Cuisine, [string, string]> = {
  africaine: ['#ffb347', '#f2622e'],
  asiatique: ['#ff8a80', '#e0457b'],
  arabe: ['#f7d77a', '#e39b2d'],
  europeenne: ['#d9f27a', '#7cc35a'],
  indienne: ['#ffd36b', '#f28c28'],
  latino: ['#ff9f68', '#d94a3d'],
};
