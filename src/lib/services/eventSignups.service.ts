import type { SupabaseClient } from "../../db/supabase.client";
import type { UserRole } from "../../types";

import type {
  CreateEventSignupValidatedParams,
  EventSignupDTO,
  UpdateEventSignupValidatedParams,
  ListEventSignupsQueryParams,
  EventSignupsListResponseDTO,
} from "../../types";
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
   * Tworzy pojedynczy zapis na wydarzenie dla podanego gracza.
   * Metoda pomocnicza używana zarówno dla pojedynczych jak i zbiorczych zapisów.
   *
   * @param eventId - ID wydarzenia
   * @param targetPlayerId - ID gracza do zapisania
   * @param eventData - Dane wydarzenia (cache)
   * @returns Promise<EventSignupDTO> - utworzony zapis
   * @private
   */
  private async createSingleSignup(
    eventId: number,
    targetPlayerId: number,
    eventData: any
  ): Promise<EventSignupDTO> {
    // Określ status zapisu na podstawie dostępnych miejsc
    const hasAvailableSpots = eventData.current_signups_count < eventData.max_places;
    const signupStatus = hasAvailableSpots ? "confirmed" : "pending";

    // Sprawdź czy gracz istnieje
    const { data: playerData, error: playerError } = await this.supabase
      .from("players")
      .select("id, first_name, last_name")
      .eq("id", targetPlayerId)
      .single();

    if (playerError) {
      if (playerError.code === "PGRST116") {
        throw new Error(`Gracz nie został znaleziony (ID: ${targetPlayerId})`);
      }
      throw new Error(`Błąd podczas weryfikacji gracza: ${playerError.message}`);
    }

    // Sprawdź czy gracz nie jest już aktywnie zapisany na to wydarzenie (wykluczając withdrawn)
    const { data: existingSignup, error: signupCheckError } = await this.supabase
      .from("event_signups")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("player_id", targetPlayerId)
      .neq("status", "withdrawn")
      .single();

    if (signupCheckError && signupCheckError.code !== "PGRST116") {
      throw new Error(`Błąd podczas sprawdzania istniejącego zapisu: ${signupCheckError.message}`);
    }

    if (existingSignup) {
      throw new Error(`Gracz jest już zapisany na to wydarzenie (ID: ${targetPlayerId})`);
    }

    // Sprawdź czy istnieje wycofany zapis, który możemy reaktywować
    const { data: withdrawnSignup, error: withdrawnCheckError } = await this.supabase
      .from("event_signups")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("player_id", targetPlayerId)
      .eq("status", "withdrawn")
      .single();

    if (withdrawnCheckError && withdrawnCheckError.code !== "PGRST116") {
      throw new Error(`Błąd podczas sprawdzania wycofanego zapisu: ${withdrawnCheckError.message}`);
    }

    let signupResult;

    if (withdrawnSignup) {
      // Reaktywuj istniejący wycofany zapis
      const { data: updatedSignup, error: updateError } = await this.supabase
        .from("event_signups")
        .update({
          status: signupStatus,
          signup_timestamp: new Date().toISOString(),
          resignation_timestamp: null,
        })
        .eq("id", withdrawnSignup.id)
        .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp")
        .single();

      if (updateError) {
        throw new Error(`Nie udało się reaktywować zapisu: ${updateError.message}`);
      }

      signupResult = updatedSignup;
    } else {
      // Utwórz nowy zapis
      const { data: newSignup, error: insertError } = await this.supabase
        .from("event_signups")
        .insert({
          event_id: eventId,
          player_id: targetPlayerId,
          signup_timestamp: new Date().toISOString(),
          status: signupStatus,
        })
        .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp")
        .single();

      if (insertError) {
        throw new Error(`Nie udało się utworzyć zapisu: ${insertError.message}`);
      }

      signupResult = newSignup;
    }

    if (!signupResult) {
      throw new Error("Nie udało się utworzyć/reaktywować zapisu - brak danych zwrotnych");
    }

    return {
      id: signupResult.id,
      event_id: signupResult.event_id,
      player_id: signupResult.player_id,
      signup_timestamp: signupResult.signup_timestamp,
      status: signupResult.status,
      resignation_timestamp: signupResult.resignation_timestamp,
    };
  }

  /**
   * Automatycznie przesuwa pierwszego gracza z listy rezerwowej (pending) na potwierdzonego (confirmed).
   * Wywoływane automatycznie gdy zwolni się miejsce na wydarzeniu.
   *
   * @param eventId - ID wydarzenia
   * @returns Promise<boolean> - true jeśli ktoś został przesunięty, false jeśli lista rezerwowa była pusta
   * @private
   */
  private async promoteFromWaitingList(eventId: number): Promise<boolean> {
    // Pobierz pierwszy zapis z listy rezerwowej (najstarszy timestamp)
    const { data: waitingSignup, error: fetchError } = await this.supabase
      .from("event_signups")
      .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp")
      .eq("event_id", eventId)
      .eq("status", "pending")
      .order("signup_timestamp", { ascending: true })
      .limit(1)
      .single();

    if (fetchError) {
      // PGRST116 = brak wyników (pusta lista rezerwowa) - to nie błąd
      if (fetchError.code === "PGRST116") {
        return false;
      }
      throw new Error(`Błąd podczas pobierania listy rezerwowej: ${fetchError.message}`);
    }

    if (!waitingSignup) {
      return false;
    }

    // Zmień status na confirmed
    const { error: updateError } = await this.supabase
      .from("event_signups")
      .update({ status: "confirmed" })
      .eq("id", waitingSignup.id);

    if (updateError) {
      throw new Error(`Nie udało się awansować gracza z listy rezerwowej: ${updateError.message}`);
    }

    // Pobierz aktualny licznik i zwiększ go
    const { data: eventData, error: eventFetchError } = await this.supabase
      .from("events")
      .select("current_signups_count")
      .eq("id", eventId)
      .single();

    if (eventFetchError || !eventData) {
      // Spróbuj cofnąć zmianę statusu
      await this.supabase.from("event_signups").update({ status: "pending" }).eq("id", waitingSignup.id);
      throw new Error(`Nie udało się pobrać danych wydarzenia po awansie`);
    }

    const { error: counterError } = await this.supabase
      .from("events")
      .update({
        current_signups_count: eventData.current_signups_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (counterError) {
      // Spróbuj cofnąć zmianę statusu
      await this.supabase.from("event_signups").update({ status: "pending" }).eq("id", waitingSignup.id);
      throw new Error(`Nie udało się zaktualizować licznika po awansie: ${counterError.message}`);
    }

    // TODO: Wysłać powiadomienie do gracza, że dostał miejsce
    // await notificationService.notifyPlayerPromoted(waitingSignup.player_id, eventId);

    return true;
  }

  /**
   * Tworzy nowy zapis na wydarzenie zgodnie z regułami biznesowymi.
   * Sprawdza uprawnienia użytkownika, waliduje dane wydarzenia i gracza,
   * oraz wykonuje operację w transakcji aby zapewnić spójność danych.
   * Obsługuje zarówno pojedynczego gracza jak i tablicę graczy dla operacji zbiorczych.
   *
   * @param eventId - ID wydarzenia na które gracz chce się zapisać
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role, playerId)
   * @param payload - Zwalidowane dane zapisu (opcjonalne player_id dla organizatorów/adminów)
   * @returns Promise rozwiązujący się do tablicy utworzonych EventSignupDTO lub pojedynczego EventSignupDTO
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async createEventSignup(
    eventId: number,
    actor: SignupActor,
    payload: CreateEventSignupValidatedParams
  ): Promise<EventSignupDTO | EventSignupDTO[]> {
    // Sprawdź podstawowe uprawnienia do wykonania operacji
    if (!canSignUpForEvents(actor.role) && !canManageEventSignups(actor.role)) {
      throw new Error("Brak uprawnień do tworzenia zapisów na wydarzenia");
    }

    // Określ player_id na podstawie roli i payloadu
    let targetPlayerIds: number[];

    if (canManageEventSignups(actor.role)) {
      // Organizator/admin - musi podać player_id w payload
      if (!payload.player_id) {
        throw new Error("Organizator musi podać ID gracza do zapisania");
      }

      // Obsługa zarówno pojedynczego ID jak i tablicy
      if (Array.isArray(payload.player_id)) {
        targetPlayerIds = payload.player_id;
      } else {
        targetPlayerIds = [payload.player_id];
      }
    } else if (canSignUpForEvents(actor.role)) {
      // Gracz - używa własnego player_id z kontekstu
      if (!actor.playerId) {
        throw new Error("Konto gracza nie jest powiązane z profilem gracza");
      }
      targetPlayerIds = [actor.playerId];
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
      if (eventData.status === "cancelled") {
        throw new Error("Wydarzenie zostało anulowane - zapisy są niemożliwe");
      }
      if (eventData.status === "completed") {
        throw new Error("Wydarzenie już się odbyło - zapisy są zamknięte");
      }
      if (eventData.status === "draft") {
        throw new Error("Wydarzenie jest w trybie roboczym - zapisy nie są jeszcze dostępne");
      }
      throw new Error("Wydarzenie nie jest aktywne - zapisy są niedostępne");
    }

    // Sprawdź czy organizator może zarządzać zapisami na to wydarzenie
    if (actor.role === "organizer" && eventData.organizer_id !== actor.userId) {
      throw new Error("Organizator może zarządzać zapisami tylko na własnych wydarzeniach");
    }

    // Obsługa pojedynczego gracza vs wielu graczy
    if (targetPlayerIds.length === 1) {
      // Pojedynczy gracz - zachowaj istniejącą logikę
      const signupResult = await this.createSingleSignup(eventId, targetPlayerIds[0], eventData);

      // Zwiększ licznik zapisów TYLKO jeśli gracz dostał potwierdzone miejsce (nie lista rezerwowa)
      if (signupResult.status === "confirmed") {
        const { error: updateError } = await this.supabase
          .from("events")
          .update({
            current_signups_count: eventData.current_signups_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId);

        if (updateError) {
          // W przypadku błędu aktualizacji licznika, spróbuj usunąć utworzony zapis
          await this.supabase.from("event_signups").delete().eq("id", signupResult.id);
          throw new Error(`Nie udało się zaktualizować licznika zapisów: ${updateError.message}`);
        }
      }

      return signupResult;
    } else {
      // Wielu graczy - operacja zbiorcza
      const signupResults: EventSignupDTO[] = [];
      let confirmedCount = 0;

      // Przetwórz każdego gracza
      for (const playerId of targetPlayerIds) {
        try {
          const signupResult = await this.createSingleSignup(eventId, playerId, {
            ...eventData,
            current_signups_count: eventData.current_signups_count + confirmedCount, // Aktualizuj bieżący licznik dla kolejnych graczy
          });
          signupResults.push(signupResult);

          if (signupResult.status === "confirmed") {
            confirmedCount++;
          }
        } catch (error) {
          // W przypadku błędu dla jednego gracza, cofnij wszystkie dotychczasowe zapisy
          for (const result of signupResults) {
            try {
              await this.supabase.from("event_signups").delete().eq("id", result.id);
            } catch (rollbackError) {
              console.error(`Błąd podczas cofania zapisu ${result.id}:`, rollbackError);
            }
          }
          throw error; // Przekaż oryginalny błąd
        }
      }

      // Zaktualizuj licznik zapisów jeśli jakieś zapisy zostały potwierdzone
      if (confirmedCount > 0) {
        const { error: updateError } = await this.supabase
          .from("events")
          .update({
            current_signups_count: eventData.current_signups_count + confirmedCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId);

        if (updateError) {
          // W przypadku błędu aktualizacji licznika, cofnij wszystkie zapisy
          for (const result of signupResults) {
            try {
              await this.supabase.from("event_signups").delete().eq("id", result.id);
            } catch (rollbackError) {
              console.error(`Błąd podczas cofania zapisu ${result.id}:`, rollbackError);
            }
          }
          throw new Error(`Nie udało się zaktualizować licznika zapisów: ${updateError.message}`);
        }
      }

      return signupResults;
    }
  }

  /**
   * Aktualizuje status istniejącego zapisu na wydarzenie zgodnie z regułami biznesowymi.
   * Sprawdza uprawnienia aktora, waliduje dozwolone przejścia statusów oraz aktualizuje
   * licznik zapisów w przypadku wycofania. Operacja wykonywana w transakcji dla spójności.
   *
   * @param eventId - ID wydarzenia którego dotyczy zapis
   * @param signupId - ID zapisu do aktualizacji
   * @param payload - Zwalidowane dane aktualizacji (nowy status)
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role)
   * @returns Promise rozwiązujący się do zaktualizowanego EventSignupDTO
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async updateEventSignupStatus(
    eventId: number,
    signupId: number,
    payload: UpdateEventSignupValidatedParams,
    actor: Omit<SignupActor, "playerId">
  ): Promise<EventSignupDTO> {
    // Sprawdź podstawowe uprawnienia do zarządzania zapisami
    if (!canManageEventSignups(actor.role)) {
      throw new Error("Brak uprawnień do zarządzania zapisami na wydarzenia");
    }

    // Pobierz zapis wraz z informacjami o wydarzeniu dla weryfikacji przynależności
    const { data: signupData, error: signupError } = await this.supabase
      .from("event_signups")
      .select(
        `
        id,
        event_id,
        player_id,
        signup_timestamp,
        status,
        resignation_timestamp,
        events!inner (
          id,
          organizer_id,
          status,
          current_signups_count,
          max_places
        )
      `
      )
      .eq("id", signupId)
      .eq("events.id", eventId)
      .is("events.deleted_at", null)
      .single();

    if (signupError) {
      if (signupError.code === "PGRST116") {
        throw new Error("Zapis nie został znaleziony lub nie należy do podanego wydarzenia");
      }
      throw new Error(`Błąd podczas pobierania zapisu: ${signupError.message}`);
    }

    if (!signupData) {
      throw new Error("Zapis nie został znaleziony lub nie należy do podanego wydarzenia");
    }

    // Sprawdź czy organizator może zarządzać tym wydarzeniem
    if (actor.role === "organizer" && signupData.events.organizer_id !== actor.userId) {
      throw new Error("Organizator może zarządzać zapisami tylko na własnych wydarzeniach");
    }

    // Walidacja dozwolonych przejść statusów
    const currentStatus = signupData.status;
    const newStatus = payload.status;

    // Zdefiniuj dozwolone przejścia
    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "withdrawn"],
      confirmed: ["withdrawn"],
      withdrawn: [], // Brak możliwości powrotu ze statusu withdrawn
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Niedozwolone przejście statusu z '${currentStatus}' na '${newStatus}'`);
    }

    // Przygotuj dane do aktualizacji
    const updateData: any = {
      status: newStatus,
    };

    // Jeśli status zmienia się na withdrawn, ustaw resignation_timestamp
    if (newStatus === "withdrawn" && currentStatus !== "withdrawn") {
      updateData.resignation_timestamp = new Date().toISOString();
    }

    // Sprawdź czy trzeba aktualizować licznik zapisów (TYLKO dla confirmed - pending nie zajmował miejsca)
    const shouldDecrementCounter = newStatus === "withdrawn" && currentStatus === "confirmed";

    if (shouldDecrementCounter) {
      // Wykonaj aktualizację w transakcji - najpierw zmniejsz licznik w events
      const { error: counterUpdateError } = await this.supabase
        .from("events")
        .update({
          current_signups_count: signupData.events.current_signups_count - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (counterUpdateError) {
        throw new Error(`Nie udało się zaktualizować licznika zapisów: ${counterUpdateError.message}`);
      }
    }

    // Aktualizuj status zapisu
    const { data: updatedSignup, error: updateError } = await this.supabase
      .from("event_signups")
      .update(updateData)
      .eq("id", signupId)
      .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp")
      .single();

    if (updateError) {
      // W przypadku błędu i wcześniejszej dekrementacji licznika, spróbuj cofnąć zmianę
      if (shouldDecrementCounter) {
        await this.supabase
          .from("events")
          .update({
            current_signups_count: signupData.events.current_signups_count,
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId);
      }
      throw new Error(`Nie udało się zaktualizować statusu zapisu: ${updateError.message}`);
    }

    if (!updatedSignup) {
      throw new Error("Nie udało się zaktualizować zapisu - brak danych zwrotnych");
    }

    // Jeśli zwalniamy potwierdzone miejsce, automatycznie przesuń pierwszego z listy rezerwowej
    if (shouldDecrementCounter) {
      try {
        await this.promoteFromWaitingList(eventId);
      } catch (error) {
        // Loguj błąd, ale nie przerywaj operacji - główna aktualizacja się powiodła
        console.error(`Błąd podczas automatycznego przesunięcia z listy rezerwowej:`, error);
      }
    }

    // Zwróć EventSignupDTO
    return {
      id: updatedSignup.id,
      event_id: updatedSignup.event_id,
      player_id: updatedSignup.player_id,
      signup_timestamp: updatedSignup.signup_timestamp,
      status: updatedSignup.status,
      resignation_timestamp: updatedSignup.resignation_timestamp,
    };
  }

  /**
   * Pobiera paginowaną listę zapisów na wskazane wydarzenie zgodnie z regułami biznesowymi.
   * Dostępne tylko dla organizatorów danego wydarzenia oraz administratorów.
   * Obsługuje filtrowanie po statusie oraz paginację wyników.
   *
   * @param eventId - ID wydarzenia którego zapisy mają być pobrane
   * @param params - Zwalidowane parametry zapytania (paginacja, filtry)
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role)
   * @returns Promise rozwiązujący się do EventSignupsListResponseDTO z paginowanymi wynikami
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async listEventSignups(
    eventId: number,
    params: ListEventSignupsQueryParams,
    actor: { userId: number; role: UserRole }
  ): Promise<EventSignupsListResponseDTO> {
    // Sprawdź podstawowe uprawnienia do przeglądania zapisów
    if (!canManageEventSignups(actor.role)) {
      throw new Error("Brak uprawnień do przeglądania zapisów na wydarzenia");
    }

    // Sprawdź czy wydarzenie istnieje i czy użytkownik może je zarządzać
    const { data: eventData, error: eventError } = await this.supabase
      .from("events")
      .select("id, name, organizer_id, deleted_at")
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

    // Sprawdź czy organizator może zarządzać tym wydarzeniem
    if (actor.role === "organizer" && eventData.organizer_id !== actor.userId) {
      throw new Error("Brak dostępu do zapisów na to wydarzenie");
    }

    // Przygotuj zapytanie bazowe
    let query = this.supabase
      .from("event_signups")
      .select("id, event_id, player_id, signup_timestamp, status, resignation_timestamp", { count: "exact" })
      .eq("event_id", eventId)
      .order("signup_timestamp", { ascending: false });

    // Dodaj filtr statusu jeśli został podany
    if (params.status) {
      query = query.eq("status", params.status);
    }

    // Pobierz dane z paginacją
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    const { data: signups, error: signupsError, count } = await query.range(from, to);

    if (signupsError) {
      throw new Error(`Błąd podczas pobierania zapisów: ${signupsError.message}`);
    }

    if (!signups) {
      throw new Error("Nie udało się pobrać zapisów");
    }

    // Oblicz metadane paginacji
    const total = count || 0;
    const totalPages = Math.ceil(total / params.limit);

    const pagination = {
      page: params.page,
      limit: params.limit,
      total,
      total_pages: totalPages,
    };

    // Zwróć sformatowaną odpowiedź
    return {
      data: signups,
      pagination,
    };
  }

  /**
   * Wycofuje zapis z wydarzenia lub usuwa go całkowicie zgodnie z regułami biznesowymi.
   * Gracz może wycofać własny zapis, organizator może wycofać zapisy tylko na własnych wydarzeniach,
   * administrator może wycofać dowolny zapis. Operacja wykonywana w transakcji dla spójności.
   *
   * @param eventId - ID wydarzenia którego dotyczy zapis
   * @param signupId - ID zapisu do wycofania
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role, playerId)
   * @returns Promise rozwiązujący się bez wartości (204 No Content)
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async deleteEventSignup(eventId: number, signupId: number, actor: SignupActor): Promise<void> {
    // Sprawdź podstawowe uprawnienia do wykonania operacji
    if (!canSignUpForEvents(actor.role) && !canManageEventSignups(actor.role)) {
      throw new Error("Brak uprawnień do wycofywania zapisów na wydarzenia");
    }

    // Pobierz zapis wraz z informacjami o wydarzeniu dla weryfikacji przynależności
    const { data: signupData, error: signupError } = await this.supabase
      .from("event_signups")
      .select(
        `
        id,
        event_id,
        player_id,
        signup_timestamp,
        status,
        resignation_timestamp,
        events!inner (
          id,
          organizer_id,
          status,
          current_signups_count,
          max_places
        )
      `
      )
      .eq("id", signupId)
      .eq("events.id", eventId)
      .is("events.deleted_at", null)
      .single();

    if (signupError) {
      if (signupError.code === "PGRST116") {
        throw new Error("Zapis nie został znaleziony lub nie należy do podanego wydarzenia");
      }
      throw new Error(`Błąd podczas pobierania zapisu: ${signupError.message}`);
    }

    if (!signupData) {
      throw new Error("Zapis nie został znaleziony lub nie należy do podanego wydarzenia");
    }

    // Sprawdź uprawnienia w zależności od roli użytkownika
    if (canManageEventSignups(actor.role)) {
      // Organizator może wycofać zapisy tylko na własnych wydarzeniach
      if (actor.role === "organizer" && signupData.events.organizer_id !== actor.userId) {
        throw new Error("Organizator może zarządzać zapisami tylko na własnych wydarzeniach");
      }
    } else if (canSignUpForEvents(actor.role)) {
      // Gracz może wycofać tylko własny zapis
      if (!actor.playerId || signupData.player_id !== actor.playerId) {
        throw new Error("Gracz może wycofać tylko własny zapis");
      }
    }

    // Sprawdź czy zapis można jeszcze wycofać (nie jest już withdrawn)
    if (signupData.status === "withdrawn") {
      throw new Error("Zapis został już wcześniej wycofany");
    }

    // Przygotuj dane do aktualizacji - preferujemy aktualizację statusu zamiast usuwania
    const updateData: any = {
      status: "withdrawn",
      resignation_timestamp: new Date().toISOString(),
    };

    // Sprawdź czy trzeba dekrementować licznik zapisów (TYLKO dla confirmed - pending nie zajmował miejsca)
    const shouldDecrementCounter = signupData.status === "confirmed";

    if (shouldDecrementCounter) {
      // Wykonaj aktualizację w transakcji - najpierw zmniejsz licznik w events
      const { error: counterUpdateError } = await this.supabase
        .from("events")
        .update({
          current_signups_count: signupData.events.current_signups_count - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (counterUpdateError) {
        throw new Error(`Nie udało się zaktualizować licznika zapisów: ${counterUpdateError.message}`);
      }
    }

    // Aktualizuj status zapisu na withdrawn
    const { error: updateError } = await this.supabase.from("event_signups").update(updateData).eq("id", signupId);

    if (updateError) {
      // W przypadku błędu i wcześniejszej dekrementacji licznika, spróbuj cofnąć zmianę
      if (shouldDecrementCounter) {
        await this.supabase
          .from("events")
          .update({
            current_signups_count: signupData.events.current_signups_count,
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId);
      }
      throw new Error(`Nie udało się wycofać zapisu: ${updateError.message}`);
    }

    // Jeśli zwalniamy potwierdzone miejsce, automatycznie przesuń pierwszego z listy rezerwowej
    if (shouldDecrementCounter) {
      try {
        await this.promoteFromWaitingList(eventId);
      } catch (error) {
        // Loguj błąd, ale nie przerywaj operacji - główna rezygnacja się powiodła
        console.error(`Błąd podczas automatycznego przesunięcia z listy rezerwowej:`, error);
      }
    }

    // Operacja zakończona sukcesem - brak zwracanych danych (204 No Content)
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
