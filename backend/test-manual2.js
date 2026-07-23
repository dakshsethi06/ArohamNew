require("dotenv").config();
const supabase = require("./config/supabase");

async function run() {
  const orderId = "9d9f124e-0c0c-4f7a-820d-dcadb8900ed6";
  const { data: order } = await supabase.from("orders").select("*, users(*)").eq("id", orderId).single();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);

  console.log("SHIPROCKET_EMAIL:", process.env.SHIPROCKET_EMAIL);
  console.log("SHIPROCKET_PASSWORD:", process.env.SHIPROCKET_PASSWORD ? "SET" : "UNSET");
  console.log("ORDER EXISTS:", !!order);
  console.log("ITEMS EXISTS:", !!items, "LENGTH:", items?.length);
  
  const condition = (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD && order && items);
  console.log("CONDITION MET:", !!condition);
}
run();
