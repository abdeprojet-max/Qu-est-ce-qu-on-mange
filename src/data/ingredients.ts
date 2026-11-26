import type { Category, Unit } from './types';

export interface IngredientInfo {
  unit: Unit;
  category: Category;
}

const FL: Category = 'Fruits & légumes';
const VP: Category = 'Viandes & poissons';
const CO: Category = 'Crèmerie & œufs';
const FC: Category = 'Féculents & céréales';
const LC: Category = 'Légumineuses & conserves';
const PL: Category = 'Placard (épices, huiles, sauces)';

/**
 * Catalogue des ingrédients. Chaque ingrédient a une seule unité,
 * ce qui permet d'additionner les quantités dans la liste de courses.
 */
export const INGREDIENTS: Record<string, IngredientInfo> = {
  // Fruits & légumes
  Ail: { unit: 'gousse', category: FL },
  Aubergine: { unit: 'pièce', category: FL },
  Avocat: { unit: 'pièce', category: FL },
  Banane: { unit: 'pièce', category: FL },
  'Banane plantain': { unit: 'pièce', category: FL },
  Brocoli: { unit: 'g', category: FL },
  Carotte: { unit: 'pièce', category: FL },
  Champignons: { unit: 'g', category: FL },
  Chou: { unit: 'g', category: FL },
  Citron: { unit: 'pièce', category: FL },
  'Citron vert': { unit: 'pièce', category: FL },
  Concombre: { unit: 'pièce', category: FL },
  Coriandre: { unit: 'g', category: FL },
  Courgette: { unit: 'pièce', category: FL },
  Épinards: { unit: 'g', category: FL },
  'Fruits rouges': { unit: 'g', category: FL },
  Gingembre: { unit: 'g', category: FL },
  'Haricots verts': { unit: 'g', category: FL },
  Menthe: { unit: 'g', category: FL },
  Navet: { unit: 'pièce', category: FL },
  Oignon: { unit: 'pièce', category: FL },
  'Oignon nouveau': { unit: 'pièce', category: FL },
  'Patate douce': { unit: 'g', category: FL },
  Persil: { unit: 'g', category: FL },
  Piment: { unit: 'pièce', category: FL },
  Poivron: { unit: 'pièce', category: FL },
  'Pomme de terre': { unit: 'g', category: FL },
  'Pousses de soja': { unit: 'g', category: FL },
  'Salade verte': { unit: 'g', category: FL },
  Tomate: { unit: 'pièce', category: FL },

  // Viandes & poissons
  'Blanc de poulet': { unit: 'g', category: VP },
  'Bœuf (morceaux)': { unit: 'g', category: VP },
  'Bœuf haché': { unit: 'g', category: VP },
  Crevettes: { unit: 'g', category: VP },
  'Cuisse de poulet': { unit: 'pièce', category: VP },
  'Poisson blanc': { unit: 'g', category: VP },
  Saumon: { unit: 'g', category: VP },

  // Crèmerie & œufs
  Beurre: { unit: 'g', category: CO },
  'Crème fraîche': { unit: 'ml', category: CO },
  Feta: { unit: 'g', category: CO },
  'Fromage blanc': { unit: 'g', category: CO },
  Lait: { unit: 'ml', category: CO },
  Parmesan: { unit: 'g', category: CO },
  'Yaourt nature': { unit: 'g', category: CO },
  Œuf: { unit: 'pièce', category: CO },

  // Féculents & céréales
  Attiéké: { unit: 'g', category: FC },
  Boulgour: { unit: 'g', category: FC },
  "Flocons d'avoine": { unit: 'g', category: FC },
  'Mil (semoule)': { unit: 'g', category: FC },
  Muesli: { unit: 'g', category: FC },
  'Nouilles de riz': { unit: 'g', category: FC },
  'Pain complet': { unit: 'g', category: FC },
  'Pain pita': { unit: 'pièce', category: FC },
  Pâtes: { unit: 'g', category: FC },
  Quinoa: { unit: 'g', category: FC },
  Riz: { unit: 'g', category: FC },
  'Riz arborio': { unit: 'g', category: FC },
  'Riz brisé': { unit: 'g', category: FC },
  'Semoule de couscous': { unit: 'g', category: FC },
  Spaghetti: { unit: 'g', category: FC },

  // Légumineuses & conserves
  'Citron confit': { unit: 'pièce', category: LC },
  'Concentré de tomate': { unit: 'g', category: LC },
  'Haricots rouges (cuits)': { unit: 'g', category: LC },
  'Lait de coco': { unit: 'ml', category: LC },
  'Lentilles corail': { unit: 'g', category: LC },
  'Lentilles vertes': { unit: 'g', category: LC },
  'Maïs (conserve)': { unit: 'g', category: LC },
  Olives: { unit: 'g', category: LC },
  "Pâte d'arachide": { unit: 'g', category: LC },
  'Pois chiches (cuits)': { unit: 'g', category: LC },
  'Thon au naturel': { unit: 'g', category: LC },
  Tofu: { unit: 'g', category: LC },
  'Tomates concassées': { unit: 'g', category: LC },
  Cacahuètes: { unit: 'g', category: LC },

  // Placard
  'Bouillon cube': { unit: 'pièce', category: PL },
  Cannelle: { unit: 'c. à c.', category: PL },
  Cumin: { unit: 'c. à c.', category: PL },
  Curcuma: { unit: 'c. à c.', category: PL },
  'Curry en poudre': { unit: 'c. à c.', category: PL },
  'Garam masala': { unit: 'c. à c.', category: PL },
  'Graines de sésame': { unit: 'c. à c.', category: PL },
  'Herbes de Provence': { unit: 'c. à c.', category: PL },
  "Huile d'olive": { unit: 'c. à s.', category: PL },
  'Huile végétale': { unit: 'c. à s.', category: PL },
  Miel: { unit: 'c. à s.', category: PL },
  Moutarde: { unit: 'c. à c.', category: PL },
  Muscade: { unit: 'pincée', category: PL },
  Paprika: { unit: 'c. à c.', category: PL },
  'Pâte de piment': { unit: 'c. à s.', category: PL },
  'Ras el hanout': { unit: 'c. à c.', category: PL },
  'Sauce nuoc-mâm': { unit: 'c. à s.', category: PL },
  'Sauce soja': { unit: 'c. à s.', category: PL },
  Sucre: { unit: 'g', category: PL },
  Tahini: { unit: 'c. à s.', category: PL },
  Vinaigre: { unit: 'c. à s.', category: PL },
};

export const CATEGORY_ORDER: Category[] = [FL, VP, CO, FC, LC, PL];
