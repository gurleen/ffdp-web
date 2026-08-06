import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. Copy apps/server/.env.example to apps/server/.env and fill them in.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
