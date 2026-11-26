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
- **Profil personnel** : sexe, âge, taille, poids, activité et poids visé. Les calories des menus sont calculées automatiquement (formule de Mifflin-St Jeor) et l'IMC et les protéines conseillées sont affichés.
- **Suivi du poids** : pesées datées et courbe d'évolution avec l'objectif.
- **Comptes utilisateurs** (optionnel, via Supabase) : menus, liste de courses, profil et pesées synchronisés sur tous les appareils.

Sans compte, tout est enregistré dans le navigateur.

> Les valeurs nutritionnelles sont des estimations indicatives et ne remplacent pas l'avis d'un professionnel de santé.

## Lancer le projet

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev      # serveur de développement sur http://localhost:5173
npm test         # tests unitaires
npm run build    # version de production dans dist/
```

## Activer les comptes utilisateurs (Supabase)

L'app fonctionne sans cette étape. Pour activer la connexion :

1. Créez un compte gratuit sur [supabase.com](https://supabase.com), puis **New project**.
2. Dans le projet : **SQL Editor → New query**, collez le contenu de [`supabase/schema.sql`](supabase/schema.sql) et cliquez sur **Run**.
3. **Authentication → URL Configuration** : mettez l'adresse de votre site Vercel dans **Site URL** (ex. `https://qu-est-ce-qu-on-mange.vercel.app`) et ajoutez-la aussi dans **Redirect URLs**.
4. Récupérez deux informations :
   - la **Project URL** (`https://xxxx.supabase.co`) : bouton **Connect** en haut du projet, ou **Project Settings → Data API** ;
   - la **Publishable key** (`sb_publishable_…`) : **Project Settings → API Keys**.
   ⚠️ N'utilisez jamais la **Secret key** dans l'app.
5. Sur Vercel : **Settings → Environment Variables**, ajoutez :
   - `VITE_SUPABASE_URL` = la Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = la Publishable key
6. Redéployez sur Vercel (**Deployments → ⋯ → Redeploy**).

La Publishable key peut être publique : chaque utilisateur n'a accès qu'à ses propres données grâce aux règles de sécurité (RLS) créées à l'étape 2.

## Organisation du code

| Fichier | Rôle |
| --- | --- |
| `src/data/recipes.ts` | Les recettes (ingrédients pour 1 portion, nutrition, étapes) |
| `src/data/ingredients.ts` | Catalogue des ingrédients : unité et rayon du magasin |
| `src/data/labels.ts` | Libellés affichés (cuisines, régimes, objectifs) |
| `src/lib/planner.ts` | Génération des menus, portions, liste de courses, nutrition |
| `src/lib/profile.ts` | Calcul des besoins (métabolisme, calories, protéines, IMC) |
| `src/lib/useCloudSync.ts` | Connexion et synchronisation avec Supabase |
| `src/data/visuals.ts` | Illustrations des plats et emplacement pour vos photos |
| `supabase/schema.sql` | Table et règles de sécurité de la base de données |
| `src/components/` | Interface (préférences, menus, courses, nutrition, fiche recette) |

### Ajouter des photos de plats

Déposez une image dans `public/photos/` (ex. `public/photos/yassa-poulet.jpg`), puis dans `src/data/visuals.ts` ajoutez `'yassa-poulet': '/photos/yassa-poulet.jpg'` à `RECIPE_PHOTOS`. Utilisez des photos dont vous avez les droits.

### Ajouter une recette

1. Ajoutez un objet dans `src/data/recipes.ts` (quantités pour **1 portion**).
2. Si un ingrédient est nouveau, déclarez-le dans `src/data/ingredients.ts` avec son unité et son rayon.
3. Lancez `npm test` : un test vérifie que tous les ingrédients sont bien déclarés.
