import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. Copy apps/server/.env.example to apps/server/.env and fill them in.",
  );
}

// All tables live in `core`, not `public` — see the note atop database.types.ts.
// `core` must be added to Project Settings -> Data API -> Exposed schemas
// before queries through this client will succeed (PostgREST rejects
// non-exposed schemas at request time, independent of RLS).
export const supabase = createClient<Database, "core">(supabaseUrl, supabaseKey, {
  db: { schema: "core" },
});
