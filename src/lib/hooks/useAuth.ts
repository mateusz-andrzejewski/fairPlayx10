import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../../db/supabase.client";
import type { AuthRequest, AuthResponse, UserDTO } from "../../types";
import { mockDashboardUser } from "../mocks/dashboardMock";
import { isDashboardAuthDisabled } from "../utils/featureFlags";

export function useAuth() {
  const authDisabled = useMemo(() => isDashboardAuthDisabled(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(authDisabled);
  const [user, setUser] = useState<UserDTO | null>(authDisabled ? mockDashboardUser : null);
  const [isLoading, setIsLoading] = useState(!authDisabled);

  useEffect(() => {
    if (authDisabled) {
      // Tryb development bez wymagań auth - ustaw mock użytkownika
      setIsAuthenticated(true);
      setUser(mockDashboardUser);
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

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
        setIsLoading(false);
      }
    };

    checkSession();

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

    return () => {
      unsubscribe?.();
    };
  }, [authDisabled]);

  const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
    if (authDisabled) {
      setIsAuthenticated(true);
      setUser(mockDashboardUser);
      return {
        token: "dev-mode-token",
        user: mockDashboardUser,
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
