import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type {
  EventSignupsListDTO,
  SignupCardViewModel,
  EventSignupsState,
  AddPlayerFormData,
  ConfirmActionData,
  SignupAction,
  PaginationMetaDTO,
  UserRole,
  PlayerDTO,
  PlayersListResponseDTO,
} from "../../types";

/**
 * Hook do zarządzania zapisami na wydarzenie.
 * Integruje API calls, zarządzanie stanem i logikę biznesową dla widoku zapisów na wydarzenie.
 */
export function useEventSignups(eventId: number, userRole: UserRole) {
  // Stan podstawowy
  const [signupsData, setSignupsData] = useState<EventSignupsListDTO | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stan modali
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmActionData | null>(null);

  // Stan operacji
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Transformacja surowych danych zapisów na SignupCardViewModel
   * Wzbogaca dane o informacje o graczach i flagi uprawnień
   */
  const signups: SignupCardViewModel[] = useMemo(() => {
    if (!signupsData?.data) return [];

    // TODO: Pobrać informacje o graczach - na razie mockup
    // W pełnej implementacji trzeba będzie pobrać dane graczy
    return signupsData.data.map((signup) => ({
      id: signup.id,
      player: {
        id: signup.player_id,
        name: `Player ${signup.player_id}`, // TODO: Pobrać prawdziwe imię i nazwisko
        position: "forward" as const, // TODO: Pobrać prawdziwą pozycję
      },
      status: signup.status,
      signupTimestamp: signup.signup_timestamp,
      canEdit: userRole === "admin" || userRole === "organizer",
    }));
  }, [signupsData, userRole]);

  /**
   * Pobieranie listy zapisów na wydarzenie
   */
  const fetchSignups = useCallback(
    async (page: number = 1, limit: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/events/${eventId}/signups?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: EventSignupsListDTO = await response.json();
        setSignupsData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać listy zapisów";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [eventId, toast]
  );

  /**
   * Pobieranie listy dostępnych graczy dla dodania
   */
  const fetchAvailablePlayers = useCallback(async () => {
    setLoadingPlayers(true);
    try {
      const response = await fetch("/api/players?page=1&limit=50");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PlayersListResponseDTO = await response.json();
      setAvailablePlayers(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać listy graczy";
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setLoadingPlayers(false);
    }
  }, [toast]);

  /**
   * Dodanie gracza do wydarzenia
   */
  const addPlayerToEvent = useCallback(
    async (data: AddPlayerFormData) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: data.playerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się dodać gracza");
        }

        toast.success("Sukces", { description: "Gracz został dodany do wydarzenia" });

        // Odśwież listę zapisów
        await fetchSignups(signupsData?.pagination.page, signupsData?.pagination.limit);
        setAddPlayerOpen(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się dodać gracza";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, fetchSignups, signupsData, toast]
  );

  /**
   * Aktualizacja statusu zapisu
   */
  const updateSignupStatus = useCallback(
    async (signupId: number, newStatus: string) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups/${signupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się zaktualizować statusu");
        }

        toast.success("Sukces", { description: "Status zapisu został zaktualizowany" });

        // Odśwież listę zapisów
        await fetchSignups(signupsData?.pagination.page, signupsData?.pagination.limit);
        setConfirmOpen(false);
        setConfirmData(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zaktualizować statusu";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, fetchSignups, signupsData, toast]
  );

  /**
   * Wycofanie zapisu
   */
  const withdrawSignup = useCallback(
    async (signupId: number) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups/${signupId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się wycofać zapisu");
        }

        toast.success("Sukces", { description: "Zapis został wycofany" });

        // Odśwież listę zapisów
        await fetchSignups(signupsData?.pagination.page, signupsData?.pagination.limit);
        setConfirmOpen(false);
        setConfirmData(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się wycofać zapisu";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, fetchSignups, signupsData, toast]
  );

  /**
   * Obsługa akcji z kart zapisów
   */
  const handleSignupAction = useCallback(
    (action: SignupAction) => {
      if (action.type === "updateStatus") {
        setConfirmData({
          action: "updateStatus",
          signupId: action.signupId,
          newStatus: action.newStatus,
        });
        setConfirmOpen(true);
      } else if (action.type === "withdraw") {
        setConfirmData({
          action: "withdraw",
          signupId: action.signupId,
        });
        setConfirmOpen(true);
      }
    },
    []
  );

  /**
   * Potwierdzenie akcji w modalu
   */
  const confirmAction = useCallback(async () => {
    if (!confirmData) return;

    if (confirmData.action === "updateStatus" && confirmData.newStatus) {
      await updateSignupStatus(confirmData.signupId, confirmData.newStatus);
    } else if (confirmData.action === "withdraw") {
      await withdrawSignup(confirmData.signupId);
    }
  }, [confirmData, updateSignupStatus, withdrawSignup]);

  /**
   * Otwarcie modalu dodawania gracza
   */
  const openAddPlayerModal = useCallback(async () => {
    await fetchAvailablePlayers();
    setAddPlayerOpen(true);
  }, [fetchAvailablePlayers]);

  /**
   * Zamknięcie modalu dodawania gracza
   */
  const closeAddPlayerModal = useCallback(() => {
    setAddPlayerOpen(false);
  }, []);

  /**
   * Zamknięcie modalu potwierdzenia
   */
  const closeConfirmModal = useCallback(() => {
    setConfirmOpen(false);
    setConfirmData(null);
  }, []);

  /**
   * Zmiana strony paginacji
   */
  const changePage = useCallback(
    async (page: number) => {
      await fetchSignups(page, signupsData?.pagination.limit || 20);
    },
    [fetchSignups, signupsData]
  );

  /**
   * Efekt ładowania danych przy montowaniu komponentu
   */
  useEffect(() => {
    fetchSignups();
  }, [fetchSignups]);

  /**
   * Stan kompletny
   */
  const state: EventSignupsState = {
    signups,
    loading,
    error,
    pagination: signupsData?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 0,
    },
    modals: {
      addPlayerOpen,
      confirmOpen,
      confirmData,
    },
  };

  /**
   * Akcje dostępne dla komponentów
   */
  const actions = {
    handleSignupAction,
    confirmAction,
    openAddPlayerModal,
    closeAddPlayerModal,
    closeConfirmModal,
    changePage,
    addPlayerToEvent,
  };

  return {
    state,
    actions,
    isSubmitting,
    loadingPlayers,
    availablePlayers,
  };
}
