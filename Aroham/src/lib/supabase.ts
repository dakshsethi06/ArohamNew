import { createClient } from "@supabase/supabase-js";

// Keys from connection_points.md (supporting environment overrides)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lzzdfsphevmzbkkoskxb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
