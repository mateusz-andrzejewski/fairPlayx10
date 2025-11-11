import { useState, useEffect } from "react";
import { supabaseClient } from "../../db/supabase.client";
import type { AuthRequest, AuthResponse, UserDTO } from "../../types";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          // TODO: Fetch user profile from users table
          setUser(null); // For now, set to null
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setIsAuthenticated(true);
          // TODO: Fetch user profile from users table
          setUser(null); // For now, set to null
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Login failed - no session returned");
    }

    // TODO: Fetch user profile from users table and check status
    // For now, return basic response
    const response: AuthResponse = {
      token: data.session.access_token,
      user: {
        id: parseInt(data.user.id),
        email: data.user.email!,
        first_name: "",
        last_name: "",
        role: "player", // Default role
        status: "approved", // Default status
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      },
      expiresIn: data.session.expires_in || 3600,
    };

    // Check user status after login
    // TODO: Implement user status check
    // if (user.status === "pending") {
    //   throw new Error("Konto oczekuje zatwierdzenia");
    // }

    return response;
  };

  const logout = async () => {
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
