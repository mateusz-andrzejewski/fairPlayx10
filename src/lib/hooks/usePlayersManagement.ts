import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type {
  PlayerListItemVM,
  PlayerDTO,
  PaginationMetaDTO,
  SearchFiltersVM,
  UserRole,
  PlayersListResponseDTO,
  CreatePlayerCommand,
  UpdatePlayerCommand,
} from "../../types";

/**
 * Stan modali dla zarządzania graczami
 */
interface ModalStates {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDetailsModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedPlayer: PlayerDTO | null;
}

/**
 * Akcje dostępne w hooku zarządzania graczami
 */
interface PlayersManagementActions {
  // Filtrowanie i wyszukiwanie
  setSearchFilters: (filters: Partial<SearchFiltersVM>) => void;
  clearFilters: () => void;

  // CRUD operacje
  createPlayer: (command: CreatePlayerCommand) => Promise<void>;
  updatePlayer: (id: number, command: UpdatePlayerCommand) => Promise<void>;
  deletePlayer: (id: number) => Promise<void>;

  // Zarządzanie modalami
  openCreateModal: () => void;
  openEditModal: (player: PlayerDTO) => void;
  openDetailsModal: (player: PlayerDTO) => void;
  openDeleteDialog: (player: PlayerDTO) => void;
  closeAllModals: () => void;

  // Paginacja
  goToPage: (page: number) => void;
  changePageSize: (limit: number) => void;
}

/**
 * Główny hook do zarządzania stanem widoku listy graczy.
 * Integruje wszystkie API calls, zarządzanie stanem i logikę biznesową.
 */
export function usePlayersManagement(userRole: UserRole) {
  // Stan podstawowy
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMetaDTO>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stan filtrów
  const [filters, setFilters] = useState<SearchFiltersVM>({
    search: "",
    position: null,
    page: 1,
    limit: 20,
  });

  // Stan modali
  const [modalStates, setModalStates] = useState<ModalStates>({
    isCreateModalOpen: false,
    isEditModalOpen: false,
    isDetailsModalOpen: false,
    isDeleteDialogOpen: false,
    selectedPlayer: null,
  });

  // Stan operacji
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications

  /**
   * Obliczone właściwości na podstawie roli użytkownika
   */
  const permissions = useMemo(
    () => ({
      canEditSkillRate: userRole === "admin",
      canDelete: userRole === "admin",
      canCreate: userRole === "admin" || userRole === "organizer",
    }),
    [userRole]
  );

  /**
   * Transformacja surowych danych graczy na ViewModel dla listy
   */
  const playersVM: PlayerListItemVM[] = useMemo(() => {
    return players.map((player) => ({
      ...player,
      fullName: `${player.first_name} ${player.last_name}`,
      canEditSkillRate: permissions.canEditSkillRate,
      canDelete: permissions.canDelete,
    }));
  }, [players, permissions]);

  /**
   * Pobieranie listy graczy z API
   */
  const fetchPlayers = useCallback(
    async (searchFilters: SearchFiltersVM) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: searchFilters.page.toString(),
          limit: searchFilters.limit.toString(),
          ...(searchFilters.search && { search: searchFilters.search }),
          ...(searchFilters.position && { position: searchFilters.position }),
          include_skill_rate: permissions.canEditSkillRate.toString(),
        });

        const response = await fetch(`/api/players?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: PlayersListResponseDTO = await response.json();
        setPlayers(data.data);
        setPagination(data.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać listy graczy";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [permissions.canEditSkillRate, toast]
  );

  /**
   * Debounced fetch - wywołuje fetchPlayers z opóźnieniem
   */
  const debouncedFetch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (filters: SearchFiltersVM) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fetchPlayers(filters), 300);
    };
  }, [fetchPlayers]);

  /**
   * Efekt ładowania danych przy zmianie filtrów
   */
  useEffect(() => {
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  /**
   * Akcje zarządzania filtrami
   */
  const setSearchFilters = useCallback((newFilters: Partial<SearchFiltersVM>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset do pierwszej strony przy zmianie filtrów
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      position: null,
      page: 1,
      limit: 20,
    });
  }, []);

  /**
   * Akcje CRUD
   */
  const createPlayer = useCallback(
    async (command: CreatePlayerCommand) => {
      if (!permissions.canCreate) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do tworzenia graczy" });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się utworzyć gracza");
        }

        const createdPlayer: PlayerDTO = await response.json();
        toast.success("Sukces", { description: "Gracz został utworzony" });

        // Odśwież listę i zamknij modal
        await fetchPlayers(filters);
        setModalStates((prev) => ({ ...prev, isCreateModalOpen: false }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się utworzyć gracza";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [permissions.canCreate, filters, fetchPlayers, toast]
  );

  const updatePlayer = useCallback(
    async (id: number, command: UpdatePlayerCommand) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/player/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się zaktualizować gracza");
        }

        const updatedPlayer: PlayerDTO = await response.json();
        toast.success("Sukces", { description: "Gracz został zaktualizowany" });

        // Odśwież listę i zamknij modal
        await fetchPlayers(filters);
        setModalStates((prev) => ({ ...prev, isEditModalOpen: false, selectedPlayer: null }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zaktualizować gracza";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [filters, fetchPlayers, toast]
  );

  const deletePlayer = useCallback(
    async (id: number) => {
      if (!permissions.canDelete) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do usuwania graczy" });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/player/${id}`, { method: "DELETE" });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się usunąć gracza");
        }

        toast.success("Sukces", { description: "Gracz został usunięty" });

        // Odśwież listę i zamknij dialog
        await fetchPlayers(filters);
        setModalStates((prev) => ({ ...prev, isDeleteDialogOpen: false, selectedPlayer: null }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się usunąć gracza";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [permissions.canDelete, filters, fetchPlayers, toast]
  );

  /**
   * Akcje zarządzania modalami
   */
  const openCreateModal = useCallback(() => {
    setModalStates((prev) => ({
      ...prev,
      isCreateModalOpen: true,
      selectedPlayer: null,
    }));
  }, []);

  const openEditModal = useCallback((player: PlayerDTO) => {
    setModalStates((prev) => ({
      ...prev,
      isEditModalOpen: true,
      selectedPlayer: player,
    }));
  }, []);

  const openDetailsModal = useCallback((player: PlayerDTO) => {
    setModalStates((prev) => ({
      ...prev,
      isDetailsModalOpen: true,
      selectedPlayer: player,
    }));
  }, []);

  const openDeleteDialog = useCallback(
    (player: PlayerDTO) => {
      if (!permissions.canDelete) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do usuwania graczy" });
        return;
      }

      setModalStates((prev) => ({
        ...prev,
        isDeleteDialogOpen: true,
        selectedPlayer: player,
      }));
    },
    [permissions.canDelete, toast]
  );

  const closeAllModals = useCallback(() => {
    setModalStates({
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDetailsModalOpen: false,
      isDeleteDialogOpen: false,
      selectedPlayer: null,
    });
  }, []);

  /**
   * Akcje paginacji
   */
  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Złożony obiekt akcji
   */
  const actions: PlayersManagementActions = {
    setSearchFilters,
    clearFilters,
    createPlayer,
    updatePlayer,
    deletePlayer,
    openCreateModal,
    openEditModal,
    openDetailsModal,
    openDeleteDialog,
    closeAllModals,
    goToPage,
    changePageSize,
  };

  return {
    // Stan
    players: playersVM,
    pagination,
    loading,
    error,
    filters,
    modalStates,
    isSubmitting,

    // Uprawnienia
    permissions,

    // Akcje
    actions,
  };
}
