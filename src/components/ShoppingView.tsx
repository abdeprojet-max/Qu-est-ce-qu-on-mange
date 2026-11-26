import { useState } from 'react';
import type { Category } from '../data/types';
import { formatQuantity, shoppingListAsText, type ShoppingCategory } from '../lib/planner';

interface Props {
  list: ShoppingCategory[];
  checked: Record<string, boolean>;
  onToggle: (name: string) => void;
  onReset: () => void;
  people: number;
  days: number;
}

const CATEGORY_ICON: Record<Category, string> = {
  'Fruits & légumes': '🥕',
  'Viandes & poissons': '🍗',
  'Crèmerie & œufs': '🥚',
  'Féculents & céréales': '🌾',
  'Légumineuses & conserves': '🥫',
  'Placard (épices, huiles, sauces)': '🧂',
};

export function ShoppingView({ list, checked, onToggle, onReset, people, days }: Props) {
  const [copied, setCopied] = useState(false);
  const total = list.reduce((s, c) => s + c.items.length, 0);
  const done = list.reduce((s, c) => s + c.items.filter((i) => checked[i.name]).length, 0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListAsText(list));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  if (!total) return <p className="panel muted">Générez d’abord vos menus pour obtenir la liste de courses.</p>;

  return (
    <div className="shopping">
      <div className="page-head">
        <div>
          <p className="eyebrow">Liste de courses</p>
          <h1>
            {days} jour{days > 1 ? 's' : ''} pour {people} personne{people > 1 ? 's' : ''}
          </h1>
        </div>
        <div className="actions">
          <button className="pill" onClick={copy}>
            {copied ? 'Copiée ✓' : 'Copier'}
          </button>
          <button className="pill" onClick={() => window.print()}>
            Imprimer
          </button>
          {done > 0 && (
            <button className="pill" onClick={onReset}>
              Tout décocher
            </button>
          )}
        </div>
      </div>

      <div className="progress-card">
        <div>
          <strong>
            {done} / {total}
          </strong>{' '}
          articles dans le panier
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      <div className="categories">
        {list.map((c) => (
          <section key={c.category} className="panel">
            <h2>
              <span className="cat-icon" aria-hidden>
                {CATEGORY_ICON[c.category]}
              </span>
              {c.category}
            </h2>
            {c.category.startsWith('Placard') && <p className="muted small">Vérifiez d’abord ce que vous avez déjà.</p>}
            <ul className="checklist">
              {c.items.map((i) => (
                <li key={i.name} className={checked[i.name] ? 'done' : ''}>
                  <label>
                    <input type="checkbox" checked={!!checked[i.name]} onChange={() => onToggle(i.name)} />
                    <span className="name">{i.name}</span>
                    <span className="qty">{formatQuantity(i.quantity, i.unit)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
