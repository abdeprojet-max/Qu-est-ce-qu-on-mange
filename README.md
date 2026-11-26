# Qu'est-ce qu'on mange ?

Application web qui propose des **menus sur plusieurs jours** et génère automatiquement la **liste de courses** correspondante.

## Fonctionnalités

- **Menus sur 1 à 14 jours** : petit-déjeuner, déjeuner et/ou dîner, sans répéter un plat dans la même journée.
- **Nombre de personnes** : toutes les quantités (recettes et courses) s'ajustent.
- **Objectif** : perte de poids, équilibre ou prise de masse. Les portions sont calculées pour atteindre l'objectif calorique journalier, et les plats riches en protéines sont privilégiés quand c'est pertinent.
- **Cuisines** : africaine, asiatique, arabe/orientale, européenne, indienne, latino.
- **Régimes et allergies** : végétarien, végan, sans porc, sans poisson, sans gluten, sans lactose, sans arachide, et une liste libre d'ingrédients à éviter.
- **Temps de préparation maximum.**
- **Changer un repas** d'un clic (↻) sans regénérer toute la semaine.
- **Fiche recette** avec les quantités ajustées et les étapes.
- **Liste de courses** regroupée par rayon, à cocher, à copier ou imprimer.
- **Suivi nutritionnel** : calories, protéines, glucides et lipides par jour et en moyenne.

Les préférences, le menu et les cases cochées sont mémorisés dans le navigateur.

> Les valeurs nutritionnelles sont des estimations indicatives et ne remplacent pas l'avis d'un professionnel de santé.

## Lancer le projet

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev      # serveur de développement sur http://localhost:5173
npm test         # tests unitaires
npm run build    # version de production dans dist/
```

## Organisation du code

| Fichier | Rôle |
| --- | --- |
| `src/data/recipes.ts` | Les recettes (ingrédients pour 1 portion, nutrition, étapes) |
| `src/data/ingredients.ts` | Catalogue des ingrédients : unité et rayon du magasin |
| `src/data/labels.ts` | Libellés affichés (cuisines, régimes, objectifs) |
| `src/lib/planner.ts` | Génération des menus, portions, liste de courses, nutrition |
| `src/components/` | Interface (préférences, menus, courses, nutrition, fiche recette) |

### Ajouter une recette

1. Ajoutez un objet dans `src/data/recipes.ts` (quantités pour **1 portion**).
2. Si un ingrédient est nouveau, déclarez-le dans `src/data/ingredients.ts` avec son unité et son rayon.
3. Lancez `npm test` : un test vérifie que tous les ingrédients sont bien déclarés.
