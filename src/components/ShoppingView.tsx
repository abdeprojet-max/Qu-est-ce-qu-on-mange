import { useState } from 'react';
import { formatQuantity, shoppingListAsText, type ShoppingCategory } from '../lib/planner';

interface Props {
  list: ShoppingCategory[];
  checked: Record<string, boolean>;
  onToggle: (name: string) => void;
  onReset: () => void;
  people: number;
  days: number;
}

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
      <div className="panel toolbar">
        <p>
          <strong>
            {done}/{total}
          </strong>{' '}
          articles · {days} jour{days > 1 ? 's' : ''} pour {people} personne{people > 1 ? 's' : ''}
        </p>
        <div className="actions">
          <button onClick={copy}>{copied ? 'Copiée ✓' : 'Copier la liste'}</button>
          <button onClick={() => window.print()}>Imprimer</button>
          {done > 0 && <button onClick={onReset}>Tout décocher</button>}
        </div>
      </div>
      <div className="categories">
        {list.map((c) => (
          <section key={c.category} className="panel">
            <h3>{c.category}</h3>
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
