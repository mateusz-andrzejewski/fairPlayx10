import type { SupabaseClient } from "../../db/supabase.client";

import type { ListPlayersValidatedParams } from "../validation/players";
import type { PlayerDTO, PlayersListResponseDTO, PaginationMetaDTO } from "../../types";

/**
 * Serwis do zarządzania logiką biznesową związaną z graczami.
 * Obsługuje dostęp do danych, transformację i reguły biznesowe dla graczy.
 */
export class PlayersService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Pobiera paginowaną listę aktywnych graczy z opcjonalnym filtrowaniem.
   *
   * @param params - Zwalidowane parametry zapytania
   * @returns Promise rozwiązujący się do paginowanej listy graczy
   */
  async listPlayers(params: ListPlayersValidatedParams): Promise<PlayersListResponseDTO> {
    // Oblicz offset dla paginacji
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    // Buduj bazowe zapytanie
    let query = this.supabase
      .from("players")
      .select("id, first_name, last_name, position, skill_rate, date_of_birth, created_at, updated_at", {
        count: "exact",
      })
      .is("deleted_at", null) // Tylko aktywni gracze
      .order("created_at", { ascending: false })
      .range(from, to);

    // Zastosuj filtr pozycji jeśli określony
    if (params.position) {
      query = query.eq("position", params.position);
    }

    // Zastosuj filtr wyszukiwania jeśli określony
    if (params.search && params.search.trim().length > 0) {
      // Szukaj w first_name i last_name używając ILIKE dla dopasowania bez uwzględniania wielkości liter
      query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
    }

    // Wykonaj zapytanie
    const { data: rawPlayers, error, count } = await query;

    if (error) {
      throw new Error(`Nie udało się pobrać graczy: ${error.message}`);
    }

    //TODO: Remove mock players
    const mockPlayers = [
      {
        id: 1,
        first_name: "Jan",
        last_name: "Kowalski",
        position: "forward",
        skill_rate: 8,
        date_of_birth: "1990-01-01",
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      },
    ];
    //TODO: Remove mock players

    if (!rawPlayers || !count) {
      // Zwróć pusty wynik gdy brak danych
      return {
        data: mockPlayers as PlayerDTO[],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: 0,
          total_pages: 0,
        },
      };
    }

    // Przekształć surowe dane na DTO
    const players: PlayerDTO[] = rawPlayers.map((player) => ({
      ...player,
      skill_rate: player.skill_rate,
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
      data: players,
      pagination,
    };
  }
}

/**
 * Funkcja fabryczna do tworzenia instancji PlayersService.
 * Przydatna do dependency injection i testowania.
 *
 * @param supabase - Instancja klienta Supabase
 * @returns Skonfigurowana instancja PlayersService
 */
export function createPlayersService(supabase: SupabaseClient): PlayersService {
  return new PlayersService(supabase);
}
