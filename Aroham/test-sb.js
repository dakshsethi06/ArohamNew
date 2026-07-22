import { createClient } from "@supabase/supabase-js";
const sb = createClient("https://lzzdfsphevmzbkkoskxb.supabase.co", "sb_publishable_hXI5tCwU5jA3BQtdLxuXoQ_L69CcRaZ");
async function run() {
  const { data, error } = await sb.from('users').select('*').eq('phone', '7068373203');
  console.log("Data:", data, "Error:", error);
}
run();
