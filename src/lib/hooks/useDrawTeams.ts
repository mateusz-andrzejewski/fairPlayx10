import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  DrawTeamsViewModel,
  TeamViewModel,
  PlayerViewModel,
  TeamDrawResultDTO,
  TeamAssignmentsListResponseDTO,
  ManualTeamAssignmentEntry,
  RunTeamDrawCommand,
  CreateTeamAssignmentsCommand,
  UserRole,
} from "../../types";

/**
 * Hook do zarządzania losowaniem drużyn dla wydarzenia.
 * Integruje API calls, zarządzanie stanem i logikę biznesową dla widoku losowania drużyn.
 */
export function useDrawTeams(eventId: number, userRole: UserRole) {
  // Stan podstawowy
  const [teams, setTeams] = useState<TeamViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceAchieved, setBalanceAchieved] = useState(false);

  /**
   * Transformacja surowych danych przypisań na TeamViewModel
   * Grupuje graczy wg drużyn i oblicza statystyki
   */
  const transformAssignmentsToTeams = useCallback(
    (assignments: TeamAssignmentsListResponseDTO): TeamViewModel[] => {
      const teamsMap = new Map<
        number,
        { players: PlayerViewModel[]; avgSkillRate: number; positions: Record<string, number> }
      >();

      assignments.data.forEach((assignment) => {
        const teamNumber = assignment.team_number;

        if (!teamsMap.has(teamNumber)) {
          teamsMap.set(teamNumber, {
            players: [],
            avgSkillRate: 0,
            positions: {},
          });
        }

        const team = teamsMap.get(teamNumber)!;
        const playerInfo = assignment.player;

        const playerName = playerInfo
          ? `${playerInfo.first_name} ${playerInfo.last_name}`.trim()
          : `Gracz #${assignment.signup_id}`;
        const position = playerInfo?.position ?? "nieznana";
        const skillRate = typeof playerInfo?.skill_rate === "number" ? playerInfo.skill_rate : 0;

        const player: PlayerViewModel = {
          signupId: assignment.signup_id,
          playerId: assignment.player_id ?? playerInfo?.id ?? null,
          name: playerName,
          position,
          skillRate,
        };

        team.players.push(player);
      });

      const teams: TeamViewModel[] = [];
      teamsMap.forEach((teamData, teamNumber) => {
        const players = teamData.players;

        const avgSkillRate =
          players.length > 0 ? players.reduce((sum, player) => sum + player.skillRate, 0) / players.length : 0;

        const positions: Record<string, number> = {};
        players.forEach((player) => {
          positions[player.position] = (positions[player.position] || 0) + 1;
        });

        teams.push({
          teamNumber,
          players,
          avgSkillRate,
          positions,
        });
      });

      if (teams.length === 0) {
        setBalanceAchieved(false);
        return teams;
      }

      const avgSkillRates = teams.map((team) => team.avgSkillRate);
      const maxAvg = Math.max(...avgSkillRates);
      const minAvg = Math.min(...avgSkillRates);
      const balanceThreshold = 7; // 7% jak w planie

      const achieved =
        avgSkillRates.every((rate) => rate === 0) || maxAvg === 0
          ? false
          : ((maxAvg - minAvg) / maxAvg) * 100 <= balanceThreshold;

      setBalanceAchieved(achieved);

      return teams;
    },
    []
  );

  /**
   * Pobieranie aktualnych przypisań drużyn dla wydarzenia
   */
  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/teams`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TeamAssignmentsListResponseDTO = await response.json();
      const teamsData = transformAssignmentsToTeams(data);
      setTeams(teamsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać przypisań drużyn";
      setError(errorMessage);
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [eventId, transformAssignmentsToTeams, toast]);

  /**
   * Uruchomienie automatycznego algorytmu losowania drużyn
   */
  const runDraw = useCallback(async () => {
    // Walidacja roli użytkownika
    if (userRole !== "admin" && userRole !== "organizer") {
      const errorMessage = "Brak uprawnień do uruchamiania losowania drużyn";
      setError(errorMessage);
      toast.error("Błąd", { description: errorMessage });
      return;
    }

    // Walidacja minimalnej liczby graczy
    const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);
    if (totalPlayers < 4) {
      const errorMessage = "Minimalna liczba graczy do losowania drużyn to 4";
      setError(errorMessage);
      toast.error("Błąd", { description: errorMessage });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const command: RunTeamDrawCommand = {
        iterations: 20,
        balance_threshold: 0.07, // 7%
      };

      const response = await fetch(`/api/events/${eventId}/teams/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się uruchomić losowania");
      }

      const result: TeamDrawResultDTO = await response.json();

      if (result.success) {
        // Transformuj wynik na TeamViewModel i ustaw w stanie
        const teamsData: TeamViewModel[] = result.teams.map((team) => ({
          teamNumber: team.team_number,
          players: team.players.map((player) => ({
            signupId: player.signup_id ?? player.player_id,
            playerId: player.player_id,
            name: player.player_name,
            position: player.position,
            skillRate: player.skill_rate,
          })),
          avgSkillRate: team.stats.avg_skill_rate,
          positions: { ...team.stats.positions },
        }));

        setTeams(teamsData);
        setBalanceAchieved(result.balance_achieved);

        toast.success("Sukces", {
          description: result.balance_achieved
            ? "Losowanie drużyn zostało pomyślnie wykonane"
            : "Losowanie zostało wykonane, ale balans drużyn nie został osiągnięty. Rozważ ręczną edycję.",
        });
      } else {
        throw new Error("Algorytm losowania nie powiódł się");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się uruchomić losowania drużyn";
      setError(errorMessage);
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userRole, teams, toast]);

  /**
   * Ręczne przypisanie graczy do drużyn
   */
  const assignTeams = useCallback(
    async (assignments: ManualTeamAssignmentEntry[]) => {
      // Walidacja roli użytkownika
      if (userRole !== "admin" && userRole !== "organizer") {
        const errorMessage = "Brak uprawnień do zarządzania przypisaniami drużyn";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
        return;
      }

      // Sprawdź balans drużyn przed zapisem (tylko dla admina)
      if (userRole === "admin") {
        // Oblicz balans na podstawie aktualnych drużyn
        const currentTeams = [...teams];
        const totalPlayers = currentTeams.reduce((sum, team) => sum + team.players.length, 0);

        if (totalPlayers > 0) {
          const avgSkillRates = currentTeams.filter((team) => team.players.length > 0).map((team) => team.avgSkillRate);

          if (avgSkillRates.length > 1) {
            const maxAvg = Math.max(...avgSkillRates);
            const minAvg = Math.min(...avgSkillRates);
            const balanceThreshold = 7; // 7%

            if (((maxAvg - minAvg) / maxAvg) * 100 > balanceThreshold) {
              const errorMessage =
                "Nie można zapisać przypisań - różnica średniego skill rate przekracza 7%. Dostosuj skład drużyn.";
              setError(errorMessage);
              toast.error("Błąd", { description: errorMessage });
              return;
            }
          }
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const command: CreateTeamAssignmentsCommand = {
          assignments,
        };

        const response = await fetch(`/api/events/${eventId}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się zapisać przypisań drużyn");
        }

        toast.success("Sukces", { description: "Przypisania drużyn zostały zapisane" });

        // Odśwież dane drużyn
        await fetchTeams();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać przypisań drużyn";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, userRole, teams, fetchTeams, toast]
  );

  /**
   * Efekt ładowania danych przy montowaniu komponentu
   */
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  /**
   * Stan kompletny zgodny z DrawTeamsViewModel
   */
  const state: DrawTeamsViewModel = {
    eventId,
    teams,
    isLoading,
    error,
    balanceAchieved,
  };

  /**
   * Akcje dostępne dla komponentów
   */
  const actions = {
    runDraw,
    assignTeams,
    refresh: fetchTeams,
  };

  return {
    state,
    actions,
  };
}
