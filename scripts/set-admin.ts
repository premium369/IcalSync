
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address.");
    console.log("Usage: npx tsx scripts/set-admin-supabase.ts <email>");
    process.exit(1);
  }

  // 1. Check if user exists in public.users
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (fetchError || !user) {
    console.error(`User with email ${email} not found in public.users table.`);
    if (fetchError) console.error(fetchError.message);
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (Current Role: ${user.role})`);

  // 2. Update role
  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("email", email)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to update user role.");
    console.error(updateError.message);
    process.exit(1);
  }

  console.log(`Successfully updated user ${updatedUser.email} to role: ${updatedUser.role}`);
}

main();
