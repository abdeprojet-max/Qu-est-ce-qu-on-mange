import { GOALS } from '../data/labels';
import type { Goal } from '../data/types';
import { dayNutrition, type Plan } from '../lib/planner';
import { formatDay } from './MenuView';

interface Props {
  plan: Plan;
  dailyKcal: number;
  goal: Goal;
  /** Protéines conseillées par le profil (g/jour), si un profil existe. */
  proteinTarget: number | null;
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export function NutritionView({ plan, dailyKcal, goal, proteinTarget }: Props) {
  const rows = plan.days.map((d) => ({ date: d.date, n: dayNutrition(d) }));
  const count = rows.length || 1;
  const avg = rows.reduce(
    (a, { n }) => ({
      kcal: a.kcal + n.kcal / count,
      proteines: a.proteines + n.proteines / count,
      glucides: a.glucides + n.glucides / count,
      lipides: a.lipides + n.lipides / count,
    }),
    { kcal: 0, proteines: 0, glucides: 0, lipides: 0 },
  );
  const macroKcal = avg.proteines * 4 + avg.glucides * 4 + avg.lipides * 9;

  return (
    <div className="nutrition">
      <div className="page-head">
        <div>
          <p className="eyebrow">Suivi nutritionnel</p>
          <h1>Vos apports, jour par jour</h1>
        </div>
      </div>

      <div className="stats">
        <div className="stat dark">
          <span>Moyenne par jour</span>
          <strong>{Math.round(avg.kcal)} kcal</strong>
          <small>
            objectif {dailyKcal} kcal · {GOALS[goal].label.toLowerCase()}
          </small>
        </div>
        <div className="stat lime">
          <span>Protéines</span>
          <strong>{Math.round(avg.proteines)} g</strong>
          <small>
            {proteinTarget ? `objectif ≈ ${proteinTarget} g · ` : ''}
            {pct(avg.proteines * 4, macroKcal)} % des calories
          </small>
        </div>
        <div className="stat">
          <span>Glucides</span>
          <strong>{Math.round(avg.glucides)} g</strong>
          <small>{pct(avg.glucides * 4, macroKcal)} % des calories</small>
        </div>
        <div className="stat">
          <span>Lipides</span>
          <strong>{Math.round(avg.lipides)} g</strong>
          <small>{pct(avg.lipides * 9, macroKcal)} % des calories</small>
        </div>
      </div>

      <div className="panel">
        <h2>Jour par jour (par personne)</h2>
        <ul className="bars">
          {rows.map(({ date, n }) => {
            const ratio = n.kcal / dailyKcal;
            return (
              <li key={date}>
                <span className="bar-label">{formatDay(date)}</span>
                <span className="bar-track" aria-hidden>
                  <span className={`bar-fill ${ratio > 1.1 ? 'over' : ratio < 0.85 ? 'under' : ''}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                </span>
                <span className="bar-value">
                  {Math.round(n.kcal)} kcal · P {Math.round(n.proteines)} g · G {Math.round(n.glucides)} g · L {Math.round(n.lipides)} g
                </span>
              </li>
            );
          })}
        </ul>
        <p className="muted small">
          Valeurs estimées à titre indicatif. Pour un suivi médical, une perte de poids importante ou une prise de masse encadrée, demandez
          conseil à un médecin ou un diététicien.
        </p>
      </div>
    </div>
  );
}
