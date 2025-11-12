import { useEffect, useMemo, useState } from "react";

import { supabaseClient } from "../../db/supabase.client";
import type { AuthRequest, LoginSuccessResponse, LoginSessionDTO, UserDTO, AuthErrorCode } from "../../types";
import { isDashboardAuthDisabled } from "../utils/featureFlags";

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
  const authDisabled = useMemo(() => isDashboardAuthDisabled(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async (): Promise<UserDTO | null> => {
    try {
      const response = await fetch("/api/auth/session", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { user: UserDTO | null };
      return payload.user ?? null;
    } catch (error) {
      console.error("Failed to resolve auth session:", error);
      return null;
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const checkSession = async () => {
      if (authDisabled) {
        setIsLoading(true);
        const sessionUser = await fetchSession();
        if (!cancelled) {
          setIsAuthenticated(Boolean(sessionUser));
          setUser(sessionUser);
          setIsLoading(false);
        }
        return;
      }

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

    if (!authDisabled) {
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
    }

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [authDisabled]);

  const login = async (credentials: AuthRequest): Promise<LoginSuccessResponse> => {
    if (authDisabled) {
      const sessionUser = await fetchSession();
      if (!sessionUser) {
        throw new Error("Brak sesji developmentowej");
      }
      setIsAuthenticated(true);
      setUser(sessionUser);
      return {
        user: sessionUser,
        success: true,
        message: "Zalogowano w trybie deweloperskim",
      };
    }

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
    if (authDisabled) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}
