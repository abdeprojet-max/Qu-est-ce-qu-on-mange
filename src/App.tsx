import { useEffect, useMemo, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { Header, type Tab } from './components/Header';
import { Hero } from './components/Hero';
import { MenuView } from './components/MenuView';
import { Modal } from './components/Modal';
import { NutritionView } from './components/NutritionView';
import { ProfileView } from './components/ProfileView';
import { RecipeModal } from './components/RecipeModal';
import { SettingsPanel } from './components/SettingsPanel';
import { ShoppingView } from './components/ShoppingView';
import { MEAL_ORDER } from './data/labels';
import { RECIPES_BY_ID } from './data/recipes';
import type { MealType } from './data/types';
import { loadLocal, newSeed, saveLocal, selectionKey, today, type AppData } from './lib/appData';
import { buildShoppingList, generatePlan, recomputePortions, swapMeal, type Settings } from './lib/planner';
import { isProfileValid, targetCalories, targetProteins, upsertWeight } from './lib/profile';
import { supabase } from './lib/supabase';
import { useCloudSync } from './lib/useCloudSync';

export default function App() {
  const [data, setData] = useState<AppData>(loadLocal);
  const [tab, setTab] = useState<Tab>('menu');
  const [open, setOpen] = useState<{ day: number; meal: MealType } | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const { session, status, enabled } = useCloudSync(data, setData);

  useEffect(() => saveLocal(data), [data]);

  // Lien « mot de passe oublié » : on ouvre directement le compte pour choisir un nouveau mot de passe.
  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setShowAccount(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { profile, weights, checked, saved } = data;
  const autoKcal = !!profile && profile.autoKcal && isProfileValid(profile);

  // Les calories viennent du profil quand le calcul automatique est activé.
  const settings: Settings = useMemo(
    () => (autoKcal ? { ...data.settings, dailyKcal: targetCalories(profile!, data.settings.goal) } : data.settings),
    [data.settings, profile, autoKcal],
  );

  const plan = useMemo(() => recomputePortions(saved.plan, settings), [saved.plan, settings]);
  const list = useMemo(() => buildShoppingList(plan, settings.people), [plan, settings.people]);
  const shoppingCount = list.reduce((s, c) => s + c.items.filter((i) => !checked[i.name]).length, 0);
  const dirty = selectionKey(settings) !== saved.key;

  const update = (patch: Partial<AppData>) => setData((d) => ({ ...d, ...patch }));
  const setSettings = (s: Settings) => setData((d) => ({ ...d, settings: s }));

  const generate = () => {
    update({ saved: { plan: generatePlan(settings, newSeed()), key: selectionKey(settings) }, checked: {} });
    setShowPrefs(false);
    setTab('menu');
  };

  const goTo = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Plat mis en avant : le prochain repas d'aujourd'hui, sinon le premier du menu.
  const featured = useMemo(() => {
    const idx = Math.max(0, plan.days.findIndex((d) => d.date === today()));
    const day = plan.days[idx];
    const meal = day && MEAL_ORDER.find((m) => day.meals[m]);
    return day && meal ? { day: idx, meal, recipe: RECIPES_BY_ID[day.meals[meal]!.recipeId] } : null;
  }, [plan]);

  const opened = open && plan.days[open.day]?.meals[open.meal];

  return (
    <div className="app">
      <Header
        tab={tab}
        onTab={goTo}
        shoppingCount={shoppingCount}
        session={session}
        status={status}
        onAccount={() => setShowAccount(true)}
      />

      <main>
        {tab === 'menu' && (
          <>
            <Hero
              settings={settings}
              onChange={setSettings}
              onGenerate={generate}
              onPreferences={() => setShowPrefs(true)}
              dirty={dirty}
              featured={featured?.recipe ?? null}
              onOpenFeatured={() => featured && setOpen({ day: featured.day, meal: featured.meal })}
            />
            {dirty && (
              <div className="notice">
                <span>Vos préférences ont changé.</span>
                <button className="pill dark" onClick={generate}>
                  Générer de nouveaux menus
                </button>
              </div>
            )}
            <MenuView
              plan={plan}
              dailyKcal={settings.dailyKcal}
              onOpen={(day, meal) => setOpen({ day, meal })}
              onSwap={(day, meal) => update({ saved: { ...saved, plan: swapMeal(saved.plan, settings, day, meal) } })}
            />
          </>
        )}
        {tab === 'courses' && (
          <ShoppingView
            list={list}
            checked={checked}
            onToggle={(n) => update({ checked: { ...checked, [n]: !checked[n] } })}
            onReset={() => update({ checked: {} })}
            people={settings.people}
            days={plan.days.length}
          />
        )}
        {tab === 'nutrition' && (
          <NutritionView
            plan={plan}
            dailyKcal={settings.dailyKcal}
            goal={settings.goal}
            proteinTarget={profile && isProfileValid(profile) ? targetProteins(profile, settings.goal) : null}
          />
        )}
        {tab === 'profil' && (
          <ProfileView
            profile={profile}
            weights={weights}
            goal={settings.goal}
            onGoal={(goal) => setSettings({ ...data.settings, goal })}
            onSaveProfile={(p) => {
              // Le poids saisi dans le profil compte aussi comme pesée du jour.
              const hasToday = weights.some((w) => w.date === today());
              const changedWeight = !profile || profile.weightKg !== p.weightKg;
              update({
                profile: p,
                weights: changedWeight || !hasToday ? upsertWeight(weights, { date: today(), kg: p.weightKg }) : weights,
              });
            }}
            onAddWeight={(entry) => {
              const next = upsertWeight(weights, entry);
              const latest = next[next.length - 1];
              update({ weights: next, profile: profile ? { ...profile, weightKg: latest.kg } : profile });
            }}
            onDeleteWeight={(date) => update({ weights: weights.filter((w) => w.date !== date) })}
            signedIn={!!session}
            cloudEnabled={enabled}
            onAccount={() => setShowAccount(true)}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Qu’est-ce qu’on mange ?</strong> · Valeurs nutritionnelles indicatives.{' '}
          {session ? 'Données synchronisées avec votre compte.' : 'Données enregistrées dans ce navigateur.'}
        </p>
      </footer>

      {showPrefs && (
        <Modal onClose={() => setShowPrefs(false)} label="Préférences" className="drawer">
          {(close) => (
            <>
              <div className="drawer-head">
                <h2>Mes préférences</h2>
                <button className="round" aria-label="Fermer" onClick={close}>
                  ✕
                </button>
              </div>
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                onGenerate={generate}
                dirty={dirty}
                kcalFromProfile={autoKcal}
                onOpenProfile={() => {
                  close();
                  goTo('profil');
                }}
              />
            </>
          )}
        </Modal>
      )}

      {opened && (
        <RecipeModal
          recipe={RECIPES_BY_ID[opened.recipeId]}
          portion={opened.portion}
          people={settings.people}
          onClose={() => setOpen(null)}
        />
      )}

      {showAccount && <AccountModal session={session} status={status} onClose={() => setShowAccount(false)} />}
    </div>
  );
}
