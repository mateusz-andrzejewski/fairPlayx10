import { useEffect, useState } from "react";

import { supabaseClient } from "../../db/supabase.client";
import type { AuthRequest, LoginSuccessResponse, LoginSessionDTO, UserDTO, AuthErrorCode } from "../../types";

export class AuthClientError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AuthClientError";
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (session?.user) {
          setIsAuthenticated(true);
          const profile = await supabaseClient
            .from("users")
            .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
            .eq("email", session.user.email ?? "")
            .is("deleted_at", null)
            .single();

          if (profile.data) {
            setUser(profile.data as UserDTO);
          } else {
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const { data } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true);
        const profile = await supabaseClient
          .from("users")
          .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
          .eq("email", session.user.email ?? "")
          .is("deleted_at", null)
          .single();

        setUser(profile.data ?? null);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    });

    unsubscribe = () => data.subscription.unsubscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const login = async (credentials: AuthRequest): Promise<LoginSuccessResponse> => {
    const normalizedCredentials = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedCredentials),
    });

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Nieprawidłowa odpowiedź serwera logowania");
    }

    if (!response.ok) {
      const errorPayload = payload as { error?: AuthErrorCode; message?: string };
      throw new AuthClientError(
        errorPayload.error ?? "INTERNAL_ERROR",
        errorPayload.message ?? "Wystąpił błąd podczas logowania"
      );
    }

    const {
      user: loggedUser,
      session,
      message,
    } = payload as LoginSuccessResponse & {
      session: LoginSessionDTO;
    };

    const { error: setSessionError } = await supabaseClient.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (setSessionError) {
      throw new Error("Nie udało się utrwalić sesji logowania");
    }

    setUser(loggedUser);
    setIsAuthenticated(true);

    return {
      success: true,
      message,
      user: loggedUser,
    };
  };

  const logout = async () => {
    const [{ error }, logoutResponse] = await Promise.all([
      supabaseClient.auth.signOut(),
      fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }).catch((err) => {
        console.error("Logout API request failed", err);
        return null;
      }),
    ]);

    if (logoutResponse && !logoutResponse.ok) {
      console.warn("Failed to clear auth cookies during logout");
    }

    if (error) {
      throw new Error(error.message);
    }

    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}
