import { INGREDIENTS } from '../data/ingredients';
import { CUISINE_LABELS } from '../data/labels';
import type { Recipe } from '../data/types';
import { formatRecipeQuantity, scaledNutrition } from '../lib/planner';
import { Modal } from './Modal';
import { RecipeVisual } from './RecipeVisual';

interface Props {
  recipe: Recipe;
  portion: number;
  people: number;
  onClose: () => void;
}

export function RecipeModal({ recipe, portion, people, onClose }: Props) {
  const n = scaledNutrition(recipe, portion);
  return (
    <Modal onClose={onClose} label={recipe.name} className="modal recipe-modal">
      {(close) => (
        <>
          <RecipeVisual recipe={recipe} size="banner">
            <button className="round close" aria-label="Fermer" onClick={close}>
              ✕
            </button>
          </RecipeVisual>
          <div className="modal-body">
            <p className="eyebrow">{CUISINE_LABELS[recipe.cuisine]}</p>
            <h2>{recipe.name}</h2>

            <div className="facts">
              <div>
                <span aria-hidden>⏱</span>
                <strong>{recipe.prepMinutes} min</strong>
                <small>Temps total</small>
              </div>
              <div>
                <span aria-hidden>👥</span>
                <strong>{people}</strong>
                <small>Personne{people > 1 ? 's' : ''}</small>
              </div>
              <div>
                <span aria-hidden>🍽️</span>
                <strong>×{portion.toLocaleString('fr-FR')}</strong>
                <small>Portion</small>
              </div>
            </div>

            <div className="recipe-grid">
              <section>
                <h3>Ingrédients</h3>
                <ul className="ingredients">
                  {recipe.ingredients.map(([name, qty]) => (
                    <li key={name}>
                      <span className="tick" aria-hidden>
                        ✓
                      </span>
                      <span className="name">{name}</span>
                      <span className="qty">{formatRecipeQuantity(qty * portion * people, INGREDIENTS[name].unit)}</span>
                    </li>
                  ))}
                  <li className="muted">
                    <span className="tick" aria-hidden>
                      ✓
                    </span>
                    <span className="name">Sel, poivre</span>
                    <span className="qty">selon le goût</span>
                  </li>
                </ul>
              </section>
              <aside className="nutri-box">
                <h3>Valeurs nutritionnelles</h3>
                <p className="muted small">par personne</p>
                <dl>
                  <div>
                    <dt>Calories</dt>
                    <dd>{Math.round(n.kcal)} kcal</dd>
                  </div>
                  <div>
                    <dt>Protéines</dt>
                    <dd>{Math.round(n.proteines)} g</dd>
                  </div>
                  <div>
                    <dt>Glucides</dt>
                    <dd>{Math.round(n.glucides)} g</dd>
                  </div>
                  <div>
                    <dt>Lipides</dt>
                    <dd>{Math.round(n.lipides)} g</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <h3>Préparation</h3>
            <ol className="steps">
              {recipe.steps.map((s, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </Modal>
  );
}
