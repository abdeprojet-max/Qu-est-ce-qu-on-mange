import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// « Publishable key » (nouveau nom) ou « anon key » (ancien nom) : les deux fonctionnent.
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * Client Supabase, ou null si les variables d'environnement ne sont pas définies.
 * Sans Supabase, l'app fonctionne normalement en mode local (données dans le navigateur).
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url.trim(), key.trim()) : null;
