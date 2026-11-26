import { useState } from 'react';
import { CUISINE_LABELS, GOALS, MEAL_LABELS, MEAL_ORDER, RESTRICTION_LABELS } from '../data/labels';
import type { Cuisine, Goal, MealType, Restriction } from '../data/types';
import type { Settings } from '../lib/planner';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onGenerate: () => void;
  dirty: boolean;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function SettingsPanel({ settings: s, onChange, onGenerate, dirty }: Props) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...s, [key]: value });
  const [excludedText, setExcludedText] = useState(s.excludedIngredients.join(', '));

  return (
    <form
      className="panel settings"
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate();
      }}
    >
      <h2>Mes préférences</h2>

      <div className="row">
        <label className="field">
          <span>Durée</span>
          <select value={s.days} onChange={(e) => set('days', Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
              <option key={n} value={n}>
                {n === 7 ? '1 semaine' : n === 14 ? '2 semaines' : `${n} jour${n > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>À partir du</span>
          <input type="date" value={s.startDate} onChange={(e) => e.target.value && set('startDate', e.target.value)} />
        </label>
      </div>

      <div className="field">
        <span>Nombre de personnes</span>
        <div className="stepper">
          <button type="button" aria-label="Moins de personnes" onClick={() => set('people', Math.max(1, s.people - 1))}>
            −
          </button>
          <output aria-live="polite">{s.people}</output>
          <button type="button" aria-label="Plus de personnes" onClick={() => set('people', Math.min(20, s.people + 1))}>
            +
          </button>
        </div>
      </div>

      <fieldset>
        <legend>Repas à prévoir</legend>
        <div className="chips">
          {MEAL_ORDER.map((m: MealType) => (
            <label key={m} className="chip">
              <input
                type="checkbox"
                checked={s.meals.includes(m)}
                onChange={() => {
                  const next = toggle(s.meals, m);
                  if (next.length) set('meals', next);
                }}
              />
              <span>{MEAL_LABELS[m]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Objectif</legend>
        <div className="goals">
          {(Object.keys(GOALS) as Goal[]).map((g) => (
            <label key={g} className={`goal ${s.goal === g ? 'active' : ''}`}>
              <input
                type="radio"
                name="goal"
                checked={s.goal === g}
                onChange={() => onChange({ ...s, goal: g, dailyKcal: GOALS[g].defaultKcal })}
              />
              <strong>{GOALS[g].label}</strong>
              <small>{GOALS[g].description}</small>
            </label>
          ))}
        </div>
        <label className="field inline">
          <span>Calories par jour et par personne</span>
          <input
            type="number"
            min={1200}
            max={4500}
            step={50}
            value={s.dailyKcal}
            onChange={(e) => set('dailyKcal', Math.min(4500, Math.max(1200, Number(e.target.value) || 0)))}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Cuisines préférées <small>(aucune = toutes)</small></legend>
        <div className="chips">
          {(Object.keys(CUISINE_LABELS) as Cuisine[]).map((c) => (
            <label key={c} className="chip">
              <input type="checkbox" checked={s.cuisines.includes(c)} onChange={() => set('cuisines', toggle(s.cuisines, c))} />
              <span>{CUISINE_LABELS[c]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Régime et allergies</legend>
        <div className="chips">
          {(Object.keys(RESTRICTION_LABELS) as Restriction[]).map((r) => (
            <label key={r} className="chip">
              <input
                type="checkbox"
                checked={s.restrictions.includes(r)}
                onChange={() => set('restrictions', toggle(s.restrictions, r))}
              />
              <span>{RESTRICTION_LABELS[r]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Ingrédients que je n'aime pas</span>
        <input
          type="text"
          placeholder="ex. champignons, aubergine"
          value={excludedText}
          onChange={(e) => {
            setExcludedText(e.target.value);
            set(
              'excludedIngredients',
              e.target.value
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean),
            );
          }}
        />
      </label>

      <label className="field">
        <span>Temps de préparation max.</span>
        <select
          value={s.maxPrepMinutes ?? ''}
          onChange={(e) => set('maxPrepMinutes', e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Pas de limite</option>
          {[20, 30, 45, 60].map((n) => (
            <option key={n} value={n}>
              {n} minutes
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="primary">
        {dirty ? 'Générer mes menus' : 'Proposer d’autres menus'}
      </button>
    </form>
  );
}
