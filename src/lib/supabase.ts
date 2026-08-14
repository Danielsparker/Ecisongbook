import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://axxwahecopzsbwgqtqgp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_e438qh0Wsg-2gigGy_UPqQ_ELc_nj3C';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder'
);

export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY
);

