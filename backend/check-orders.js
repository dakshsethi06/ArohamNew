const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL || "https://lzzdfsphevmzbkkoskxb.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  "order_items",
  "payments",
  "cart_items"
];

async function check() {
  console.log("Checking table existence in Supabase...");
  for (const t of tables) {
    const { error } = await supabase.from(t).select("id").limit(1);
    if (error) {
      console.log(`❌ Table '${t}' failed: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ Table '${t}' exists!`);
    }
  }
}

check();
