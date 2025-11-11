import type {
  RunTeamDrawCommand,
  TeamDrawResultDTO,
  TeamDrawTeamDTO,
  TeamDrawPlayerDTO,
  TeamDrawStatsDTO,
} from "../../types";

/**
 * Interfejs reprezentujący dane gracza potrzebne do algorytmu losowania.
 */
interface DrawPlayerData {
  signup_id: number;
  player_id: number;
  player_name: string;
  position: string;
  skill_rate: number;
}

/**
 * Interfejs reprezentujący drużynę podczas procesu losowania.
 */
interface DrawTeam {
  team_number: number;
  players: DrawPlayerData[];
  total_skill: number;
  position_counts: Record<string, number>;
}

/**
 * Moduł zawierający algorytm balansowania drużyn.
 * Implementuje heurystyczne podejście do tworzenia zrównoważonych drużyn
 * na podstawie skill rate i rozkładu pozycji.
 */
export class TeamDrawEngine {
  /**
   * Główna funkcja uruchamiająca algorytm balansowania drużyn.
   * Wykonuje wielokrotne iteracje tasowania graczy i wybiera najlepszy rozkład.
   *
   * @param confirmedSignups - Potwierdzone zapisy z danymi graczy
   * @param command - Parametry algorytmu (iterations, balance_threshold)
   * @returns Promise rozwiązujący się do TeamDrawResultDTO
   */
  static async computeBalancedTeams(
    confirmedSignups: any[],
    command: RunTeamDrawCommand
  ): Promise<TeamDrawResultDTO> {
    try {
      // Przygotuj dane graczy do algorytmu
      const players = this.preparePlayerData(confirmedSignups);

      // Sprawdź minimalną liczbę graczy
      if (players.length < 4) {
        throw new Error("Minimalna liczba graczy do losowania drużyn to 4");
      }

      // Oblicz optymalną liczbę drużyn
      const teamCount = this.calculateOptimalTeamCount(players.length);

      // Uruchom algorytm wielokrotnych iteracji
      const bestTeams = this.runBalancingAlgorithm(players, teamCount, command);

      // Oblicz statystyki i sprawdź czy balans został osiągnięty
      const teams = this.convertToTeamDrawTeams(bestTeams);
      const balanceAchieved = this.checkBalanceAchieved(teams, command.balance_threshold);

      return {
        success: true,
        teams,
        balance_achieved: balanceAchieved,
      };
    } catch (error) {
      console.error("Błąd podczas wykonywania algorytmu losowania drużyn:", error);
      return {
        success: false,
        teams: [],
        balance_achieved: false,
      };
    }
  }

  /**
   * Przygotowuje dane graczy z formatu bazy danych do formatu algorytmu.
   *
   * @param confirmedSignups - Dane z bazy zawierające zapisy i graczy
   * @returns Tablica graczy w formacie DrawPlayerData
   */
  private static preparePlayerData(confirmedSignups: any[]): DrawPlayerData[] {
    return confirmedSignups.map((signup) => ({
      signup_id: signup.id,
      player_id: signup.player_id,
      player_name: `${signup.players.first_name} ${signup.players.last_name}`,
      position: signup.players.position,
      skill_rate: signup.players.skill_rate,
    }));
  }

  /**
   * Oblicza optymalną liczbę drużyn na podstawie liczby graczy.
   * Dąży do drużyn 4-6 osobowych, preferując parzystą liczbę drużyn.
   *
   * @param playerCount - Łączna liczba graczy
   * @returns Optymalna liczba drużyn
   */
  private static calculateOptimalTeamCount(playerCount: number): number {
    if (playerCount <= 8) return 2;
    if (playerCount <= 12) return 3;
    if (playerCount <= 16) return 4;
    if (playerCount <= 20) return 5;
    return Math.ceil(playerCount / 4); // Maksymalnie 4 graczy na drużynę
  }

  /**
   * Główny algorytm balansowania drużyn.
   * Wykonuje wielokrotne iteracje tasowania i oceny rozkładów.
   *
   * @param players - Lista graczy do rozlosowania
   * @param teamCount - Docelowa liczba drużyn
   * @param command - Parametry algorytmu
   * @returns Najlepszy znaleziony rozkład drużyn
   */
  private static runBalancingAlgorithm(
    players: DrawPlayerData[],
    teamCount: number,
    command: RunTeamDrawCommand
  ): DrawTeam[] {
    let bestTeams: DrawTeam[] = [];
    let bestScore = Infinity;

    // Wykonaj określoną liczbę iteracji
    for (let iteration = 0; iteration < command.iterations; iteration++) {
      // Tasuj graczy
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      // Rozmieść graczy w drużynach metodą round-robin
      const teams = this.createTeamsRoundRobin(shuffledPlayers, teamCount);

      // Oblicz ocenę balansu dla tego rozkładu
      const score = this.calculateBalanceScore(teams);

      // Zachowaj najlepszy rozkład
      if (score < bestScore) {
        bestScore = score;
        bestTeams = teams;
      }
    }

    return bestTeams;
  }

  /**
   * Tworzy drużyny używając metody round-robin.
   * Rozdziela graczy po jednym do każdej drużyny w cyklu.
   *
   * @param players - Lista graczy do rozlosowania
   * @param teamCount - Liczba drużyn do utworzenia
   * @returns Tablica drużyn
   */
  private static createTeamsRoundRobin(players: DrawPlayerData[], teamCount: number): DrawTeam[] {
    const teams: DrawTeam[] = Array.from({ length: teamCount }, (_, index) => ({
      team_number: index + 1,
      players: [],
      total_skill: 0,
      position_counts: {},
    }));

    // Rozmieść graczy metodą round-robin
    players.forEach((player, index) => {
      const teamIndex = index % teamCount;
      const team = teams[teamIndex];

      team.players.push(player);
      team.total_skill += player.skill_rate;

      // Aktualizuj liczniki pozycji
      team.position_counts[player.position] = (team.position_counts[player.position] || 0) + 1;
    });

    return teams;
  }

  /**
   * Oblicza ocenę balansu dla danego rozkładu drużyn.
   * Niższa ocena oznacza lepszy balans.
   *
   * @param teams - Rozkład drużyn do oceny
   * @returns Ocena balansu (niższa = lepsza)
   */
  private static calculateBalanceScore(teams: DrawTeam[]): number {
    const avgSkills = teams.map(team => team.total_skill / team.players.length);
    const skillMean = avgSkills.reduce((sum, skill) => sum + skill, 0) / avgSkills.length;
    const skillVariance = avgSkills.reduce((sum, skill) => sum + Math.pow(skill - skillMean, 2), 0) / avgSkills.length;

    // Dodatkowa kara za nierówny rozkład pozycji (uproszczona wersja)
    const positionVariance = this.calculatePositionVariance(teams);

    return skillVariance + positionVariance;
  }

  /**
   * Oblicza wariancję rozkładu pozycji między drużynami.
   *
   * @param teams - Rozkład drużyn do analizy
   * @returns Kara za nierówny rozkład pozycji
   */
  private static calculatePositionVariance(teams: DrawTeam[]): number {
    const positions = new Set(teams.flatMap(team => Object.keys(team.position_counts)));
    let totalVariance = 0;

    for (const position of positions) {
      const positionCounts = teams.map(team => team.position_counts[position] || 0);
      const positionMean = positionCounts.reduce((sum, count) => sum + count, 0) / positionCounts.length;
      const positionVariance = positionCounts.reduce((sum, count) => sum + Math.pow(count - positionMean, 2), 0) / positionCounts.length;
      totalVariance += positionVariance;
    }

    return totalVariance * 0.1; // Mniejsza waga dla pozycji niż dla skill rate
  }

  /**
   * Konwertuje wewnętrzny format drużyn na format DTO.
   *
   * @param teams - Drużyny w wewnętrznym formacie
   * @returns Drużyny w formacie TeamDrawTeamDTO
   */
  private static convertToTeamDrawTeams(teams: DrawTeam[]): TeamDrawTeamDTO[] {
    return teams.map(team => ({
      team_number: team.team_number,
      players: team.players.map(player => ({
        player_id: player.player_id,
        player_name: player.player_name,
        position: player.position as any, // Type assertion - zakładamy zgodność typów
        skill_rate: player.skill_rate,
      })),
      stats: {
        avg_skill_rate: team.players.length > 0 ? team.total_skill / team.players.length : 0,
        positions: team.position_counts,
      },
    }));
  }

  /**
   * Sprawdza czy osiągnięto zadowalający balans drużyn.
   *
   * @param teams - Rozkład drużyn do sprawdzenia
   * @param threshold - Próg akceptowalnego odchylenia
   * @returns true jeśli balans został osiągnięty
   */
  private static checkBalanceAchieved(teams: TeamDrawTeamDTO[], threshold: number): boolean {
    if (teams.length === 0) return false;

    const avgSkills = teams.map(team => team.stats.avg_skill_rate);
    const skillMean = avgSkills.reduce((sum, skill) => sum + skill, 0) / avgSkills.length;
    const maxDeviation = Math.max(...avgSkills.map(skill => Math.abs(skill - skillMean)));

    return maxDeviation <= threshold;
  }
}

/**
 * Funkcja pomocnicza do uruchamiania algorytmu (eksportowana dla testów).
 */
export async function computeBalancedTeams(
  confirmedSignups: any[],
  command: RunTeamDrawCommand
): Promise<TeamDrawResultDTO> {
  return TeamDrawEngine.computeBalancedTeams(confirmedSignups, command);
}
