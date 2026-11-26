import { CUISINE_LABELS, MEAL_LABELS, MEAL_ORDER } from '../data/labels';
import { RECIPES_BY_ID } from '../data/recipes';
import type { MealType } from '../data/types';
import { today } from '../lib/appData';
import { dayNutrition, type Plan } from '../lib/planner';
import { RecipeVisual } from './RecipeVisual';

interface Props {
  plan: Plan;
  dailyKcal: number;
  onOpen: (dayIndex: number, meal: MealType) => void;
  onSwap: (dayIndex: number, meal: MealType) => void;
}

export function formatDay(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', opts);
}

export function MenuView({ plan, dailyKcal, onOpen, onSwap }: Props) {
  const now = today();
  return (
    <div className="days">
      {plan.days.map((day, di) => {
        const kcal = Math.round(dayNutrition(day).kcal);
        const isToday = day.date === now;
        return (
          <section key={day.date} className="day" aria-labelledby={`day-${di}`}>
            <header className="day-header">
              <h2 id={`day-${di}`}>
                {isToday && <span className="badge orange">Aujourd’hui</span>}
                {formatDay(day.date)}
              </h2>
              <span className="kcal-pill" title="Par personne">
                🔥 {kcal} / {dailyKcal} kcal
              </span>
            </header>
            <div className="cards">
              {MEAL_ORDER.filter((m) => m in day.meals).map((m) => {
                const pm = day.meals[m];
                const r = pm ? RECIPES_BY_ID[pm.recipeId] : null;
                if (!r || !pm) {
                  return (
                    <article key={m} className="card empty">
                      <p className="card-meal">{MEAL_LABELS[m]}</p>
                      <p>Aucune recette ne correspond à vos critères pour ce repas.</p>
                      <button className="pill" onClick={() => onSwap(di, m)}>
                        Réessayer
                      </button>
                    </article>
                  );
                }
                return (
                  <article key={m} className={`card meal-${m}`}>
                    <p className="card-meal">{MEAL_LABELS[m]}</p>
                    <h3>
                      <button className="card-title" onClick={() => onOpen(di, m)}>
                        {r.name}
                      </button>
                    </h3>
                    <RecipeVisual recipe={r}>
                      <span className="floating-badge">⏱ {r.prepMinutes} min</span>
                    </RecipeVisual>
                    <div className="card-meta">
                      <span>{CUISINE_LABELS[r.cuisine]}</span>
                      <span>{Math.round(r.nutrition.kcal * pm.portion)} kcal</span>
                      <span>{Math.round(r.nutrition.proteines * pm.portion)} g prot.</span>
                    </div>
                    <div className="card-actions">
                      <button className="pill dark grow" onClick={() => onOpen(di, m)}>
                        Voir la recette <span aria-hidden>→</span>
                      </button>
                      <button className="round" title="Changer ce plat" aria-label={`Changer le ${MEAL_LABELS[m].toLowerCase()} du ${formatDay(day.date)}`} onClick={() => onSwap(di, m)}>
                        ↻
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
