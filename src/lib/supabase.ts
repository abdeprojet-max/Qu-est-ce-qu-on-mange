import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Ne garde que « https://xxxx.supabase.co », même si l'adresse collée contient
 * un chemin (/rest/v1/, /auth/v1, /) ou des espaces.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string | null {
  const value = raw?.trim().replace(/^["']|["']$/g, '');
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
    return url.origin;
  } catch {
    console.error('VITE_SUPABASE_URL invalide :', value);
    return null;
  }
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
// « Publishable key » (nouveau nom) ou « anon key » (ancien nom) : les deux fonctionnent.
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim().replace(/^["']|["']$/g, '');

/**
 * Client Supabase, ou null si les variables d'environnement ne sont pas définies.
 * Sans Supabase, l'app fonctionne normalement en mode local (données dans le navigateur).
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
