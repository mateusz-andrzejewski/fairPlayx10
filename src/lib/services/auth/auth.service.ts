import type { SupabaseClient } from "../../../db/supabase.client";
import type { LoginSchemaOutput } from "../../validation/auth";
import type { UserDTO, AuthErrorCode, LoginSuccessResponse } from "../../../types";

interface SupabaseSessionLike {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type?: string;
}

export interface AuthServiceLoginResult extends LoginSuccessResponse {
  session: SupabaseSessionLike;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly status: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async login(credentials: LoginSchemaOutput): Promise<AuthServiceLoginResult> {
    const { email, password } = credentials;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthServiceError("Nieprawidłowy email lub hasło", "INVALID_CREDENTIALS", 401);
    }

    if (!data.session || !data.user) {
      throw new AuthServiceError("Wystąpił błąd podczas logowania", "INTERNAL_ERROR", 500);
    }

    const { data: profile, error: profileError } = await this.supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .eq("email", email)
      .is("deleted_at", null)
      .single();

    if (profileError) {
      throw new AuthServiceError("Nieprawidłowy email lub hasło", "INVALID_CREDENTIALS", 401);
    }

    if (!profile) {
      throw new AuthServiceError("Nieprawidłowy email lub hasło", "INVALID_CREDENTIALS", 401);
    }

    if (profile.status === "pending") {
      throw new AuthServiceError("Twoje konto oczekuje na zatwierdzenie przez administratora", "PENDING_APPROVAL", 403);
    }

    if (profile.deleted_at !== null) {
      throw new AuthServiceError(
        "Konto zostało dezaktywowane. Skontaktuj się z administratorem.",
        "ACCOUNT_DISABLED",
        403
      );
    }

    const user: UserDTO = {
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      status: profile.status,
      player_id: profile.player_id,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      deleted_at: profile.deleted_at,
    };

    return {
      success: true,
      message: "Logowanie zakończone sukcesem",
      user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in ?? 3600,
        expires_at: data.session.expires_at ?? undefined,
        token_type: data.session.token_type,
      },
    };
  }
}

export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
