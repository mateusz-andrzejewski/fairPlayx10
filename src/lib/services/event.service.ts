import type { SupabaseClient } from "../../db/supabase.client";

import type { CreateEventValidatedParams, UpdateEventValidatedParams } from "../validation/event";
import type { EventDTO, CreateEventCommand } from "../../types";

/**
 * Serwis do zarządzania logiką biznesową związaną z wydarzeniami.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla wydarzeń.
 */
export class EventService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Tworzy nowe wydarzenie z domyślnymi wartościami.
   * Ustawia status na 'draft', current_signups_count na 0, deleted_at na null.
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
      status: "draft" as const,
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

      // Tylko admin może ustawiać status 'cancelled'
      if (newStatus === "cancelled" && !isAdmin) {
        throw new Error("Tylko administrator może anulować wydarzenie");
      }
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
