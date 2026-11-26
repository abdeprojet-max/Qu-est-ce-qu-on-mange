import { GOALS } from '../data/labels';
import type { Recipe } from '../data/types';
import type { Settings } from '../lib/planner';
import { RecipeVisual } from './RecipeVisual';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onGenerate: () => void;
  onPreferences: () => void;
  dirty: boolean;
  featured: Recipe | null;
  onOpenFeatured: () => void;
}

export function Hero({ settings: s, onChange, onGenerate, onPreferences, dirty, featured, onOpenFeatured }: Props) {
  return (
    <section className="hero">
      <div className="hero-text">
        <p className="eyebrow">Menus · Portions · Liste de courses</p>
        <h1>
          BIEN <span className="emoji" aria-hidden>😋</span> MANGER.
          <br />
          SANS <span className="emoji" aria-hidden>🤔</span> Y PENSER.
        </h1>
        <p className="lead">
          Des repas africains, asiatiques, orientaux et d’ailleurs, adaptés à votre objectif ({GOALS[s.goal].label.toLowerCase()},{' '}
          {s.dailyKcal} kcal/jour), avec la liste de courses prête.
        </p>

        <form
          className="quickbar"
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate();
          }}
        >
          <label>
            <span>Durée</span>
            <select value={s.days} onChange={(e) => onChange({ ...s, days: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n === 7 ? '1 semaine' : n === 14 ? '2 semaines' : `${n} jour${n > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Personnes</span>
            <select value={s.people} onChange={(e) => onChange({ ...s, people: Number(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} pers.
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="pill dark">
            {dirty ? 'Générer' : 'Nouveaux menus'}
          </button>
        </form>
        <button className="link-button" onClick={onPreferences}>
          Cuisines, régime, allergies, repas… <strong>Toutes les préférences →</strong>
        </button>
      </div>

      <div className="hero-art">
        <div className="blob" aria-hidden />
        {featured && (
          <button className="hero-plate" onClick={onOpenFeatured} aria-label={`Voir la recette : ${featured.name}`}>
            <RecipeVisual recipe={featured} size="banner" />
            <span className="hero-caption">
              <small>Au menu aujourd’hui</small>
              {featured.name}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
