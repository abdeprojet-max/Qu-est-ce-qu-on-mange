import type { Session } from '@supabase/supabase-js';
import type { SyncStatus } from '../lib/useCloudSync';

export type Tab = 'menu' | 'courses' | 'nutrition' | 'profil';

const TABS: [Tab, string][] = [
  ['menu', 'Menus'],
  ['courses', 'Courses'],
  ['nutrition', 'Nutrition'],
  ['profil', 'Mon profil'],
];

const STATUS_LABEL: Record<SyncStatus, string> = {
  disabled: '',
  'signed-out': '',
  loading: 'Chargement…',
  syncing: 'Enregistrement…',
  synced: 'Synchronisé',
  error: 'Erreur de synchronisation',
};

interface Props {
  tab: Tab;
  onTab: (t: Tab) => void;
  shoppingCount: number;
  session: Session | null;
  status: SyncStatus;
  onAccount: () => void;
}

export function Header({ tab, onTab, shoppingCount, session, status, onAccount }: Props) {
  const email = session?.user.email ?? '';
  return (
    <header className="header">
      <button className="logo" onClick={() => onTab('menu')} aria-label="Accueil">
        QU’EST-CE QU’ON <span>MANGE&nbsp;?</span>
      </button>
      <nav className="nav" aria-label="Sections">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
            {label}
            {id === 'courses' && shoppingCount > 0 && <span className="count">{shoppingCount}</span>}
          </button>
        ))}
      </nav>
      <button className={`pill dark account ${session ? 'signed-in' : ''}`} onClick={onAccount}>
        {session ? (
          <>
            <span className="avatar" aria-hidden>
              {email.slice(0, 1).toUpperCase()}
            </span>
            <span className="account-label">Mon compte</span>
            <span className={`dot ${status}`} title={STATUS_LABEL[status]} aria-label={STATUS_LABEL[status]} />
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </header>
  );
}
