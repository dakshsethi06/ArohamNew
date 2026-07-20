require("dotenv").config();
const supabase = require("./config/supabase");

async function run() {
  const email = "manas17146@gmail.com";
  
  // Check users table
  const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
  console.log("=== USER LOGIN DETAILS ===");
  if (user) {
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.full_name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Created: ${user.created_at}`);
  } else {
    console.log("User not found in public.users table!");
  }

  // Check addresses table
  console.log("\n=== SAVED ADDRESSES ===");
  if (user) {
    const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", user.id);
    if (addresses && addresses.length > 0) {
      console.log(`Found ${addresses.length} saved address(es):`);
      addresses.forEach((addr, i) => {
        console.log(`\nAddress #${i + 1}:`);
        console.log(`  Name: ${addr.name}`);
        console.log(`  Phone: ${addr.phone}`);
        console.log(`  Street: ${addr.address}`);
        console.log(`  City: ${addr.city}`);
        console.log(`  State: ${addr.state}`);
        console.log(`  Pincode: ${addr.pincode}`);
      });
    } else {
      console.log("No saved addresses found for this user.");
    }
  }
}
run();
