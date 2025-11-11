import type { SupabaseClient } from "../../db/supabase.client";
import type { UserRole } from "../../types";

import type {
  CreateTeamAssignmentsCommand,
  TeamAssignmentDTO,
  ManualTeamAssignmentEntry,
} from "../../types";
import { isAdmin, isOrganizer } from "../utils/auth";

/**
 * Interfejs definiujący kontekst aktora wykonującego operację przypisania drużyny.
 */
interface TeamAssignmentActor {
  userId: number;
  role: UserRole;
  ipAddress: string;
}

/**
 * Serwis do zarządzania logiką biznesową związaną z przypisaniami drużyn.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla przypisań drużyn.
 */
export class TeamAssignmentsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Ustawia ręczne przypisania drużyn dla wskazanego wydarzenia.
   * Sprawdza uprawnienia użytkownika, waliduje przynależność signup_id do wydarzenia,
   * wykonuje operację aktualizacji w transakcji i rejestruje zmiany w audit_logs.
   *
   * @param eventId - ID wydarzenia dla którego ustawiane są przypisania
   * @param command - Komenda zawierająca listę przypisań do wykonania
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role, ipAddress)
   * @returns Promise rozwiązujący się do tablicy utworzonych/zaktualizowanych TeamAssignmentDTO
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async setManualAssignments(
    eventId: number,
    command: CreateTeamAssignmentsCommand,
    actor: TeamAssignmentActor
  ): Promise<TeamAssignmentDTO[]> {
    // Sprawdź podstawowe uprawnienia do wykonania operacji
    if (!this.canManageTeamAssignments(actor.role)) {
      throw new Error("Brak uprawnień do zarządzania przypisaniami drużyn");
    }

    // Sprawdź czy użytkownik jest organizatorem tego wydarzenia (jeśli nie jest adminem)
    if (!isAdmin(actor.role)) {
      const isEventOrganizer = await this.checkEventOrganizer(eventId, actor.userId);
      if (!isEventOrganizer) {
        throw new Error("Tylko organizator wydarzenia lub administrator może zarządzać przypisaniami drużyn");
      }
    }

    // Pobierz i zweryfikuj przynależność signup_id do wydarzenia
    const signupIds = command.assignments.map((assignment) => assignment.signup_id);
    const validSignups = await this.getValidSignupsForEvent(eventId, signupIds);

    // Sprawdź czy wszystkie przekazane signup_id należą do wydarzenia
    const validSignupIds = new Set(validSignups.map((signup) => signup.id));
    const invalidSignupIds = signupIds.filter((id) => !validSignupIds.has(id));

    if (invalidSignupIds.length > 0) {
      throw new Error(
        `Następujące zapisy nie należą do wskazanego wydarzenia lub mają nieprawidłowy status: ${invalidSignupIds.join(", ")}`
      );
    }

    // Pobierz obecne przypisania dla tych signup_id (do porównania zmian)
    const existingAssignments = await this.getExistingAssignments(signupIds);

    // Usuń obecne przypisania dla przekazanych signup_id
    const { error: deleteError } = await this.supabase
      .from("team_assignments")
      .delete()
      .in("signup_id", signupIds);

    if (deleteError) {
      throw new Error(`Błąd podczas usuwania obecnych przypisań: ${deleteError.message}`);
    }

    // Dodaj nowe przypisania
    const assignmentsToInsert = command.assignments.map((assignment) => ({
      signup_id: assignment.signup_id,
      team_number: assignment.team_number,
    }));

    const { data: insertedAssignments, error: insertError } = await this.supabase
      .from("team_assignments")
      .insert(assignmentsToInsert)
      .select("id, signup_id, team_number, assignment_timestamp");

    if (insertError) {
      throw new Error(`Błąd podczas tworzenia nowych przypisań: ${insertError.message}`);
    }

    // Pobierz zaktualizowane przypisania (powinny zawierać wszystkie przypisania)
    const updatedAssignments = insertedAssignments || [];

    // Zarejestruj zmiany w audit_logs
    await this.logAssignmentChanges(
      eventId,
      existingAssignments,
      updatedAssignments,
      actor
    );

    return updatedAssignments;
  }

  /**
   * Sprawdza czy rola użytkownika pozwala na zarządzanie przypisaniami drużyn.
   * Administratorzy i organizatorzy mają uprawnienia do zarządzania przypisaniami.
   *
   * @param role - Rola użytkownika do sprawdzenia
   * @returns true jeśli użytkownik może zarządzać przypisaniami drużyn
   */
  private canManageTeamAssignments(role: UserRole): boolean {
    return isAdmin(role) || isOrganizer(role);
  }

  /**
   * Sprawdza czy wskazany użytkownik jest organizatorem danego wydarzenia.
   *
   * @param eventId - ID wydarzenia do sprawdzenia
   * @param userId - ID użytkownika który powinien być organizatorem
   * @returns Promise rozwiązujący się do boolean wskazującego czy użytkownik jest organizatorem
   */
  private async checkEventOrganizer(eventId: number, userId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();

    if (error) {
      throw new Error(`Błąd podczas sprawdzania organizatora wydarzenia: ${error.message}`);
    }

    return data.organizer_id === userId;
  }

  /**
   * Pobiera ważne zapisy na wydarzenie dla wskazanych signup_id.
   * Filtruje po statusie zapisu (ignoruje 'withdrawn') i sprawdza przynależność do wydarzenia.
   *
   * @param eventId - ID wydarzenia
   * @param signupIds - Tablica ID zapisów do sprawdzenia
   * @returns Promise rozwiązujący się do tablicy ważnych zapisów
   */
  private async getValidSignupsForEvent(eventId: number, signupIds: number[]) {
    const { data, error } = await this.supabase
      .from("event_signups")
      .select("id, status")
      .eq("event_id", eventId)
      .in("id", signupIds)
      .neq("status", "withdrawn");

    if (error) {
      throw new Error(`Błąd podczas sprawdzania zapisów na wydarzenie: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Pobiera obecne przypisania drużyn dla wskazanych signup_id.
   *
   * @param signupIds - Tablica ID zapisów do sprawdzenia
   * @returns Promise rozwiązujący się do mapy signup_id -> obecne przypisanie
   */
  private async getExistingAssignments(signupIds: number[]): Promise<Map<number, TeamAssignmentDTO>> {
    const { data, error } = await this.supabase
      .from("team_assignments")
      .select("id, signup_id, team_number, assignment_timestamp")
      .in("signup_id", signupIds);

    if (error) {
      throw new Error(`Błąd podczas pobierania obecnych przypisań: ${error.message}`);
    }

    const assignmentsMap = new Map<number, TeamAssignmentDTO>();
    (data || []).forEach((assignment) => {
      assignmentsMap.set(assignment.signup_id, assignment);
    });

    return assignmentsMap;
  }

  /**
   * Pobiera przypisania drużyn po ID zapisów.
   *
   * @param signupIds - Tablica ID zapisów
   * @returns Promise rozwiązujący się do tablicy przypisań
   */
  private async getAssignmentsBySignupIds(signupIds: number[]): Promise<TeamAssignmentDTO[]> {
    const { data, error } = await this.supabase
      .from("team_assignments")
      .select("id, signup_id, team_number, assignment_timestamp")
      .in("signup_id", signupIds)
      .order("signup_id");

    if (error) {
      throw new Error(`Błąd podczas pobierania zaktualizowanych przypisań: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Rejestruje zmiany przypisań w audit_logs.
   *
   * @param eventId - ID wydarzenia
   * @param existingAssignments - Mapa obecnych przypisań
   * @param updatedAssignments - Tablica nowych przypisań
   * @param actor - Kontekst użytkownika wykonującego operację
   */
  private async logAssignmentChanges(
    eventId: number,
    existingAssignments: Map<number, TeamAssignmentDTO>,
    updatedAssignments: TeamAssignmentDTO[],
    actor: TeamAssignmentActor
  ): Promise<void> {
    const auditEntries = updatedAssignments.map((assignment) => {
      const existing = existingAssignments.get(assignment.signup_id);
      const actionType = existing ? "team_reassigned" : "team_assigned";

      const changes = {
        signup_id: assignment.signup_id,
        team_number: assignment.team_number,
        previous_team_number: existing?.team_number || null,
        assignment_timestamp: assignment.assignment_timestamp,
      };

      return {
        action_type: actionType,
        actor_id: actor.userId,
        target_id: eventId,
        target_table: "events",
        changes,
        ip_address: actor.ipAddress,
      };
    });

    // Wstaw wszystkie wpisy audytu
    const { error } = await this.supabase
      .from("audit_logs")
      .insert(auditEntries);

    if (error) {
      // Loguj błąd ale nie przerywaj operacji - audyt nie powinien blokować biznesowej logiki
      console.error("Błąd podczas rejestrowania zmian w audit_logs:", error);
    }
  }
}

/**
 * Funkcja fabryczna do tworzenia instancji TeamAssignmentsService.
 * Używa wstrzyknięcia zależności aby zapewnić testowalność i elastyczność.
 *
 * @param supabase - Klient Supabase do wykonywania operacji na bazie danych
 * @returns Nowa instancja TeamAssignmentsService
 */
export function createTeamAssignmentsService(supabase: SupabaseClient): TeamAssignmentsService {
  return new TeamAssignmentsService(supabase);
}
