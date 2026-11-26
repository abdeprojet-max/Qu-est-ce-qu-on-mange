import type { Session } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { sanitize, type AppData } from './appData';
import { supabase } from './supabase';

export type SyncStatus = 'disabled' | 'signed-out' | 'loading' | 'syncing' | 'synced' | 'error';

/**
 * Synchronise les données avec le compte de l'utilisateur.
 * - À la connexion : les données du compte remplacent celles de l'appareil ;
 *   si le compte est neuf, les données de l'appareil y sont envoyées.
 * - Ensuite : chaque modification est enregistrée (après une courte pause).
 */
export function useCloudSync(data: AppData, setData: (d: AppData) => void) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>(supabase ? 'signed-out' : 'disabled');
  const readyFor = useRef<string | null>(null); // id de l'utilisateur dont les données sont chargées
  const skipNextSave = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  // Chargement initial à la connexion.
  useEffect(() => {
    if (!supabase) return;
    if (!userId) {
      readyFor.current = null;
      setStatus('signed-out');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      const { data: row, error } = await supabase.from('app_state').select('data').eq('user_id', userId).maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
        setStatus('error');
        return;
      }
      if (row?.data) {
        skipNextSave.current = true;
        setData(sanitize(row.data));
        readyFor.current = userId;
        setStatus('synced');
      } else {
        const { error: e2 } = await supabase.from('app_state').upsert({ user_id: userId, data: dataRef.current });
        if (cancelled) return;
        readyFor.current = userId;
        setStatus(e2 ? 'error' : 'synced');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, setData]);

  // Enregistrement des modifications.
  useEffect(() => {
    if (!supabase || !userId || readyFor.current !== userId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setStatus('syncing');
    const t = setTimeout(async () => {
      const { error } = await supabase!
        .from('app_state')
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
      if (error) console.error(error);
      setStatus(error ? 'error' : 'synced');
    }, 1000);
    return () => clearTimeout(t);
  }, [data, userId]);

  return { session, status, enabled: !!supabase };
}
