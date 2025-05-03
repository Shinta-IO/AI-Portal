// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error("❌ Missing SUPABASE_URL");
}
if (!serviceRole) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
}

if (!url || !serviceRole) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabaseServer = createClient(url, serviceRole);
