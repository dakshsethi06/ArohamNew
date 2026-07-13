import { createClient } from "@supabase/supabase-js";

// Keys from connection_points.md
const supabaseUrl = "https://lzzdfsphevmzbkkoskxb.supabase.co";
const supabaseAnonKey = "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
