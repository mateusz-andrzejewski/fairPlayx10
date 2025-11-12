import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabaseClient } from "../../db/supabase.client";
import { isDashboardAuthDisabled } from "../utils/featureFlags";
import type { DashboardDTO, DashboardViewModel, NotificationDTO, PlayerDTO, UserDTO } from "../../types";

interface DashboardApiError {
  error: string;
  message: string;
}

const DEV_DASHBOARD_ERROR =
  "Nie udało się załadować danych dashboardu w trybie developerskim. Upewnij się, że baza została zasilona.";

export function useDashboardData() {
  const authDisabled = useMemo(() => isDashboardAuthDisabled(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardViewModel | null>(null);

  const transformDashboardData = useCallback(async (apiData: DashboardDTO): Promise<DashboardViewModel> => {
    const { user, upcoming_events, organized_events, pending_users } = apiData;

    const nearestEvent = upcoming_events.length > 0 ? upcoming_events[0] : null;

    const notifications: NotificationDTO[] = [];

    if (pending_users && pending_users > 0 && user.role === "admin") {
      notifications.push({
        id: 1,
        type: "pending_users",
        message: `Masz ${pending_users} oczekujących użytkowników do zatwierdzenia`,
        actionUrl: "/dashboard/users",
      });
    }

    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingThisWeek = upcoming_events.filter((event) => new Date(event.event_datetime) <= weekFromNow);

    if (upcomingThisWeek.length > 0) {
      notifications.push({
        id: 2,
        type: "upcoming_events",
        message: `Masz ${upcomingThisWeek.length} wydarzeń w najbliższym tygodniu`,
        actionUrl: "/dashboard/events",
      });
    }

    let managementData: DashboardViewModel["managementData"] = null;
    if (user.role === "admin" || user.role === "organizer") {
      try {
        const [usersData, playersData] = await Promise.all([
          user.role === "admin" ? fetchUsers() : Promise.resolve([]),
          user.role === "admin" || user.role === "organizer" ? fetchPlayers() : Promise.resolve([]),
        ]);

        managementData = {
          users: usersData,
          events: organized_events,
          players: playersData,
        };
      } catch (fetchError) {
        console.warn("[dashboard] Nie udało się pobrać danych zarządzania", fetchError);
      }
    }

    return {
      currentUser: user,
      nearestEvent,
      upcomingEvents: upcoming_events,
      notifications,
      managementData,
    };
  }, []);

  const fetchUsers = async (): Promise<UserDTO[]> => {
    const { data, error } = await supabaseClient
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .is("deleted_at", null)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  const fetchPlayers = async (): Promise<PlayerDTO[]> => {
    const { data, error } = await supabaseClient
      .from("players")
      .select(
        `
        id,
        first_name,
        last_name,
        position,
        skill_rate,
        created_at,
        updated_at,
        deleted_at
      `
      )
      .is("deleted_at", null)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  const loadDashboardData = useCallback(
    async (isRetry = false) => {
      setLoading(true);
      setError(null);

      if (isRetry) {
        setRetryCount((prev) => prev + 1);
      }

      try {
        const response = await fetch("/api/dashboard", {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as DashboardApiError;
          throw new Error(payload?.message ?? `HTTP ${response.status}`);
        }

        const data = (await response.json()) as DashboardDTO;
        const viewModel = await transformDashboardData(data);
        setDashboardData(viewModel);
        setRetryCount(0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się załadować danych dashboardu";
        setError(authDisabled ? DEV_DASHBOARD_ERROR : errorMessage);

        if (retryCount < 2 && !authDisabled) {
          toast.error("Błąd podczas ładowania danych dashboardu", {
            description: `${errorMessage}. Spróbuj ponownie.`,
            action: {
              label: "Spróbuj ponownie",
              onClick: () => loadDashboardData(true),
            },
          });
        } else {
          toast.error("Błąd podczas ładowania danych dashboardu", {
            description: authDisabled ? DEV_DASHBOARD_ERROR : errorMessage,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [authDisabled, retryCount, transformDashboardData]
  );

  const refetch = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    dashboardData,
    refetch,
    retry: () => loadDashboardData(true),
  };
}
