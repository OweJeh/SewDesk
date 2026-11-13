import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

// Initialize client if credentials exist, otherwise provide dummy URL/key to avoid initialization crash
const fallbackUrl = 'https://placeholder-sewdesk.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() && supabaseUrl ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() && supabaseAnonKey ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
