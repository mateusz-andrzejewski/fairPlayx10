/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";
import type { UserDTO } from "./types";
import type { RequestActor } from "./lib/auth/request-actor";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: UserDTO;
      actor?: RequestActor;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_KEY?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
