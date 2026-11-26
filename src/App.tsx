import { useEffect, useMemo, useState } from 'react';
import { MenuView } from './components/MenuView';
import { NutritionView } from './components/NutritionView';
import { RecipeModal } from './components/RecipeModal';
import { SettingsPanel } from './components/SettingsPanel';
import { ShoppingView } from './components/ShoppingView';
import { GOALS } from './data/labels';
import { RECIPES_BY_ID } from './data/recipes';
import type { MealType } from './data/types';
import {
  buildShoppingList,
  generatePlan,
  recomputePortions,
  swapMeal,
  type Plan,
  type Settings,
} from './lib/planner';
import { load, loadRaw, save } from './lib/storage';

type Tab = 'menu' | 'courses' | 'nutrition';

function today(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const DEFAULT_SETTINGS: Settings = {
  days: 7,
  startDate: today(),
  people: 2,
  meals: ['dejeuner', 'diner'],
  cuisines: [],
  restrictions: [],
  excludedIngredients: [],
  goal: 'equilibre',
  dailyKcal: GOALS.equilibre.defaultKcal,
  maxPrepMinutes: null,
};

/** Paramètres qui changent le choix des recettes (le reste s'applique en direct). */
const selectionKey = (s: Settings) =>
  JSON.stringify([s.days, s.startDate, s.meals, s.cuisines, s.restrictions, s.excludedIngredients, s.goal, s.maxPrepMinutes]);

interface SavedPlan {
  plan: Plan;
  key: string;
}

function isValidPlan(p: SavedPlan | null): p is SavedPlan {
  return (
    !!p?.plan?.days?.length &&
    p.plan.days.every((d) => Object.values(d.meals).every((m) => m === null || !!RECIPES_BY_ID[m.recipeId]))
  );
}

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => load('qcom:settings', DEFAULT_SETTINGS));
  const [saved, setSaved] = useState<SavedPlan>(() => {
    const s = loadRaw<SavedPlan>('qcom:plan');
    return isValidPlan(s) ? s : { plan: generatePlan(settings, newSeed()), key: selectionKey(settings) };
  });
  const [checked, setChecked] = useState<Record<string, boolean>>(() => load('qcom:checked', {}));
  const [tab, setTab] = useState<Tab>('menu');
  const [open, setOpen] = useState<{ day: number; meal: MealType } | null>(null);

  // Les portions suivent l'objectif calorique en direct.
  const plan = useMemo(() => recomputePortions(saved.plan, settings), [saved.plan, settings]);
  const list = useMemo(() => buildShoppingList(plan, settings.people), [plan, settings.people]);
  const dirty = selectionKey(settings) !== saved.key;

  useEffect(() => save('qcom:settings', settings), [settings]);
  useEffect(() => save('qcom:plan', saved), [saved]);
  useEffect(() => save('qcom:checked', checked), [checked]);

  const generate = () => {
    setSaved({ plan: generatePlan(settings, newSeed()), key: selectionKey(settings) });
    setChecked({});
    setTab('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const opened = open && plan.days[open.day]?.meals[open.meal];

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          <span aria-hidden>🍲</span> Qu’est-ce qu’on mange ?
        </h1>
        <p>Vos menus, vos portions et votre liste de courses, en un clic.</p>
      </header>

      <main className="layout">
        <SettingsPanel settings={settings} onChange={setSettings} onGenerate={generate} dirty={dirty} />

        <section className="content">
          {dirty && (
            <div className="notice">
              Vos préférences ont changé.{' '}
              <button className="link" onClick={generate}>
                Générer de nouveaux menus
              </button>
            </div>
          )}

          <nav className="tabs" role="tablist">
            {(
              [
                ['menu', 'Menus'],
                ['courses', `Courses (${list.reduce((s, c) => s + c.items.length, 0)})`],
                ['nutrition', 'Suivi nutritionnel'],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </nav>

          {tab === 'menu' && (
            <MenuView
              plan={plan}
              dailyKcal={settings.dailyKcal}
              onOpen={(day, meal) => setOpen({ day, meal })}
              onSwap={(day, meal) => setSaved((s) => ({ ...s, plan: swapMeal(s.plan, settings, day, meal) }))}
            />
          )}
          {tab === 'courses' && (
            <ShoppingView
              list={list}
              checked={checked}
              onToggle={(n) => setChecked((c) => ({ ...c, [n]: !c[n] }))}
              onReset={() => setChecked({})}
              people={settings.people}
              days={plan.days.length}
            />
          )}
          {tab === 'nutrition' && <NutritionView plan={plan} dailyKcal={settings.dailyKcal} goal={settings.goal} />}
        </section>
      </main>

      {opened && (
        <RecipeModal
          recipe={RECIPES_BY_ID[opened.recipeId]}
          portion={opened.portion}
          people={settings.people}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
