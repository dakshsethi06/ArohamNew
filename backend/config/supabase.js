const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://lzzdfsphevmzbkkoskxb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ";

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);

module.exports = supabase;
