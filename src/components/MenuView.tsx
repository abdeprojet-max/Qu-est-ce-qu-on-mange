import { CUISINE_LABELS, MEAL_LABELS, MEAL_ORDER } from '../data/labels';
import { RECIPES_BY_ID } from '../data/recipes';
import type { MealType } from '../data/types';
import { dayNutrition, type Plan } from '../lib/planner';

interface Props {
  plan: Plan;
  dailyKcal: number;
  onOpen: (dayIndex: number, meal: MealType) => void;
  onSwap: (dayIndex: number, meal: MealType) => void;
}

export function formatDay(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function MenuView({ plan, dailyKcal, onOpen, onSwap }: Props) {
  return (
    <div className="days">
      {plan.days.map((day, di) => {
        const kcal = Math.round(dayNutrition(day).kcal);
        return (
          <article key={day.date} className="panel day">
            <header>
              <h3>{formatDay(day.date)}</h3>
              <span className="muted" title="Par personne">
                {kcal} / {dailyKcal} kcal
              </span>
            </header>
            <ul>
              {MEAL_ORDER.filter((m) => m in day.meals).map((m) => {
                const pm = day.meals[m];
                const r = pm ? RECIPES_BY_ID[pm.recipeId] : null;
                return (
                  <li key={m} className="meal">
                    <span className="meal-type">{MEAL_LABELS[m]}</span>
                    {r && pm ? (
                      <>
                        <button className="meal-name" onClick={() => onOpen(di, m)}>
                          {r.name}
                        </button>
                        <span className="meal-meta">
                          <span className={`tag cuisine-${r.cuisine}`}>{CUISINE_LABELS[r.cuisine]}</span>
                          {r.prepMinutes} min · {Math.round(r.nutrition.kcal * pm.portion)} kcal
                        </span>
                      </>
                    ) : (
                      <span className="meal-name warn">Aucune recette ne correspond à vos critères</span>
                    )}
                    <button className="icon" title="Changer ce repas" aria-label={`Changer le ${MEAL_LABELS[m]}`} onClick={() => onSwap(di, m)}>
                      ↻
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
