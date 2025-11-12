import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import type { SupabaseClient } from "../../../db/supabase.client";
import type { LoginSchemaOutput, RegisterSchemaOutput } from "../../validation/auth";
import type { UserDTO, AuthErrorCode, LoginSuccessResponse, RegisterResponse } from "../../../types";

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

    const profile = await this.getUserProfile(data.user, email);

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

  async register(data: RegisterSchemaOutput): Promise<RegisterResponse> {
    const { email, password, first_name, last_name, position, consent } = data;

    console.log("Starting registration for email:", email);

    // Sprawdź czy email już istnieje
    const { data: existingUser, error: checkError } = await this.supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Check existing user error:", checkError);
      throw new AuthServiceError("Nie udało się sprawdzić dostępności adresu email", "INTERNAL_ERROR", 500);
    }

    if (existingUser) {
      console.log("Email already exists:", email);
      throw new AuthServiceError("Adres email jest już zajęty", "EMAIL_TAKEN", 400);
    }

    // Rejestracja w Supabase Auth
    console.log("Registering in Supabase Auth...");
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          position,
        },
        emailRedirectTo: `${import.meta.env.PUBLIC_BASE_URL || "http://localhost:3000"}/login`,
      },
    });

    if (authError) {
      console.error("Supabase Auth error:", authError);
      if (authError.message.includes("User already registered")) {
        throw new AuthServiceError("Adres email jest już zajęty", "EMAIL_TAKEN", 400);
      }
      throw new AuthServiceError("Nie udało się utworzyć konta", "INTERNAL_ERROR", 500);
    }

    if (!authData.user) {
      console.error("No auth user returned");
      throw new AuthServiceError("Nie udało się utworzyć konta", "INTERNAL_ERROR", 500);
    }

    console.log("Supabase Auth user created:", authData.user.id);

    // Utworzenie profilu użytkownika w public.users
    console.log("Creating user profile in database...");
    const { data: userProfile, error: profileError } = await this.supabase
      .from("users")
      .insert({
        email,
        password_hash: "supabase-auth-managed", // Placeholder dla istniejącej kolumny NOT NULL
        first_name,
        last_name,
        role: "player",
        status: "pending",
        consent_date: new Date().toISOString(),
        consent_version: "1.0",
        player_id: null, // Nie tworzymy automatycznie profilu gracza
        deleted_at: null,
      })
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .single();

    if (profileError || !userProfile) {
      console.error("Profile creation error:", profileError);
      // W środowisku deweloperskim nie mamy dostępu do admin API Supabase
      // W produkcji należałoby usunąć użytkownika z Auth jeśli profil się nie utworzył
      throw new AuthServiceError("Nie udało się utworzyć profilu użytkownika", "INTERNAL_ERROR", 500);
    }

    console.log("User profile created successfully:", userProfile.id);

    return {
      success: true,
      message: "Rejestracja zakończona sukcesem. Sprawdź swoją skrzynkę email i potwierdź konto.",
      user: {
        id: userProfile.id,
        email: userProfile.email,
        status: userProfile.status,
      },
    };
  }

  /**
   * Pobiera profil użytkownika bez automatycznego tworzenia gracza.
   * Zgodnie z PRD US-003: Zatwierdzanie rejestracji przez Admina,
   * profil gracza jest tworzony podczas zatwierdzania przez admina, nie przy logowaniu.
   */
  private async getUserProfile(authUser: SupabaseAuthUser, rawEmail: string): Promise<UserDTO> {
    const normalizedEmail = rawEmail.trim().toLowerCase();

    const { data: existingProfile, error: fetchError } = await this.supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
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
      return existingProfile as UserDTO;
    }

    // Jeśli profil nie istnieje, utwórz go (może się zdarzyć w przypadku OAuth)
    const { firstName, lastName } = this.resolveNames(authUser);

    const { data: insertedProfile, error: insertError } = await this.supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash: "supabase-auth-managed",
        first_name: firstName,
        last_name: lastName,
        role: "player",
        status: "pending", // Nowi użytkownicy wymagają zatwierdzenia przez admina
        consent_date: new Date().toISOString(),
        consent_version: "1.0",
        player_id: null, // Nie tworzymy automatycznie profilu gracza
        deleted_at: null,
      })
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .single();

    if (insertError || !insertedProfile) {
      throw new AuthServiceError("Nie udało się utworzyć profilu użytkownika", "INTERNAL_ERROR", 500);
    }

    return insertedProfile as UserDTO;
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
}

export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
