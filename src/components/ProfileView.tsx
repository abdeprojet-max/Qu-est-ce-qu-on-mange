import { useEffect, useState } from 'react';
import { GOALS } from '../data/labels';
import type { Goal } from '../data/types';
import { today } from '../lib/appData';
import {
  ACTIVITY_LEVELS,
  basalMetabolism,
  bmi,
  bmiLabel,
  dailyExpenditure,
  DEFAULT_PROFILE,
  isProfileValid,
  targetCalories,
  targetProteins,
  type Activity,
  type Profile,
  type WeightEntry,
} from '../lib/profile';
import { formatDay } from './MenuView';
import { WeightChart } from './WeightChart';

interface Props {
  profile: Profile | null;
  weights: WeightEntry[];
  goal: Goal;
  onGoal: (g: Goal) => void;
  onSaveProfile: (p: Profile) => void;
  onAddWeight: (e: WeightEntry) => void;
  onDeleteWeight: (date: string) => void;
  signedIn: boolean;
  cloudEnabled: boolean;
  onAccount: () => void;
}

const fmt = (n: number, d = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: d });

export function ProfileView(props: Props) {
  const { profile, weights, goal, onGoal, onSaveProfile, onAddWeight, onDeleteWeight } = props;
  const [draft, setDraft] = useState<Profile>(profile ?? DEFAULT_PROFILE);
  const [savedMsg, setSavedMsg] = useState(false);
  const [wDate, setWDate] = useState(today());
  const [wKg, setWKg] = useState('');

  // Le poids peut changer via une pesée : on garde le formulaire à jour.
  useEffect(() => {
    if (profile) setDraft((d) => ({ ...d, weightKg: profile.weightKg }));
  }, [profile?.weightKg]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const valid = isProfileValid(draft);
  const changed = JSON.stringify(draft) !== JSON.stringify(profile);
  const imc = bmi(draft);

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSaveProfile(draft);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const submitWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = Number(wKg.replace(',', '.'));
    if (!kg || kg < 30 || kg > 300 || !wDate) return;
    onAddWeight({ date: wDate, kg: Math.round(kg * 10) / 10 });
    setWKg('');
  };

  return (
    <div className="profile">
      <div className="page-head">
        <div>
          <p className="eyebrow">Mon profil</p>
          <h1>Des menus taillés pour vous</h1>
          <p className="muted">Vos besoins sont calculés à partir de votre corps, de votre activité et de votre objectif.</p>
        </div>
      </div>

      {props.cloudEnabled && !props.signedIn && (
        <div className="notice">
          <span>Connectez-vous pour retrouver votre profil et votre suivi de poids sur tous vos appareils.</span>
          <button className="pill dark" onClick={props.onAccount}>
            Se connecter
          </button>
        </div>
      )}

      <div className="profile-grid">
        <form className="panel profile-form" onSubmit={submitProfile}>
          <h2>Mes informations</h2>

          <fieldset>
            <legend>Sexe</legend>
            <div className="segmented">
              {(['femme', 'homme'] as const).map((s) => (
                <label key={s} className={draft.sex === s ? 'active' : ''}>
                  <input type="radio" name="sex" checked={draft.sex === s} onChange={() => set('sex', s)} />
                  {s === 'femme' ? 'Femme' : 'Homme'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="row three">
            <label className="field">
              <span>Âge</span>
              <input type="number" min={14} max={100} value={draft.age} onChange={(e) => set('age', Number(e.target.value))} />
            </label>
            <label className="field">
              <span>Taille (cm)</span>
              <input type="number" min={120} max={230} value={draft.heightCm} onChange={(e) => set('heightCm', Number(e.target.value))} />
            </label>
            <label className="field">
              <span>Poids (kg)</span>
              <input type="number" min={30} max={300} step={0.1} value={draft.weightKg} onChange={(e) => set('weightKg', Number(e.target.value))} />
            </label>
          </div>

          <label className="field">
            <span>Niveau d’activité</span>
            <select value={draft.activity} onChange={(e) => set('activity', e.target.value as Activity)}>
              {(Object.keys(ACTIVITY_LEVELS) as Activity[]).map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_LEVELS[a].label} — {ACTIVITY_LEVELS[a].hint}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend>Objectif</legend>
            <div className="segmented">
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <label key={g} className={goal === g ? 'active' : ''}>
                  <input type="radio" name="profile-goal" checked={goal === g} onChange={() => onGoal(g)} />
                  {GOALS[g].label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Poids visé (kg, facultatif)</span>
            <input
              type="number"
              min={30}
              max={300}
              step={0.1}
              value={draft.targetWeightKg ?? ''}
              onChange={(e) => set('targetWeightKg', e.target.value ? Number(e.target.value) : null)}
            />
          </label>

          <label className="switch">
            <input type="checkbox" checked={draft.autoKcal} onChange={(e) => set('autoKcal', e.target.checked)} />
            <span>Calculer automatiquement les calories de mes menus</span>
          </label>

          {!valid && <p className="error">Vérifiez l’âge (14–100 ans), la taille (120–230 cm) et le poids (30–300 kg).</p>}
          <button type="submit" className={`pill dark block ${profile && !changed ? 'saved' : ''}`} disabled={!valid || (!changed && !!profile)}>
            {profile && !changed ? (savedMsg ? 'Profil enregistré ✓' : 'Profil à jour ✓') : profile ? 'Enregistrer les modifications' : 'Créer mon profil'}
          </button>
        </form>

        <div className="profile-side">
          <section className="panel needs" aria-live="polite">
            <h2>Mes besoins</h2>
            {valid ? (
              <>
                <div className="needs-main">
                  <span>Objectif calorique</span>
                  <strong>{fmt(targetCalories(draft, goal))}</strong>
                  <small>kcal par jour · {GOALS[goal].label.toLowerCase()}</small>
                </div>
                <dl className="needs-list">
                  <div>
                    <dt>Métabolisme de base</dt>
                    <dd>{fmt(basalMetabolism(draft))} kcal</dd>
                  </div>
                  <div>
                    <dt>Dépense journalière</dt>
                    <dd>{fmt(dailyExpenditure(draft))} kcal</dd>
                  </div>
                  <div>
                    <dt>Protéines conseillées</dt>
                    <dd>≈ {targetProteins(draft, goal)} g</dd>
                  </div>
                  <div>
                    <dt>IMC</dt>
                    <dd>
                      {fmt(imc, 1)} <small>{bmiLabel(imc)}</small>
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p>Complétez vos informations pour voir le calcul.</p>
            )}
            <p className="small fine">Estimations (formule de Mifflin-St Jeor). Elles ne remplacent pas l’avis d’un professionnel de santé.</p>
          </section>
        </div>
      </div>

      <section className="panel weight">
        <div className="weight-head">
          <h2>Suivi du poids</h2>
          <form className="weight-form" onSubmit={submitWeight}>
            <label>
              <span className="sr-only">Date</span>
              <input type="date" value={wDate} max={today()} onChange={(e) => setWDate(e.target.value)} />
            </label>
            <label>
              <span className="sr-only">Poids en kg</span>
              <input type="text" inputMode="decimal" placeholder="Poids (kg)" value={wKg} onChange={(e) => setWKg(e.target.value)} />
            </label>
            <button type="submit" className="pill dark">
              Ajouter
            </button>
          </form>
        </div>
        <WeightChart entries={weights} target={profile?.targetWeightKg ?? null} />
        {weights.length > 0 && (
          <ul className="weight-list">
            {[...weights]
              .reverse()
              .slice(0, 8)
              .map((w) => (
                <li key={w.date}>
                  <span>{formatDay(w.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <strong>{fmt(w.kg, 1)} kg</strong>
                  <button className="round small" aria-label={`Supprimer la pesée du ${w.date}`} onClick={() => onDeleteWeight(w.date)}>
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
