import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase do browser — usado apenas para AUTH.
 * Os dados de negócio passam sempre pelo backend único (pulse-back).
 */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const authEnabled = Boolean(supabase);
