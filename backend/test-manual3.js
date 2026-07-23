require("dotenv").config();
const supabase = require("./config/supabase");

async function run() {
  const orderId = "9d9f124e-0c0c-4f7a-820d-dcadb8900ed6";
  const result = await supabase.from("orders").select("*, users(*)").eq("id", orderId).single();
  console.log(JSON.stringify(result, null, 2));
}
run();
