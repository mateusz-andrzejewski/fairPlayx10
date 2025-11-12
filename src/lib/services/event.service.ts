import type { SupabaseClient } from "../../db/supabase.client";

import type {
  CreateEventValidatedParams,
  UpdateEventValidatedParams,
  ListEventsValidatedParams,
} from "../validation/event";
import type {
  EventDTO,
  EventDetailDTO,
  EventsListResponseDTO,
  PaginationMetaDTO,
  CreateEventCommand,
} from "../../types";

/**
 * Serwis do zarządzania logiką biznesową związaną z wydarzeniami.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla wydarzeń.
 */
export class EventService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Automatycznie oznacza wydarzenia jako 'completed' jeśli ich data już minęła.
   * Aktualizuje tylko wydarzenia w statusie 'active'.
   * Wywołuje się automatycznie przed operacjami pobierania listy wydarzeń.
   * 
   * @returns Promise rozwiązujący się po zaktualizowaniu wydarzeń
   * @throws Error jeśli aktualizacja się nie powiedzie
   */
  private async autoCompleteEvents(): Promise<void> {
    const now = new Date().toISOString();
    
    // Zaktualizuj wszystkie aktywne wydarzenia które już się odbyły
    const { error } = await this.supabase
      .from("events")
      .update({ 
        status: "completed" as const,
        updated_at: now
      })
      .eq("status", "active")
      .lt("event_datetime", now)
      .is("deleted_at", null);

    if (error) {
      // Logujemy błąd ale nie przerywamy operacji - to nie jest krytyczne
      console.error("Błąd podczas automatycznego oznaczania wydarzeń jako completed:", error);
    }
  }

  /**
   * Tworzy nowe wydarzenie z domyślnymi wartościami.
   * Ustawia status na 'active', current_signups_count na 0, deleted_at na null.
   * Wydarzenie jest od razu widoczne i dostępne do zapisów dla graczy.
   *
   * @param payload - Zwalidowane dane wydarzenia z żądania
   * @param organizerId - ID organizatora wydarzenia (ustalany przez serwer)
   * @returns Promise rozwiązujący się do utworzonego EventDTO
   * @throws Error jeśli insert się nie powiedzie
   */
  async createEvent(payload: CreateEventValidatedParams, organizerId: number): Promise<EventDTO> {
    // Przygotuj dane do insertu z domyślnymi wartościami
    const eventData = {
      ...payload,
      organizer_id: organizerId,
      status: "active" as const, // Wydarzenie od razu aktywne po utworzeniu
      current_signups_count: 0,
      deleted_at: null,
    };

    // Wykonaj insert z returning aby uzyskać pełny rekord
    const { data: insertedEvent, error } = await this.supabase
      .from("events")
      .insert(eventData)
      .select(
        "id, name, location, event_datetime, max_places, optional_fee, status, current_signups_count, organizer_id, created_at, updated_at, deleted_at"
      )
      .single();

    if (error) {
      // Sprawdź czy to błąd konfliktu lub innych constraintów
      if (error.code === "23505") {
        throw new Error("Wydarzenie z podanymi parametrami już istnieje");
      }
      if (error.code === "23503") {
        throw new Error("Podany organizator nie istnieje");
      }
      throw new Error(`Nie udało się utworzyć wydarzenia: ${error.message}`);
    }

    if (!insertedEvent) {
      throw new Error("Nie udało się utworzyć wydarzenia - brak danych zwrotnych");
    }

    // Zwróć EventDTO (insertedEvent już ma właściwą strukturę)
    return insertedEvent;
  }

  /**
   * Pobiera szczegóły pojedynczego wydarzenia wraz z listą zapisów.
   * Filtruje usunięte wydarzenia (deleted_at IS NULL) i zwraca powiązane zapisy.
   * Przed pobraniem automatycznie oznacza przeszłe wydarzenia jako 'completed'.
   *
   * @param id - ID wydarzenia do pobrania
   * @returns Promise rozwiązujący się do EventDetailDTO lub null jeśli wydarzenie nie istnieje
   * @throws Error jeśli wystąpi błąd podczas zapytania do bazy danych
   */
  async getEventById(id: number): Promise<EventDetailDTO | null> {
    // Najpierw automatycznie zaktualizuj status wydarzeń które już się odbyły
    await this.autoCompleteEvents();
    
    // Wykonaj zapytanie z relacjami aby pobrać wydarzenie i powiązane zapisy
    const { data: eventData, error } = await this.supabase
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
        deleted_at,
        event_signups (
          id,
          event_id,
          player_id,
          signup_timestamp,
          status,
          resignation_timestamp,
          players:players!inner (
            id,
            first_name,
            last_name,
            position,
            skill_rate
          )
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      // Jeśli nie znaleziono rekordu, zwróć null (nie rzucaj błędu)
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Błąd podczas pobierania wydarzenia: ${error.message}`);
    }

    if (!eventData) {
      return null;
    }

    // Mapuj dane na EventDetailDTO
    const eventDetail: EventDetailDTO = {
      id: eventData.id,
      name: eventData.name,
      location: eventData.location,
      event_datetime: eventData.event_datetime,
      max_places: eventData.max_places,
      optional_fee: eventData.optional_fee,
      status: eventData.status,
      current_signups_count: eventData.current_signups_count,
      organizer_id: eventData.organizer_id,
      created_at: eventData.created_at,
      updated_at: eventData.updated_at,
      deleted_at: eventData.deleted_at,
      signups: (eventData.event_signups || [])
        .filter((signup) => signup.status !== "withdrawn")
        .map((signup) => ({
          id: signup.id,
          event_id: signup.event_id,
          player_id: signup.player_id,
          signup_timestamp: signup.signup_timestamp,
          status: signup.status,
          resignation_timestamp: signup.resignation_timestamp,
          player: signup.players
            ? {
                id: signup.players.id,
                first_name: signup.players.first_name,
                last_name: signup.players.last_name,
                position: signup.players.position,
                skill_rate: signup.players.skill_rate,
              }
            : null,
        })),
    };

    return eventDetail;
  }

  /**
   * Pobiera paginowaną listę aktywnych wydarzeń z opcjonalnym filtrowaniem.
   * Przed pobraniem automatycznie oznacza przeszłe wydarzenia jako 'completed'.
   *
   * @param params - Zwalidowane parametry zapytania zawierające filtry i ustawienia paginacji
   * @returns Promise rozwiązujący się do paginowanej listy wydarzeń
   * @throws Error jeśli zapytanie do bazy danych nie powiedzie się
   */
  async listEvents(params: ListEventsValidatedParams): Promise<EventsListResponseDTO> {
    // Najpierw automatycznie zaktualizuj status wydarzeń które już się odbyły
    await this.autoCompleteEvents();
    
    // Oblicz offset dla paginacji
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    // Buduj bazowe zapytanie
    let query = this.supabase
      .from("events")
      .select(
        "id, name, location, event_datetime, max_places, optional_fee, status, current_signups_count, organizer_id, created_at, updated_at, deleted_at",
        {
          count: "exact",
        }
      )
      .is("deleted_at", null) // Tylko aktywne wydarzenia
      .order("event_datetime", { ascending: true })
      .range(from, to);

    // Zastosuj filtr statusu jeśli określony
    if (params.status) {
      query = query.eq("status", params.status);
    }

    // Zastosuj filtr lokalizacji jeśli określony
    if (params.location && params.location.trim().length > 0) {
      // Szukaj w location używając ILIKE dla dopasowania bez uwzględniania wielkości liter
      query = query.ilike("location", `%${params.location}%`);
    }

    // Zastosuj filtr zakresu dat jeśli określony
    if (params.date_from) {
      query = query.gte("event_datetime", params.date_from);
    }
    if (params.date_to) {
      query = query.lte("event_datetime", params.date_to);
    }

    // Zastosuj filtr organizatora jeśli określony
    if (params.organizer_id) {
      query = query.eq("organizer_id", params.organizer_id);
    }

    // Wykonaj zapytanie
    const { data: rawEvents, error, count } = await query;

    if (error) {
      throw new Error(`Nie udało się pobrać wydarzeń: ${error.message}`);
    }

    if (!rawEvents || !count) {
      // Zwróć pusty wynik gdy brak danych
      return {
        data: [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: 0,
          total_pages: 0,
        },
      };
    }

    // Przekształć surowe dane na EventDTO
    const events: EventDTO[] = rawEvents.map((event) => ({
      id: event.id,
      name: event.name,
      location: event.location,
      event_datetime: event.event_datetime,
      max_places: event.max_places,
      optional_fee: event.optional_fee,
      status: event.status,
      current_signups_count: event.current_signups_count,
      organizer_id: event.organizer_id,
      created_at: event.created_at,
      updated_at: event.updated_at,
      deleted_at: event.deleted_at,
    }));

    // Oblicz metadane paginacji
    const totalPages = Math.ceil(count / params.limit);

    const pagination: PaginationMetaDTO = {
      page: params.page,
      limit: params.limit,
      total: count,
      total_pages: totalPages,
    };

    return {
      data: events,
      pagination,
    };
  }

  /**
   * Aktualizuje istniejące wydarzenie zgodnie z regułami biznesowymi.
   * Sprawdza własność wydarzenia i stosuje walidację domenową.
   *
   * @param id - ID wydarzenia do aktualizacji
   * @param payload - Zwalidowane dane aktualizacji wydarzenia
   * @param currentUserId - ID aktualnie zalogowanego użytkownika (do sprawdzenia własności)
   * @param isAdmin - Czy użytkownik jest administratorem
   * @returns Promise rozwiązujący się do zaktualizowanego EventDTO
   * @throws Error jeśli event nie istnieje, nie należy do użytkownika lub narusza reguły biznesowe
   */
  async updateEvent(
    id: number,
    payload: UpdateEventValidatedParams,
    currentUserId: number,
    isAdmin = false
  ): Promise<EventDTO> {
    // Najpierw pobierz istniejące wydarzenie aby sprawdzić własność i obecny stan
    const { data: existingEvent, error: fetchError } = await this.supabase
      .from("events")
      .select("id, name, location, event_datetime, max_places, optional_fee, status, organizer_id, deleted_at")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error("Wydarzenie nie zostało znalezione");
      }
      throw new Error(`Błąd podczas pobierania wydarzenia: ${fetchError.message}`);
    }

    if (!existingEvent) {
      throw new Error("Wydarzenie nie zostało znalezione");
    }

    // Sprawdź uprawnienia - właściciel lub admin może edytować
    if (existingEvent.organizer_id !== currentUserId && !isAdmin) {
      throw new Error("Brak uprawnień do edycji tego wydarzenia");
    }

    // Zastosuj walidację biznesową dla pól które mają być zaktualizowane
    const validatedPayload: Partial<UpdateEventValidatedParams> = { ...payload };

    // Walidacja daty - musi być w przyszłości jeśli podana
    if (validatedPayload.event_datetime) {
      const eventDate = new Date(validatedPayload.event_datetime);
      if (eventDate <= new Date()) {
        throw new Error("Data wydarzenia musi być w przyszłości");
      }
    }

    // Walidacja max_places - musi być > 0 jeśli podana
    if (validatedPayload.max_places !== undefined && validatedPayload.max_places <= 0) {
      throw new Error("Maksymalna liczba miejsc musi być większa od zera");
    }

    // Walidacja statusów - sprawdź niedozwolone przejścia
    if (validatedPayload.status) {
      const currentStatus = existingEvent.status;
      const newStatus = validatedPayload.status;

      // Niedozwolone przejścia statusów
      if (currentStatus === "completed" && newStatus !== "completed") {
        throw new Error("Nie można zmienić statusu ukończonego wydarzenia");
      }

      if (currentStatus === "cancelled" && newStatus !== "cancelled") {
        throw new Error("Nie można zmienić statusu anulowanego wydarzenia");
      }

      // Tylko draft i active można anulować
      if (newStatus === "cancelled" && !["draft", "active"].includes(currentStatus)) {
        throw new Error("Można anulować tylko wydarzenia w statusie draft lub active");
      }

      // Organizator i admin mogą anulować wydarzenia
      // (sprawdzenie uprawnień do edycji już zostało wykonane wcześniej)
    }

    // Przygotuj obiekt aktualizacji z updated_at
    const updateData = {
      ...validatedPayload,
      updated_at: new Date().toISOString(),
    };

    // Wykonaj aktualizację z returning aby uzyskać zaktualizowany rekord
    const { data: updatedEvent, error: updateError } = await this.supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select(
        "id, name, location, event_datetime, max_places, optional_fee, status, current_signups_count, organizer_id, created_at, updated_at, deleted_at"
      )
      .single();

    if (updateError) {
      throw new Error(`Nie udało się zaktualizować wydarzenia: ${updateError.message}`);
    }

    if (!updatedEvent) {
      throw new Error("Nie udało się zaktualizować wydarzenia - brak danych zwrotnych");
    }

    // Zwróć zaktualizowane EventDTO
    return updatedEvent;
  }

  /**
   * Wykonuje soft delete wydarzenia poprzez ustawienie deleted_at.
   * Dostępne wyłącznie dla administratorów. Zachowuje historię bez permanentnego usunięcia.
   *
   * @param id - ID wydarzenia do soft delete
   * @returns Promise rozwiązujący się do rezultatu operacji
   * @throws Error jeśli wystąpi błąd podczas zapytania do bazy danych
   */
  async softDeleteEvent(id: number): Promise<"success" | "not_found"> {
    // Wykonaj soft delete - ustaw tylko deleted_at na aktualny czas
    // Warunek deleted_at IS NULL zapewnia że tylko aktywne wydarzenia mogą być usunięte
    const { data, error } = await this.supabase
      .from("events")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id") // Wybierz tylko id aby sprawdzić czy wiersz został zaktualizowany
      .single();

    if (error) {
      // Jeśli nie znaleziono rekordu do aktualizacji (PGRST116), zwróć not_found
      if (error.code === "PGRST116") {
        return "not_found";
      }
      throw new Error(`Błąd podczas usuwania wydarzenia: ${error.message}`);
    }

    // Jeśli data istnieje, oznacza to że aktualizacja się powiodła
    if (data) {
      return "success";
    }

    // Fallback - jeśli z jakiegoś powodu nie mamy błędu ale też nie mamy data
    return "not_found";
  }
}

/**
 * Fabryka do tworzenia instancji EventService.
 *
 * @param supabase - Klient Supabase
 * @returns Nowa instancja EventService
 */
export function createEventService(supabase: SupabaseClient): EventService {
  return new EventService(supabase);
}
