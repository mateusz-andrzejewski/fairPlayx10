import type { SupabaseClient } from "../../db/supabase.client";

import type { CreateEventValidatedParams } from "../validation/event";
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
