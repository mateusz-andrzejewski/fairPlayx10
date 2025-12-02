import type { SupabaseClient } from "../../supabase.client";

import type { DashboardDTO, UserDTO, EventDTO, EventSignupDTO } from "../../../types";
import { createEventService } from "../event.service";

/**
 * Serwis do zarządzania logiką biznesową pulpitu nawigacyjnego.
 * Agreguje dane kontekstowe dla zalogowanego użytkownika.
 */
export class DashboardService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Pobiera agregowane dane pulpitu dla danego użytkownika.
   * Wykonuje równoległe zapytania dla optymalizacji wydajności.
   * Przed pobraniem wydarzeń automatycznie oznacza przeszłe wydarzenia jako 'completed'.
   *
   * @param userId - ID użytkownika
   * @param userRole - Rola użytkownika (admin/organizer/player)
   * @param playerId - Opcjonalne ID gracza powiązanego z użytkownikiem
   * @returns Promise rozwiązujący się do danych pulpitu
   */
  async getDashboardData(userId: number, userRole: string, playerId?: number): Promise<DashboardDTO> {
    // Najpierw automatycznie zaktualizuj status wydarzeń które już się odbyły
    // To zapewnia spójność statusów w całej aplikacji
    const eventService = createEventService(this.supabase);
    await eventService.completePastEvents().catch((error) => {
      // Logujemy błąd ale nie przerywamy operacji - to nie jest krytyczne
      console.warn("[dashboard] Nie udało się automatycznie zaktualizować statusów wydarzeń", error);
    });

    // Równoległe pobranie wszystkich danych dla optymalizacji
    const [userProfile, upcomingEvents, mySignups, organizedEvents, pendingUsersCount] = await Promise.all([
      this.loadUserProfile(userId),
      this.loadUpcomingEvents(),
      playerId ? this.loadMySignups(playerId) : Promise.resolve([]),
      this.shouldLoadOrganizedEvents(userRole) ? this.loadManagedEvents(userId, userRole) : Promise.resolve([]),
      this.shouldLoadPendingUsers(userRole)
        ? this.loadPendingUsersCount().catch((error) => {
            console.warn("[dashboard] Nie udało się pobrać liczby oczekujących użytkowników", error);
            return 0;
          })
        : Promise.resolve(undefined),
    ]);

    return {
      user: userProfile,
      upcoming_events: upcomingEvents,
      my_signups: mySignups,
      organized_events: organizedEvents,
      ...(pendingUsersCount !== undefined && { pending_users: pendingUsersCount }),
    };
  }

  /**
   * Ładuje profil użytkownika na podstawie jego ID.
   *
   * @param userId - ID użytkownika
   * @returns Promise rozwiązujący się do profilu użytkownika
   * @throws Error gdy profil nie istnieje
   */
  private async loadUserProfile(userId: number): Promise<UserDTO> {
    const baseSelect = "id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at";

    const query = this.supabase.from("users").select(baseSelect).eq("id", userId).is("deleted_at", null);

    const { data, error } = await query.single();

    if (error) {
      if (error.message.includes("deleted_at")) {
        const fallbackQuery = this.supabase
          .from("users")
          .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at")
          .eq("id", userId)
          .single();

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;

        if (fallbackError) {
          throw new Error(`Failed to load user profile: ${fallbackError.message}`);
        }

        if (!fallbackData) {
          throw new Error("User profile not found");
        }

        return {
          ...fallbackData,
          deleted_at: null,
        } as UserDTO;
      }

      throw new Error(`Failed to load user profile: ${error.message}`);
    }

    if (!data) {
      throw new Error("User profile not found");
    }

    return {
      ...data,
      deleted_at: (data as Partial<UserDTO>).deleted_at ?? null,
    } as UserDTO;
  }

  /**
   * Ładuje nadchodzące wydarzenia (maksymalnie 5) z filtrami statusu i daty.
   *
   * @returns Promise rozwiązujący się do listy nadchodzących wydarzeń
   */
  private async loadUpcomingEvents(): Promise<EventDTO[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select(
        `
        id,
        name,
        location,
        event_datetime,
        max_places,
        optional_fee,
        status,
        current_signups_count,
        organizer_id,
        created_at,
        updated_at,
        deleted_at
      `
      )
      .gte("event_datetime", new Date().toISOString())
      .is("deleted_at", null)
      .in("status", ["active"])
      .order("event_datetime", { ascending: true })
      .limit(5);

    if (error) {
      throw new Error(`Failed to load upcoming events: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Ładuje zapisy gracza na wydarzenia z wykluczeniem rezygnacji.
   *
   * @param playerId - ID gracza
   * @returns Promise rozwiązujący się do listy zapisów gracza
   */
  private async loadMySignups(playerId: number): Promise<EventSignupDTO[]> {
    const { data, error } = await this.supabase
      .from("event_signups")
      .select(
        `
        id,
        event_id,
        player_id,
        signup_timestamp,
        status,
        resignation_timestamp
      `
      )
      .eq("player_id", playerId)
      .neq("status", "withdrawn")
      .order("signup_timestamp", { ascending: false });

    if (error) {
      throw new Error(`Failed to load my signups: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Ładuje wydarzenia zarządzane przez użytkownika.
   * - Admin: wszystkie wydarzenia
   * - Organizer: tylko wydarzenia organizowane przez użytkownika
   *
   * @param userId - ID użytkownika
   * @param userRole - Rola użytkownika
   * @returns Promise rozwiązujący się do listy zarządzanych wydarzeń
   */
  private async loadManagedEvents(userId: number, userRole: string): Promise<EventDTO[]> {
    let query = this.supabase
      .from("events")
      .select(
        `
        id,
        name,
        location,
        event_datetime,
        max_places,
        optional_fee,
        status,
        current_signups_count,
        organizer_id,
        created_at,
        updated_at,
        deleted_at
      `
      )
      .is("deleted_at", null)
      .order("event_datetime", { ascending: false });

    // Dla organizatora filtrujemy tylko jego wydarzenia
    if (userRole === "organizer") {
      query = query.eq("organizer_id", userId);
    }
    // Dla admina pobieramy wszystkie wydarzenia (bez dodatkowego filtra)

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to load managed events: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Ładuje liczbę oczekujących użytkowników (tylko dla administratorów).
   *
   * @returns Promise rozwiązujący się do liczby oczekujących użytkowników
   */
  private async loadPendingUsersCount(): Promise<number> {
    const baseQuery = this.supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .is("deleted_at", null);

    const { count, error } = await baseQuery;

    if (error) {
      if (error.message.includes("deleted_at")) {
        const fallbackQuery = await this.supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        if (fallbackQuery.error) {
          throw new Error(`Failed to load pending users count: ${fallbackQuery.error.message}`);
        }

        return fallbackQuery.count || 0;
      }

      throw new Error(`Failed to load pending users count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Sprawdza czy należy ładować wydarzenia organizowane przez użytkownika.
   *
   * @param userRole - Rola użytkownika
   * @returns true jeśli użytkownik może organizować wydarzenia
   */
  private shouldLoadOrganizedEvents(userRole: string): boolean {
    return userRole === "organizer" || userRole === "admin";
  }

  /**
   * Sprawdza czy należy ładować liczbę oczekujących użytkowników.
   *
   * @param userRole - Rola użytkownika
   * @returns true jeśli użytkownik jest administratorem
   */
  private shouldLoadPendingUsers(userRole: string): boolean {
    return userRole === "admin";
  }
}

/**
 * Fabryka do tworzenia instancji serwisu dashboard.
 *
 * @param supabase - Klient Supabase
 * @returns Instancja DashboardService
 */
export function createDashboardService(supabase: SupabaseClient): DashboardService {
  return new DashboardService(supabase);
}
