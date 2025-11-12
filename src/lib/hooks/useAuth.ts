import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../../db/supabase.client";
import type { AuthRequest, AuthResponse, UserDTO } from "../../types";
import { isDashboardAuthDisabled } from "../utils/featureFlags";

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
            .eq("id", session.user.id)
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
            .eq("id", session.user.id)
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

  const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
    if (authDisabled) {
      const sessionUser = await fetchSession();
      if (!sessionUser) {
        throw new Error("Brak sesji developmentowej");
      }
      setIsAuthenticated(true);
      setUser(sessionUser);
      return {
        token: "dev-mode-token",
        user: sessionUser,
        expiresIn: 60 * 60,
      };
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Nie udało się zalogować - brak sesji");
    }

    const profile = await supabaseClient
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .eq("id", data.user.id)
      .is("deleted_at", null)
      .single();

    const resolvedUser = (profile.data as UserDTO | null) ?? null;
    setUser(resolvedUser);
    setIsAuthenticated(true);

    return {
      token: data.session.access_token,
      user: resolvedUser ?? {
        id: Number.parseInt(data.user.id, 10),
        email: data.user.email ?? "",
        first_name: data.user.user_metadata?.first_name ?? "",
        last_name: data.user.user_metadata?.last_name ?? "",
        role: "player",
        status: "approved",
        player_id: null,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
        deleted_at: null,
      },
      expiresIn: data.session.expires_in ?? 3600,
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
