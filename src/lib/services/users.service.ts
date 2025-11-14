import type { SupabaseClient } from "../../db/supabase.client";

import type {
  ListUsersValidatedParams,
  UserIdValidatedParams,
  UpdateUserStatusValidatedParams,
} from "../validation/users";
import type {
  UserDTO,
  UsersListResponseDTO,
  PaginationMetaDTO,
  SoftDeleteUserResult,
  ApproveUserResult,
} from "../../types";

/**
 * Serwis do zarządzania logiką biznesową związaną z użytkownikami.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla użytkowników.
 */
export class UsersService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Pobiera paginowaną listę użytkowników z opcjonalnym filtrowaniem.
   * Rekordy są sortowane malejąco po created_at dla deterministycznej paginacji.
   *
   * @param params - Zwalidowane parametry zapytania zawierające paginację, filtry i wyszukiwanie
   * @returns Promise rozwiązujący się do paginowanej listy użytkowników
   */
  async listUsers(params: ListUsersValidatedParams): Promise<UsersListResponseDTO> {
    // Oblicz offset dla paginacji
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    // Buduj bazowe zapytanie - wybierz kolumny zgodne z UserDTO
    let query = this.supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Zastosuj filtr statusu jeśli określony
    if (params.status) {
      query = query.eq("status", params.status);
    }

    // Zastosuj filtr roli jeśli określony
    if (params.role) {
      query = query.eq("role", params.role);
    }

    // Zastosuj filtr wyszukiwania jeśli określony
    if (params.search && params.search.trim().length > 0) {
      // Szukaj w first_name, last_name i email używając ILIKE dla dopasowania bez uwzględniania wielkości liter
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
    }

    // Wykonaj zapytanie
    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(`Błąd podczas pobierania użytkowników: ${error.message}`);
    }

    // Zapewnij że dane są obecne
    if (!users) {
      throw new Error("Nie udało się pobrać danych użytkowników");
    }

    // Oblicz metadane paginacji
    const total = count ?? 0;
    const total_pages = Math.ceil(total / params.limit);

    const pagination: PaginationMetaDTO = {
      page: params.page,
      limit: params.limit,
      total,
      total_pages,
    };

    // Przygotuj odpowiedź
    const response: UsersListResponseDTO = {
      data: users as UserDTO[],
      pagination,
    };

    return response;
  }

  /**
   * Pobiera pojedynczego użytkownika po ID.
   * Wykonuje zapytanie SELECT z limitem 1 dla optymalizacji.
   * Zwraca null jeśli użytkownik nie istnieje.
   *
   * @param params - Zwalidowane parametry zawierające ID użytkownika
   * @returns Promise rozwiązujący się do UserDTO lub null jeśli użytkownik nie istnieje
   * @throws Error jeśli wystąpi błąd podczas zapytania do bazy danych
   */
  async getUserById(params: UserIdValidatedParams): Promise<UserDTO | null> {
    // Wykonaj zapytanie do bazy danych - wybierz kolumny zgodne z UserDTO
    const { data: user, error } = await this.supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .eq("id", params.id)
      .limit(1)
      .single();

    // Obsłuż błędy Supabase
    if (error) {
      // Sprawdź czy to błąd "no data" (status 406)
      if (error.code === "PGRST116") {
        return null; // Użytkownik nie istnieje
      }
      // Inne błędy traktuj jako błędy serwera
      throw new Error(`Błąd podczas pobierania użytkownika: ${error.message}`);
    }

    // Zapewnij że dane są obecne (choć single() powinien zwrócić null dla nieistniejących rekordów)
    if (!user) {
      return null;
    }

    // Zwróć dane jako UserDTO
    return user as UserDTO;
  }

  /**
   * Wykonuje soft delete użytkownika poprzez ustawienie znacznika deleted_at.
   * Operacja jest idempotentna - ponowne wywołanie na już usuniętym użytkowniku zwróci sukces.
   * Aktualizuje także status na 'pending' i czyści player_id dla zachowania spójności danych.
   *
   * @param actorId - ID użytkownika wykonującego operację (musi mieć rolę admin)
   * @param targetId - ID użytkownika do soft delete
   * @returns Promise rozwiązujący się do SoftDeleteUserResult
   * @throws Error jeśli użytkownik nie istnieje lub wystąpi błąd bazy danych
   */
  async softDeleteUser(actorId: number, targetId: number): Promise<SoftDeleteUserResult> {
    // Pobierz dane użytkownika przed usunięciem dla audytu
    const { data: existingUser, error: fetchError } = await this.supabase
      .from("users")
      .select("id, email, role, status, player_id, deleted_at")
      .eq("id", targetId)
      .is("deleted_at", null) // tylko aktywni użytkownicy
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // Użytkownik nie istnieje lub już został soft-deletowany
        return { deleted: false, userId: targetId };
      }
      throw new Error(`Błąd podczas pobierania danych użytkownika: ${fetchError.message}`);
    }

    if (!existingUser) {
      return { deleted: false, userId: targetId };
    }

    // Przygotuj dane dla audytu
    const auditChanges = {
      previous_status: existingUser.status,
      previous_role: existingUser.role,
      previous_player_id: existingUser.player_id,
    };

    // Wykonaj soft delete - ustaw deleted_at, resetuj status i player_id
    const deletedAt = new Date().toISOString();
    const { error: updateError } = await this.supabase
      .from("users")
      .update({
        deleted_at: deletedAt,
        status: "pending",
        player_id: null,
        updated_at: deletedAt,
      })
      .eq("id", targetId)
      .is("deleted_at", null); // warunek idempotentności

    if (updateError) {
      throw new Error(`Błąd podczas soft delete użytkownika: ${updateError.message}`);
    }

    // Dodaj wpis do dziennika audytu
    const { error: auditError } = await this.supabase.from("audit_logs").insert({
      action_type: "user_deleted",
      actor_id: actorId,
      target_table: "users",
      target_id: targetId,
      changes: auditChanges,
    });

    if (auditError) {
      // Próba wycofania zmian w przypadku błędu audytu
      await this.supabase
        .from("users")
        .update({
          deleted_at: null,
          status: existingUser.status,
          player_id: existingUser.player_id,
          updated_at: existingUser.updated_at || new Date().toISOString(),
        })
        .eq("id", targetId);

      throw new Error(`Błąd podczas tworzenia wpisu audytu: ${auditError.message}`);
    }

    return { deleted: true, userId: targetId };
  }

  /**
   * Zatwierdza użytkownika poprzez zmianę jego statusu z 'pending' na 'approved'.
   * Operacja jest idempotentna - zatwierdzenie już zatwierdzonego użytkownika zwróci sukces.
   * Dodaje wpis do dziennika audytu z informacją o zmianie statusu.
   * Zgodnie z PRD US-003: Zatwierdzanie rejestracji przez Admina
   *
   * @param actorId - ID użytkownika wykonującego operację (musi mieć rolę admin)
   * @param targetId - ID użytkownika do zatwierdzenia
   * @param approvalData - Dane zatwierdzenia: rola, opcjonalne powiązanie z graczem
   * @returns Promise rozwiązujący się do ApproveUserResult
   * @throws Error jeśli użytkownik nie istnieje lub wystąpi błąd bazy danych
   */
  async approveUser(
    actorId: number,
    targetId: number,
    approvalData: { role: string; player_id?: number | null; create_player?: boolean }
  ): Promise<ApproveUserResult> {
    // Pobierz dane użytkownika przed zatwierdzeniem
    const { data: existingUser, error: fetchError } = await this.supabase
      .from("users")
      .select("id, email, first_name, last_name, status, role, player_id")
      .eq("id", targetId)
      .is("deleted_at", null) // tylko aktywni użytkownicy
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // Użytkownik nie istnieje
        return { approved: false, userId: targetId, previousStatus: "pending", newStatus: "pending" };
      }
      throw new Error(`Błąd podczas pobierania danych użytkownika: ${fetchError.message}`);
    }

    if (!existingUser) {
      return { approved: false, userId: targetId, previousStatus: "pending", newStatus: "pending" };
    }

    // Jeśli użytkownik już jest zatwierdzony, zwróć sukces (idempotentność)
    if (existingUser.status === "approved") {
      return {
        approved: true,
        userId: targetId,
        previousStatus: "approved",
        newStatus: "approved",
      };
    }

    // Jeśli użytkownik nie ma statusu 'pending', nie pozwalamy na zatwierdzenie
    if (existingUser.status !== "pending") {
      throw new Error(
        `Nie można zatwierdzić użytkownika ze statusem '${existingUser.status}'. Tylko użytkownicy z statusem 'pending' mogą być zatwierdzani.`
      );
    }

    // Obsłuż powiązanie z graczem
    let finalPlayerId = approvalData.player_id;

    // Jeśli create_player=true i brak player_id w payloadzie oraz użytkownik nie ma jeszcze gracza, utwórz nowy profil gracza
    if (approvalData.create_player && !approvalData.player_id && !existingUser.player_id) {
      const { data: newPlayer, error: createPlayerError } = await this.supabase
        .from("players")
        .insert({
          first_name: existingUser.first_name || "Nowy",
          last_name: existingUser.last_name || "Zawodnik",
          position: "midfielder", // domyślna pozycja
          skill_rate: 5, // domyślny skill rate
          date_of_birth: null,
          deleted_at: null,
        })
        .select("id")
        .single();

      if (createPlayerError || !newPlayer) {
        throw new Error(`Błąd podczas tworzenia profilu gracza: ${createPlayerError?.message}`);
      }

      finalPlayerId = newPlayer.id;
    } else if (approvalData.create_player && !approvalData.player_id && existingUser.player_id) {
      // Użytkownik już ma przypisanego gracza, użyj istniejącego
      finalPlayerId = existingUser.player_id;
    }

    // Jeśli podano player_id, zweryfikuj czy gracz istnieje
    if (finalPlayerId) {
      const { data: player, error: playerError } = await this.supabase
        .from("players")
        .select("id")
        .eq("id", finalPlayerId)
        .is("deleted_at", null)
        .single();

      if (playerError || !player) {
        throw new Error(`Gracz o ID ${finalPlayerId} nie istnieje lub został usunięty`);
      }
    }

    // Przygotuj dane dla audytu
    const auditChanges = {
      previous_status: existingUser.status,
      new_status: "approved",
      previous_role: existingUser.role,
      new_role: approvalData.role,
      previous_player_id: existingUser.player_id,
      new_player_id: finalPlayerId,
    };

    // Wykonaj zatwierdzenie - zmień status na 'approved', ustaw rolę i player_id
    const updatedAt = new Date().toISOString();
    const { error: updateError } = await this.supabase
      .from("users")
      .update({
        status: "approved",
        role: approvalData.role,
        player_id: finalPlayerId ?? null,
        updated_at: updatedAt,
      })
      .eq("id", targetId)
      .eq("status", "pending"); // warunek idempotentności - tylko jeśli nadal pending

    if (updateError) {
      throw new Error(`Błąd podczas zatwierdzania użytkownika: ${updateError.message}`);
    }

    // Dodaj wpis do dziennika audytu
    const { error: auditError } = await this.supabase.from("audit_logs").insert({
      action_type: "user_approved",
      actor_id: actorId,
      target_table: "users",
      target_id: targetId,
      changes: auditChanges,
    });

    if (auditError) {
      // Próba wycofania zmian w przypadku błędu audytu
      await this.supabase
        .from("users")
        .update({
          status: existingUser.status,
          role: existingUser.role,
          player_id: existingUser.player_id,
          updated_at: existingUser.updated_at || new Date().toISOString(),
        })
        .eq("id", targetId);

      throw new Error(`Błąd podczas tworzenia wpisu audytu: ${auditError.message}`);
    }

    return {
      approved: true,
      userId: targetId,
      previousStatus: "pending",
      newStatus: "approved",
    };
  }

  /**
   * Aktualizuje rolę użytkownika.
   * Operacja dostępna tylko dla administratorów.
   * Dodaje wpis do dziennika audytu z informacją o zmianie roli.
   *
   * @param actorId - ID użytkownika wykonującego operację (musi mieć rolę admin)
   * @param targetId - ID użytkownika do aktualizacji
   * @param newRole - Nowa rola użytkownika
   * @returns Promise rozwiązujący się do informacji o powodzeniu operacji
   * @throws Error jeśli użytkownik nie istnieje lub wystąpi błąd bazy danych
   */
  async updateUserRole(
    actorId: number,
    targetId: number,
    newRole: string
  ): Promise<{ updated: boolean; userId: number; previousRole: string; newRole: string }> {
    // Pobierz dane użytkownika przed aktualizacją
    const { data: existingUser, error: fetchError } = await this.supabase
      .from("users")
      .select("id, email, first_name, last_name, status, role")
      .eq("id", targetId)
      .is("deleted_at", null) // tylko aktywni użytkownicy
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error("Użytkownik nie został znaleziony");
      }
      throw new Error(`Błąd podczas pobierania danych użytkownika: ${fetchError.message}`);
    }

    if (!existingUser) {
      throw new Error("Użytkownik nie został znaleziony");
    }

    // Jeśli rola jest taka sama, zwróć sukces (idempotentność)
    if (existingUser.role === newRole) {
      return {
        updated: true,
        userId: targetId,
        previousRole: existingUser.role,
        newRole: newRole,
      };
    }

    const auditChanges = {
      previous_role: existingUser.role,
      new_role: newRole,
    };

    // Wykonaj aktualizację roli
    const updatedAt = new Date().toISOString();
    const { error: updateError } = await this.supabase
      .from("users")
      .update({
        role: newRole,
        updated_at: updatedAt,
      })
      .eq("id", targetId);

    if (updateError) {
      throw new Error(`Błąd podczas aktualizacji roli użytkownika: ${updateError.message}`);
    }

    // Dodaj wpis do dziennika audytu
    const { error: auditError } = await this.supabase.from("audit_logs").insert({
      action_type: "user_role_updated",
      actor_id: actorId,
      target_table: "users",
      target_id: targetId,
      changes: auditChanges,
    });

    if (auditError) {
      console.error("Błąd podczas tworzenia wpisu audytu:", auditError);
      // Nie cofamy zmian - audit log nie jest krytyczny
    }

    return {
      updated: true,
      userId: targetId,
      previousRole: existingUser.role,
      newRole: newRole,
    };
  }
}

/**
 * Funkcja pomocnicza do tworzenia instancji UsersService.
 * Może być używana w endpointach Astro dla łatwiejszego dostępu.
 *
 * @param supabase - Klient Supabase
 * @returns Instancja UsersService
 */
export function createUsersService(supabase: SupabaseClient): UsersService {
  return new UsersService(supabase);
}
