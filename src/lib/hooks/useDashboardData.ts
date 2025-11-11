import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabaseClient } from "../../db/supabase.client";
import { createDashboardService } from "../services/dashboard/dashboard.service";
import type { DashboardViewModel, DashboardDTO, UserDTO, EventDTO, PlayerDTO, NotificationDTO } from "../../types";

/**
 * Hook do zarządzania danymi dashboardu.
 * Ładuje dane przy montowaniu komponentu i obsługuje refetch po akcjach użytkownika.
 */
export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardViewModel | null>(null);

  const dashboardService = createDashboardService(supabaseClient);

  /**
   * Transformuje dane z API na DashboardViewModel zgodnie z planem implementacji.
   */
  const transformDashboardData = useCallback(async (apiData: DashboardDTO): Promise<DashboardViewModel> => {
    const { user, upcoming_events, my_signups, organized_events, pending_users } = apiData;

    // Znajdź najbliższe wydarzenie
    const nearestEvent = upcoming_events.length > 0 ? upcoming_events[0] : null;

    // Przygotuj powiadomienia (mock na razie - w przyszłości będą z API)
    const notifications: NotificationDTO[] = [];

    // Dodaj powiadomienia na podstawie danych
    if (pending_users && pending_users > 0 && user.role === 'admin') {
      notifications.push({
        id: 1,
        type: 'pending_users',
        message: `Masz ${pending_users} oczekujących użytkowników do zatwierdzenia`,
        actionUrl: '/dashboard/users'
      });
    }

    // Dodaj powiadomienia o nadchodzących wydarzeniach
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingThisWeek = upcoming_events.filter(event =>
      new Date(event.event_datetime) <= weekFromNow
    );

    if (upcomingThisWeek.length > 0) {
      notifications.push({
        id: 2,
        type: 'upcoming_events',
        message: `Masz ${upcomingThisWeek.length} wydarzeń w najbliższym tygodniu`,
        actionUrl: '/dashboard/events'
      });
    }

    // Przygotuj dane zarządzania (tylko dla admin/organizer)
    let managementData = null;
    if (user.role === 'admin' || user.role === 'organizer') {
      try {
        // Pobierz dodatkowe dane dla sekcji zarządzania
        const [usersData, playersData] = await Promise.all([
          user.role === 'admin' ? fetchUsers() : Promise.resolve([]),
          (user.role === 'admin' || user.role === 'organizer') ? fetchPlayers() : Promise.resolve([])
        ]);

        managementData = {
          users: usersData,
          events: organized_events,
          players: playersData
        };
      } catch (err) {
        console.warn('Failed to load management data:', err);
        // Nie przerywaj ładowania dashboardu z powodu błędów w danych zarządzania
      }
    }

    return {
      currentUser: user,
      nearestEvent,
      upcomingEvents: upcoming_events,
      notifications,
      managementData
    };
  }, []);

  /**
   * Pomocnicza funkcja do pobierania użytkowników (tylko dla admin).
   */
  const fetchUsers = async (): Promise<UserDTO[]> => {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, email, first_name, last_name, role, status, player_id, created_at, updated_at')
      .is('deleted_at', null)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  /**
   * Pomocnicza funkcja do pobierania graczy (dla admin/organizer).
   */
  const fetchPlayers = async (): Promise<PlayerDTO[]> => {
    const { data, error } = await supabaseClient
      .from('players')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        position,
        skill_rate,
        created_at,
        updated_at
      `)
      .is('deleted_at', null)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  /**
   * Ładuje dane dashboardu z obsługą retry.
   */
  const loadDashboardData = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }

      // Pobierz aktualnego użytkownika z Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();

      if (authError || !authUser) {
        throw new Error('User not authenticated');
      }

      // Pobierz profil użytkownika z tabeli users żeby uzyskać rolę i player_id
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('users')
        .select('id, email, first_name, last_name, role, status, player_id, created_at, updated_at')
        .eq('id', authUser.id)
        .is('deleted_at', null)
        .single();

      if (profileError || !userProfile) {
        throw new Error('Failed to load user profile');
      }

      // Sprawdź czy użytkownik jest aktywny
      if (userProfile.status !== 'active') {
        throw new Error('User account is not active');
      }

      // Pobierz dane dashboardu z serwisu używając prawdziwej roli
      const apiData = await dashboardService.getDashboardData(
        authUser.id,
        userProfile.role,
        userProfile.player_id || undefined
      );

      // Transformuj dane na DashboardViewModel
      const viewModel = await transformDashboardData(apiData);
      setDashboardData(viewModel);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);

      // Pokaż toast z opcją retry jeśli to nie jest finalny błąd
      if (retryCount < 2) {
        toast.error('Błąd podczas ładowania danych dashboardu', {
          description: `${errorMessage}. Spróbuj ponownie.`,
          action: {
            label: 'Spróbuj ponownie',
            onClick: () => loadDashboardData(true),
          },
        });
      } else {
        toast.error('Błąd podczas ładowania danych dashboardu', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [dashboardService, transformDashboardData, retryCount]);

  /**
   * Refetch danych dashboardu (np. po wykonaniu akcji).
   */
  const refetch = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Ładuj dane przy montowaniu komponentu
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    dashboardData,
    refetch,
    retry: () => loadDashboardData(true)
  };
}
