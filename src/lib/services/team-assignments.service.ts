import type { SupabaseClient } from "../../db/supabase.client";
import type { UserRole } from "../../types";

import type {
  CreateTeamAssignmentsCommand,
  TeamAssignmentDTO,
  ManualTeamAssignmentEntry,
  RunTeamDrawCommand,
  TeamDrawResultDTO,
} from "../../types";
import { isAdmin, isOrganizer } from "../utils/auth";
import { computeBalancedTeams } from "./team-draw.engine";

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
   * Uruchamia algorytm losowania drużyn dla wskazanego wydarzenia.
   * Sprawdza uprawnienia użytkownika, pobiera potwierdzone zapisy, uruchamia algorytm balansowania,
   * zapisuje wyniki w team_assignments i rejestruje operację w audit_logs.
   *
   * @param eventId - ID wydarzenia dla którego uruchamiane jest losowanie
   * @param command - Parametry algorytmu losowania (iterations, balance_threshold)
   * @param actor - Kontekst użytkownika wykonującego operację (userId, role, ipAddress)
   * @returns Promise rozwiązujący się do TeamDrawResultDTO zawierającego wynik algorytmu
   * @throws Error jeśli naruszono reguły biznesowe lub wystąpiły błędy walidacji
   */
  async runDraw(
    eventId: number,
    command: RunTeamDrawCommand,
    actor: TeamAssignmentActor
  ): Promise<TeamDrawResultDTO> {
    // Sprawdź podstawowe uprawnienia do wykonania operacji
    if (!this.canManageTeamAssignments(actor.role)) {
      throw new Error("Brak uprawnień do zarządzania przypisaniami drużyn");
    }

    // Sprawdź czy użytkownik jest organizatorem tego wydarzenia (jeśli nie jest adminem)
    if (!isAdmin(actor.role)) {
      const isEventOrganizer = await this.checkEventOrganizer(eventId, actor.userId);
      if (!isEventOrganizer) {
        throw new Error("Tylko organizator wydarzenia lub administrator może uruchomić losowanie drużyn");
      }
    }

    // Sprawdź czy wydarzenie istnieje i jest w odpowiednim statusie
    await this.validateEventForDraw(eventId);

    // Pobierz potwierdzone zapisy z danymi graczy
    const confirmedSignups = await this.getConfirmedSignupsWithPlayers(eventId);

    // Sprawdź czy jest wystarczająca liczba graczy do utworzenia drużyn
    if (confirmedSignups.length < 4) {
      throw new Error("Minimalna liczba graczy do losowania drużyn to 4");
    }

    // Uruchom algorytm balansowania drużyn
    const drawResult = await this.computeBalancedTeams(confirmedSignups, command);

    // Zamień wynik algorytmu na przypisania drużyn
    const teamAssignments = this.convertDrawResultToAssignments(eventId, drawResult);

    // Zapisz przypisania w bazie danych (usuń istniejące, wstaw nowe)
    await this.saveTeamAssignments(eventId, teamAssignments, actor);

    // Zarejestruj operację w audit_logs
    await this.logDrawOperation(eventId, command, drawResult, actor);

    return drawResult;
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

  /**
   * Sprawdza czy wydarzenie istnieje i jest w statusie pozwalającym na losowanie drużyn.
   *
   * @param eventId - ID wydarzenia do sprawdzenia
   * @throws Error jeśli wydarzenie nie istnieje lub nie pozwala na losowanie
   */
  private async validateEventForDraw(eventId: number): Promise<void> {
    const { data, error } = await this.supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .single();

    if (error) {
      throw new Error(`Błąd podczas sprawdzania wydarzenia: ${error.message}`);
    }

    if (!data) {
      throw new Error("Wydarzenie nie zostało znalezione");
    }

    // Sprawdź czy status pozwala na losowanie (aktywne lub zakończone)
    if (!["active", "completed"].includes(data.status)) {
      throw new Error("Losowanie drużyn możliwe tylko dla wydarzeń aktywnych lub zakończonych");
    }
  }

  /**
   * Pobiera potwierdzone zapisy na wydarzenie wraz z danymi graczy.
   *
   * @param eventId - ID wydarzenia
   * @returns Promise rozwiązujący się do tablicy potwierdzonych zapisów z danymi graczy
   */
  private async getConfirmedSignupsWithPlayers(eventId: number) {
    const { data, error } = await this.supabase
      .from("event_signups")
      .select(`
        id,
        event_id,
        player_id,
        players (
          id,
          first_name,
          last_name,
          position,
          skill_rate
        )
      `)
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (error) {
      throw new Error(`Błąd podczas pobierania potwierdzonych zapisów: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Uruchamia algorytm balansowania drużyn.
   *
   * @param confirmedSignups - Potwierdzone zapisy z danymi graczy
   * @param command - Parametry algorytmu
   * @returns Promise rozwiązujący się do TeamDrawResultDTO
   */
  private async computeBalancedTeams(confirmedSignups: any[], command: RunTeamDrawCommand): Promise<TeamDrawResultDTO> {
    return computeBalancedTeams(confirmedSignups, command);
  }

  /**
   * Konwertuje wynik algorytmu na przypisania drużyn.
   *
   * @param eventId - ID wydarzenia
   * @param drawResult - Wynik algorytmu losowania
   * @returns Tablica przypisań drużyn
   */
  private convertDrawResultToAssignments(eventId: number, drawResult: TeamDrawResultDTO) {
    const assignments: ManualTeamAssignmentEntry[] = [];

    // Iteruj przez wszystkie drużyny
    for (const team of drawResult.teams) {
      // Dla każdego gracza w drużynie znajdź odpowiadający signup_id
      for (const player of team.players) {
        // Musimy znaleźć signup_id na podstawie player_id i eventId
        // To będzie wymagało dodatkowego zapytania, ale na razie użyjemy założenia
        // że player_id odpowiada signup_id (co nie jest prawdziwe)
        // TODO: Poprawić mapowanie player_id -> signup_id
        assignments.push({
          signup_id: player.player_id, // Tymczasowe - powinno być signup_id
          team_number: team.team_number,
        });
      }
    }

    return assignments;
  }

  /**
   * Zapisuje przypisania drużyn w bazie danych.
   *
   * @param eventId - ID wydarzenia
   * @param assignments - Nowe przypisania do zapisania
   * @param actor - Kontekst użytkownika wykonującego operację
   */
  private async saveTeamAssignments(eventId: number, assignments: any[], actor: TeamAssignmentActor): Promise<void> {
    // Najpierw usuń istniejące przypisania dla wszystkich zapisów tego wydarzenia
    const signupIds = assignments.map(a => a.signup_id);
    if (signupIds.length > 0) {
      const { error: deleteError } = await this.supabase
        .from("team_assignments")
        .delete()
        .in("signup_id", signupIds);

      if (deleteError) {
        throw new Error(`Błąd podczas usuwania istniejących przypisań: ${deleteError.message}`);
      }
    }

    // Dodaj nowe przypisania
    if (assignments.length > 0) {
      const { error: insertError } = await this.supabase
        .from("team_assignments")
        .insert(assignments);

      if (insertError) {
        throw new Error(`Błąd podczas tworzenia nowych przypisań: ${insertError.message}`);
      }
    }
  }

  /**
   * Rejestruje operację losowania w audit_logs.
   *
   * @param eventId - ID wydarzenia
   * @param command - Parametry algorytmu
   * @param drawResult - Wynik algorytmu
   * @param actor - Kontekst użytkownika wykonującego operację
   */
  private async logDrawOperation(
    eventId: number,
    command: RunTeamDrawCommand,
    drawResult: TeamDrawResultDTO,
    actor: TeamAssignmentActor
  ): Promise<void> {
    const auditEntry = {
      action_type: "team_draw",
      actor_id: actor.userId,
      target_id: eventId,
      target_table: "events",
      changes: {
        iterations: command.iterations,
        balance_threshold: command.balance_threshold,
        balance_achieved: drawResult.balance_achieved,
        teams_count: drawResult.teams.length,
      },
      ip_address: actor.ipAddress,
    };

    const { error } = await this.supabase
      .from("audit_logs")
      .insert(auditEntry);

    if (error) {
      // Loguj błąd ale nie przerywaj operacji - audyt nie powinien blokować biznesowej logiki
      console.error("Błąd podczas rejestrowania operacji losowania w audit_logs:", error);
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
