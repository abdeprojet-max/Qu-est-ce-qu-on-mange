import { GOALS } from '../data/labels';
import { dayNutrition, type Plan } from '../lib/planner';
import type { Goal } from '../data/types';
import { formatDay } from './MenuView';

interface Props {
  plan: Plan;
  dailyKcal: number;
  goal: Goal;
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export function NutritionView({ plan, dailyKcal, goal }: Props) {
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
      <div className="stats">
        <div className="panel stat">
          <span className="muted">Moyenne par jour</span>
          <strong>{Math.round(avg.kcal)} kcal</strong>
          <small>objectif {dailyKcal} kcal ({GOALS[goal].label.toLowerCase()})</small>
        </div>
        <div className="panel stat">
          <span className="muted">Protéines</span>
          <strong>{Math.round(avg.proteines)} g</strong>
          <small>{pct(avg.proteines * 4, macroKcal)} % des calories</small>
        </div>
        <div className="panel stat">
          <span className="muted">Glucides</span>
          <strong>{Math.round(avg.glucides)} g</strong>
          <small>{pct(avg.glucides * 4, macroKcal)} % des calories</small>
        </div>
        <div className="panel stat">
          <span className="muted">Lipides</span>
          <strong>{Math.round(avg.lipides)} g</strong>
          <small>{pct(avg.lipides * 9, macroKcal)} % des calories</small>
        </div>
      </div>

      <div className="panel">
        <h3>Jour par jour (par personne)</h3>
        <ul className="bars">
          {rows.map(({ date, n }) => {
            const ratio = n.kcal / dailyKcal;
            return (
              <li key={date}>
                <span className="bar-label">{formatDay(date)}</span>
                <span className="bar-track" aria-hidden>
                  <span
                    className={`bar-fill ${ratio > 1.1 ? 'over' : ratio < 0.85 ? 'under' : ''}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </span>
                <span className="bar-value">
                  {Math.round(n.kcal)} kcal · P {Math.round(n.proteines)} g · G {Math.round(n.glucides)} g · L{' '}
                  {Math.round(n.lipides)} g
                </span>
              </li>
            );
          })}
        </ul>
        <p className="muted small">
          Valeurs estimées à titre indicatif. Pour un suivi médical, une perte de poids importante ou une prise de masse
          encadrée, demandez conseil à un médecin ou un diététicien.
        </p>
      </div>
    </div>
  );
}
