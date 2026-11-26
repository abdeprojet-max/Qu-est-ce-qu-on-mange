import type { Session } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SyncStatus } from '../lib/useCloudSync';
import { Modal } from './Modal';

interface Props {
  session: Session | null;
  status: SyncStatus;
  onClose: () => void;
}

type Mode = 'login' | 'signup' | 'reset';

const ERRORS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
  'User already registered': 'Un compte existe déjà avec cet e-mail.',
  'Email not confirmed': 'Confirmez d’abord votre adresse e-mail (lien reçu par e-mail).',
};

export function AccountModal({ session, status, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);

  const submit = async (e: React.FormEvent, close: () => void) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        close();
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) close();
        else setMessage({ type: 'ok', text: 'Compte créé ! Cliquez sur le lien reçu par e-mail pour l’activer, puis connectez-vous.' });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage({ type: 'ok', text: 'Si un compte existe, un e-mail de réinitialisation vient d’être envoyé.' });
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: ERRORS[text] ?? text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} label="Mon compte" className="modal account-modal">
      {(close) => (
        <div className="modal-body">
          <button className="round close-inline" aria-label="Fermer" onClick={close}>
            ✕
          </button>

          {!supabase ? (
            <>
              <p className="eyebrow">Comptes utilisateurs</p>
              <h2>Bientôt disponible</h2>
              <p className="muted">
                Les comptes ne sont pas encore activés sur ce site. En attendant, vos menus, votre profil et votre suivi de poids sont
                enregistrés dans ce navigateur.
              </p>
            </>
          ) : session ? (
            <>
              <p className="eyebrow">Mon compte</p>
              <h2>{session.user.email}</h2>
              <p className="muted">
                {status === 'error'
                  ? '⚠️ La dernière synchronisation a échoué. Vos modifications restent sur cet appareil et seront renvoyées à la prochaine modification.'
                  : '✓ Vos menus, votre liste de courses, votre profil et votre suivi de poids sont synchronisés sur tous vos appareils.'}
              </p>
              <form
                className="auth-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  const { error } = await supabase!.auth.updateUser({ password });
                  setBusy(false);
                  setPassword('');
                  setMessage(error ? { type: 'error', text: error.message } : { type: 'ok', text: 'Mot de passe modifié ✓' });
                }}
              >
                <label className="field">
                  <span>Nouveau mot de passe</span>
                  <input type="password" minLength={6} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {message && <p className={message.type === 'error' ? 'error' : 'success'}>{message.text}</p>}
                <button type="submit" className="pill block" disabled={busy}>
                  Changer mon mot de passe
                </button>
              </form>
              <button
                className="pill dark block"
                onClick={async () => {
                  await supabase!.auth.signOut();
                  close();
                }}
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">{mode === 'signup' ? 'Créer un compte' : mode === 'reset' ? 'Mot de passe oublié' : 'Connexion'}</p>
              <h2>{mode === 'signup' ? 'Rejoignez-nous 🍲' : mode === 'reset' ? 'Réinitialiser' : 'Bon retour 👋'}</h2>
              <p className="muted">Retrouvez vos menus, votre profil et votre suivi de poids sur tous vos appareils.</p>
              <form className="auth-form" onSubmit={(e) => submit(e, close)}>
                <label className="field">
                  <span>E-mail</span>
                  <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                {mode !== 'reset' && (
                  <label className="field">
                    <span>Mot de passe</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                )}
                {message && <p className={message.type === 'error' ? 'error' : 'success'}>{message.text}</p>}
                <button type="submit" className="pill dark block" disabled={busy}>
                  {busy ? 'Patientez…' : mode === 'signup' ? 'Créer mon compte' : mode === 'reset' ? 'Envoyer le lien' : 'Se connecter'}
                </button>
              </form>
              <div className="auth-switch">
                {mode === 'login' ? (
                  <>
                    <button className="link" onClick={() => setMode('signup')}>
                      Pas encore de compte ? Inscrivez-vous
                    </button>
                    <button className="link" onClick={() => setMode('reset')}>
                      Mot de passe oublié ?
                    </button>
                  </>
                ) : (
                  <button className="link" onClick={() => setMode('login')}>
                    ← J’ai déjà un compte
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
