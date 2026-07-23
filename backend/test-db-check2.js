require("dotenv").config();
const supabase = require("./config/supabase");

async function run() {
  const userId = "0b4ed81e-389c-4b9a-b0d5-d79f7ea46324";
  
  const { data: user } = await supabase.from("users").select("*").eq("id", userId).single();
  console.log("=== USER LOGIN DETAILS ===");
  if (user) {
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.full_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Created: ${user.created_at}`);
  } else {
    console.log("User not found!");
  }

  console.log("\n=== SAVED ADDRESSES ===");
  const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", userId);
  if (addresses && addresses.length > 0) {
    console.log(`Found ${addresses.length} saved address(es):`);
    addresses.forEach((addr, i) => {
      console.log(`\nAddress #${i + 1}:`);
      console.log(`  Name: ${addr.name}`);
      console.log(`  Phone: ${addr.phone}`);
      console.log(`  Email: ${addr.email}`);
      console.log(`  Street: ${addr.address}`);
      console.log(`  City: ${addr.city}`);
      console.log(`  State: ${addr.state}`);
      console.log(`  Pincode: ${addr.pincode}`);
    });
  } else {
    console.log("No saved addresses found.");
  }
}
run();
