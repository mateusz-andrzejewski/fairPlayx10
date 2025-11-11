import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase URL. Set PUBLIC_SUPABASE_URL for the client bundle or SUPABASE_URL for server-only usage."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase anon key. Set PUBLIC_SUPABASE_ANON_KEY for the client bundle or SUPABASE_KEY for server-only usage."
  );
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

export const DEFAULT_USER_ID = "7794846b-b4a3-4f53-9164-e3943484b521";
