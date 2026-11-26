export type MealType = 'petit-dejeuner' | 'dejeuner' | 'diner';

export type Cuisine = 'africaine' | 'asiatique' | 'arabe' | 'europeenne' | 'indienne' | 'latino';

/** Ce qu'une recette contient : sert à appliquer les régimes et allergies. */
export type Contains =
  | 'viande'
  | 'volaille'
  | 'porc'
  | 'poisson'
  | 'fruits-de-mer'
  | 'oeuf'
  | 'lactose'
  | 'gluten'
  | 'arachide'
  | 'sesame';

export type Restriction =
  | 'vegetarien'
  | 'vegan'
  | 'sans-porc'
  | 'sans-poisson'
  | 'sans-gluten'
  | 'sans-lactose'
  | 'sans-arachide';

export type Goal = 'perte' | 'equilibre' | 'masse';

export type Unit = 'g' | 'ml' | 'pièce' | 'gousse' | 'c. à s.' | 'c. à c.' | 'pincée';

export type Category =
  | 'Fruits & légumes'
  | 'Viandes & poissons'
  | 'Crèmerie & œufs'
  | 'Féculents & céréales'
  | 'Légumineuses & conserves'
  | 'Placard (épices, huiles, sauces)';

export interface Nutrition {
  kcal: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

/** [nom de l'ingrédient (clé du catalogue), quantité pour 1 portion] */
export type RecipeIngredient = [name: string, qty: number];

export interface Recipe {
  id: string;
  name: string;
  cuisine: Cuisine;
  mealTypes: MealType[];
  prepMinutes: number;
  contains: Contains[];
  /** Valeurs nutritionnelles approximatives pour 1 portion standard. */
  nutrition: Nutrition;
  ingredients: RecipeIngredient[];
  steps: string[];
}
