import { createClient } from "@supabase/supabase-js";
import { getEnv } from "../utils/env";

// Keys from connection_points.md (supporting environment overrides)
const supabaseUrl = getEnv("VITE_SUPABASE_URL", "https://lzzdfsphevmzbkkoskxb.supabase.co");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY", "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ");


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "aroham_supabase_auth",
  },
});
