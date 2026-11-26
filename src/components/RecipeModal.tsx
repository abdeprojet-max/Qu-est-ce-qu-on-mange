import { useEffect, useRef } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { CUISINE_LABELS } from '../data/labels';
import type { Recipe } from '../data/types';
import { formatRecipeQuantity, scaledNutrition } from '../lib/planner';

interface Props {
  recipe: Recipe;
  portion: number;
  people: number;
  onClose: () => void;
}

export function RecipeModal({ recipe, portion, people, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const n = scaledNutrition(recipe, portion);

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <div className="modal-body">
        <header>
          <div>
            <p className="eyebrow">
              {CUISINE_LABELS[recipe.cuisine]} · {recipe.prepMinutes} min
            </p>
            <h2>{recipe.name}</h2>
          </div>
          <button className="icon" aria-label="Fermer" onClick={() => ref.current?.close()}>
            ✕
          </button>
        </header>

        <p className="muted">
          Pour {people} personne{people > 1 ? 's' : ''} · portion ×{portion.toLocaleString('fr-FR')} · environ{' '}
          {Math.round(n.kcal)} kcal, {Math.round(n.proteines)} g de protéines par personne
        </p>

        <h3>Ingrédients</h3>
        <ul className="ingredients">
          {recipe.ingredients.map(([name, qty]) => (
            <li key={name}>
              <span>{name}</span>
              <span className="qty">{formatRecipeQuantity(qty * portion * people, INGREDIENTS[name].unit)}</span>
            </li>
          ))}
          <li className="muted">
            <span>Sel, poivre</span>
            <span className="qty">selon le goût</span>
          </li>
        </ul>

        <h3>Préparation</h3>
        <ol className="steps">
          {recipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </dialog>
  );
}
