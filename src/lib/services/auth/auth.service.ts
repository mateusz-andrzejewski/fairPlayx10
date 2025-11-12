import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

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

    const profile = await this.ensureUserProfile(data.user, email);

    if (profile.status === "pending") {
      throw new AuthServiceError("Twoje konto oczekuje na zatwierdzenie przez administratora", "PENDING_APPROVAL", 403);
    }

    return {
      success: true,
      message: "Logowanie zakończone sukcesem",
      user: profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in ?? 3600,
        expires_at: data.session.expires_at ?? undefined,
        token_type: data.session.token_type,
      },
    };
  }

  private async ensureUserProfile(authUser: SupabaseAuthUser, rawEmail: string): Promise<UserDTO> {
    const normalizedEmail = rawEmail.trim().toLowerCase();

    const { data: existingProfile, error: fetchError } = await this.supabase
      .from("users")
      .select(
        "id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at"
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      throw new AuthServiceError("Nie udało się pobrać profilu użytkownika", "INTERNAL_ERROR", 500);
    }

    if (existingProfile?.deleted_at) {
      throw new AuthServiceError(
        "Konto zostało dezaktywowane. Skontaktuj się z administratorem.",
        "ACCOUNT_DISABLED",
        403
      );
    }

    if (existingProfile) {
      return this.ensurePlayerLinked(existingProfile as UserDTO);
    }

    const { firstName, lastName } = this.resolveNames(authUser);

    const { data: insertedProfile, error: insertError } = await this.supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash: "supabase-auth-managed",
        first_name: firstName,
        last_name: lastName,
        role: "player",
        status: "approved",
        consent_date: new Date().toISOString(),
        consent_version: "1.0",
        player_id: null,
        deleted_at: null,
      })
      .select(
        "id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at"
      )
      .single();

    if (insertError || !insertedProfile) {
      throw new AuthServiceError("Nie udało się utworzyć profilu użytkownika", "INTERNAL_ERROR", 500);
    }

    return this.ensurePlayerLinked(insertedProfile as UserDTO);
  }

  private resolveNames(authUser: SupabaseAuthUser): { firstName: string; lastName: string } {
    const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;

    const metadataFirst = this.extractMetadataValue(metadata, ["first_name", "given_name"]);
    const metadataLast = this.extractMetadataValue(metadata, ["last_name", "family_name"]);
    if (metadataFirst && metadataLast) {
      return { firstName: metadataFirst, lastName: metadataLast };
    }

    const fullName = this.extractMetadataValue(metadata, ["full_name", "name"]);
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return { firstName: this.capitalize(parts[0]), lastName: this.capitalize(parts.slice(1).join(" ")) };
      }
      return { firstName: this.capitalize(parts[0]), lastName: "Użytkownik" };
    }

    const emailLocalPart = (authUser.email ?? "").split("@")[0] ?? "user";
    const fallbackParts = emailLocalPart.split(/[._-]/).filter(Boolean);

    if (fallbackParts.length >= 2) {
      return {
        firstName: this.capitalize(fallbackParts[0]),
        lastName: this.capitalize(fallbackParts.slice(1).join(" ")),
      };
    }

    return {
      firstName: this.capitalize(emailLocalPart || "Użytkownik"),
      lastName: "Użytkownik",
    };
  }

  private extractMetadataValue(metadata: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = metadata[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
    return "";
  }

  private capitalize(value: string): string {
    if (!value) {
      return "";
    }

    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  private async ensurePlayerLinked(user: UserDTO): Promise<UserDTO> {
    if (user.player_id) {
      return user;
    }

    const { data: player, error: createPlayerError } = await this.supabase
      .from("players")
      .insert({
        first_name: user.first_name || "Nowy",
        last_name: user.last_name || "Zawodnik",
        position: "midfielder",
        skill_rate: 5,
        date_of_birth: null,
        deleted_at: null,
      })
      .select("id")
      .single();

    if (createPlayerError || !player) {
      throw new AuthServiceError("Nie udało się utworzyć profilu gracza dla użytkownika", "INTERNAL_ERROR", 500);
    }

    const { data: updatedUser, error: updateUserError } = await this.supabase
      .from("users")
      .update({
        player_id: player.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .single();

    if (updateUserError || !updatedUser) {
      throw new AuthServiceError(
        "Nie udało się powiązać użytkownika z profilem gracza",
        "INTERNAL_ERROR",
        500
      );
    }

    return updatedUser as UserDTO;
  }
}

export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
