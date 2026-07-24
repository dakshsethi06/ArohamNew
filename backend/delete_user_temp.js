const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// Read .env file manually
const envContent = fs.readFileSync(".env", "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.SUPABASE_URL || "https://lzzdfsphevmzbkkoskxb.supabase.co";
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Searching in public.users for phone '8619037218' or name 'Hshshdh'...");
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .or("phone.eq.8619037218,full_name.eq.Hshshdh");

  if (error) {
    console.error("Error searching user:", error);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log("No user found in public.users table.");
    process.exit(0);
  }

  const user = users[0];
  console.log("Found user:", user);
  const userId = user.id;

  // Delete from supabase auth
  console.log(`Deleting user from auth.users (ID: ${userId})...`);
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    console.error("Error deleting from auth.users:", authError);
    console.log("Attempting direct delete from public.users...");
  } else {
    console.log("Successfully deleted user from auth.users (cascaded to public.users)");
  }

  // Double check and delete from public tables just in case cascade is not set
  console.log("Cleaning up potential residual records from public tables...");
  
  const tables = [
    { name: "cart_items", col: "user_id" },
    { name: "addresses", col: "user_id" },
    { name: "users", col: "id" }
  ];

  for (const table of tables) {
    const { error: delErr } = await supabase
      .from(table.name)
      .delete()
      .eq(table.col, userId);
    if (delErr) {
      console.error(`Error deleting from ${table.name}:`, delErr);
    } else {
      console.log(`Deleted user entries in ${table.name}`);
    }
  }

  console.log("DELETE COMPLETED SUCCESSFULLY!");
}

run();
