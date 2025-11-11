import type { SupabaseClient } from "../../db/supabase.client";
import type { UserRole } from "../../types";

import type { CreateEventSignupValidatedParams, EventSignupDTO } from "../../types";
import { canManageEventSignups, canSignUpForEvents } from "../utils/auth";

/**
 * Interfejs definiujący kontekst aktora wykonującego operację zapisu na wydarzenie.
 */
interface SignupActor {
  userId: number;
  role: UserRole;
  playerId?: number | null;
}

/**
 * Serwis do zarządzania logiką biznesową związaną z zapisami na wydarzenia.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla zapisów na wydarzenia.
 */
export class EventSignupsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Tworzy nowy zapis na wydarzenie zgodnie z regułami biznesowymi.
   * Sprawdza uprawnienia użytkownika, waliduje dane wydarzenia i gracza,
   * oraz wykonuje operację w transakcji aby zapewnić spójność danych.
   *
   * @param eventId - ID wydarzenia na które gracz chce się zapisać
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role, playerId)
   * @param payload - Zwalidowane dane zapisu (opcjonalne player_id dla organizatorów/adminów)
   * @returns Promise rozwiązujący się do utworzonego EventSignupDTO
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async createEventSignup(
    eventId: number,
    actor: SignupActor,
    payload: CreateEventSignupValidatedParams
  ): Promise<EventSignupDTO> {
    // Sprawdź podstawowe uprawnienia do wykonania operacji
    if (!canSignUpForEvents(actor.role) && !canManageEventSignups(actor.role)) {
      throw new Error("Brak uprawnień do tworzenia zapisów na wydarzenia");
    }

    // Określ player_id na podstawie roli i payloadu
    let targetPlayerId: number;

    if (canManageEventSignups(actor.role)) {
      // Organizator/admin - musi podać player_id w payload
      if (!payload.player_id) {
        throw new Error("Organizator musi podać ID gracza do zapisania");
      }
      targetPlayerId = payload.player_id;
    } else if (canSignUpForEvents(actor.role)) {
      // Gracz - używa własnego player_id z kontekstu
      if (!actor.playerId) {
        throw new Error("Konto gracza nie jest powiązane z profilem gracza");
      }
      targetPlayerId = actor.playerId;
    } else {
      throw new Error("Nieprawidłowa rola użytkownika");
    }

    // Sprawdź czy wydarzenie istnieje i jest aktywne
    const { data: eventData, error: eventError } = await this.supabase
      .from("events")
      .select("id, name, status, max_places, current_signups_count, organizer_id, deleted_at")
      .eq("id", eventId)
      .is("deleted_at", null)
      .single();

    if (eventError) {
      if (eventError.code === "PGRST116") {
        throw new Error("Wydarzenie nie zostało znalezione");
      }
      throw new Error(`Błąd podczas pobierania wydarzenia: ${eventError.message}`);
    }

    if (!eventData) {
      throw new Error("Wydarzenie nie zostało znalezione");
    }

    // Walidacja statusu wydarzenia - tylko aktywne wydarzenia akceptują zapisy
    if (eventData.status !== "active") {
      throw new Error("Wydarzenie nie jest aktywne - zapisy są niedostępne");
    }

    // Sprawdź czy organizator może zarządzać zapisami na to wydarzenie
    if (actor.role === "organizer" && eventData.organizer_id !== actor.userId) {
      throw new Error("Organizator może zarządzać zapisami tylko na własnych wydarzeniach");
    }

    // Sprawdź czy wydarzenie nie jest już pełne
    if (eventData.current_signups_count >= eventData.max_places) {
      throw new Error("Wydarzenie jest już pełne - wszystkie miejsca zostały zajęte");
    }

    // Sprawdź czy gracz istnieje
    const { data: playerData, error: playerError } = await this.supabase
      .from("players")
      .select("id, first_name, last_name")
      .eq("id", targetPlayerId)
      .single();

    if (playerError) {
      if (playerError.code === "PGRST116") {
        throw new Error("Gracz nie został znaleziony");
      }
      throw new Error(`Błąd podczas weryfikacji gracza: ${playerError.message}`);
    }

    // Sprawdź czy gracz nie jest już zapisany na to wydarzenie
    const { data: existingSignup, error: signupCheckError } = await this.supabase
      .from("event_signups")
      .select("id")
      .eq("event_id", eventId)
      .eq("player_id", targetPlayerId)
      .single();

    if (signupCheckError && signupCheckError.code !== "PGRST116") {
      throw new Error(`Błąd podczas sprawdzania istniejącego zapisu: ${signupCheckError.message}`);
    }

    if (existingSignup) {
      throw new Error("Gracz jest już zapisany na to wydarzenie");
    }

    // TODO: Zaimplementować jako transakcję Supabase zamiast dwóch oddzielnych operacji
    // Obecnie używamy dwóch operacji ze względu na brak funkcji RPC w bazie danych

    // Najpierw wstaw zapis
    const { data: newSignup, error: insertError } = await this.supabase
      .from("event_signups")
      .insert({
        event_id: eventId,
        player_id: targetPlayerId,
        signup_timestamp: new Date().toISOString(),
        status: "pending",
      })
      .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp")
      .single();

    if (insertError) {
      // Sprawdź czy to błąd konfliktu unikalności
      if (insertError.code === "23505") {
        throw new Error("Gracz jest już zapisany na to wydarzenie");
      }
      throw new Error(`Nie udało się utworzyć zapisu: ${insertError.message}`);
    }

    if (!newSignup) {
      throw new Error("Nie udało się utworzyć zapisu - brak danych zwrotnych");
    }

    // Następnie zwiększ licznik zapisów w wydarzeniu
    const { error: updateError } = await this.supabase
      .from("events")
      .update({
        current_signups_count: eventData.current_signups_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      // W przypadku błędu aktualizacji licznika, spróbuj usunąć utworzony zapis
      await this.supabase.from("event_signups").delete().eq("id", newSignup.id);
      throw new Error(`Nie udało się zaktualizować licznika zapisów: ${updateError.message}`);
    }

    // Zwróć EventSignupDTO
    return {
      id: newSignup.id,
      event_id: newSignup.event_id,
      player_id: newSignup.player_id,
      signup_timestamp: newSignup.signup_timestamp,
      status: newSignup.status,
      resignation_timestamp: newSignup.resignation_timestamp,
    };
  }
}

/**
 * Fabryka do tworzenia instancji EventSignupsService.
 *
 * @param supabase - Klient Supabase
 * @returns Nowa instancja EventSignupsService
 */
export function createEventSignupsService(supabase: SupabaseClient): EventSignupsService {
  return new EventSignupsService(supabase);
}
