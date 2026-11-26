import type { Recipe } from '../data/types';
import { CUISINE_GRADIENT, RECIPE_EMOJI, RECIPE_PHOTOS } from '../data/visuals';

interface Props {
  recipe: Recipe;
  size?: 'card' | 'banner' | 'thumb';
  children?: React.ReactNode;
}

/** Visuel d'un plat : photo si disponible, sinon assiette illustrée aux couleurs de la cuisine. */
export function RecipeVisual({ recipe, size = 'card', children }: Props) {
  const photo = RECIPE_PHOTOS[recipe.id];
  const [from, to] = CUISINE_GRADIENT[recipe.cuisine];
  return (
    <div className={`visual visual-${size}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {photo ? (
        <img src={photo} alt={recipe.name} loading="lazy" />
      ) : (
        <span className="plate" aria-hidden>
          <span className="plate-inner">{RECIPE_EMOJI[recipe.id] ?? '🍽️'}</span>
        </span>
      )}
      {children}
    </div>
  );
}
