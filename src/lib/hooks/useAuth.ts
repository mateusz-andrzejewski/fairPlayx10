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
    // Sprawdź czy jesteśmy po stronie klienta
    if (typeof window === "undefined") {
      console.log("[useAuth] Not in browser environment");
      setIsLoading(false);
      return;
    }

    console.log("[useAuth] Initializing auth check");
    let cancelled = false;

    // Safety timeout - jeśli po 5 sekundach nadal ładujemy, wymuś zakończenie
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("[useAuth] Timeout reached - forcing isLoading to false");
        setIsLoading(false);
      }
    }, 5000);

    const initializeAuth = async () => {
      console.log("[useAuth] Starting initializeAuth");
      try {
        console.log("[useAuth] Fetching session from /api/auth/session...");
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        });

        console.log("[useAuth] Session API response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("[useAuth] Session data received:", data.user ? "user found" : "no user");
          
          if (data.user) {
            console.log("[useAuth] User authenticated:", data.user.email, "role:", data.user.role);
            setIsAuthenticated(true);
            setUser(data.user as UserDTO);
          } else {
            console.log("[useAuth] No user in session");
            setIsAuthenticated(false);
            setUser(null);
          }
        } else if (response.status === 401) {
          console.log("[useAuth] Unauthorized - no session");
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.error("[useAuth] Session API error:", response.status);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("[useAuth] Error in initializeAuth:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (!cancelled) {
          console.log("[useAuth] initializeAuth complete, setting isLoading to false");
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    // Uruchom inicjalizację
    initializeAuth();

    // Ustaw listener zmian auth
    console.log("[useAuth] Setting up onAuthStateChange listener");
    const { data } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event, session ? "session exists" : "no session");
      
      if (event === "SIGNED_IN" && session?.user) {
        console.log("[useAuth] onAuthStateChange: User signed in, refreshing session from API");
        
        // Odśwież sesję przez API zamiast bezpośrednio z bazy
        try {
          const response = await fetch("/api/auth/session", {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              console.log("[useAuth] onAuthStateChange: Profile refreshed:", data.user.role);
              setIsAuthenticated(true);
              setUser(data.user as UserDTO);
            }
          }
        } catch (error) {
          console.error("[useAuth] onAuthStateChange: Error refreshing session:", error);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("[useAuth] onAuthStateChange: Signed out");
        setIsAuthenticated(false);
        setUser(null);
      }
      
      // Nie ustawiaj isLoading tutaj - to jest tylko dla zmian sesji, nie dla pierwszego ładowania
    });

    return () => {
      console.log("[useAuth] Cleanup");
      cancelled = true;
      clearTimeout(timeoutId);
      data.subscription.unsubscribe();
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
