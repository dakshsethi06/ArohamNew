import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzzdfsphevmzbkkoskxb.supabase.co';
const supabaseAnonKey = 'sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
