import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { EventDetailsViewModel, EventDetailDTO, EventSignupWithNameViewModel, UserRole } from "../../types";

/**
 * Akcje dostępne w hooku zarządzania szczegółami wydarzenia
 */
interface EventDetailsActions {
  // Zarządzanie zapisami
  signupForEvent: () => Promise<void>;
  resignFromEvent: (signupId: number) => Promise<void>;
  addPlayerToEvent: (playerId: number) => Promise<void>;

  // Zarządzanie wydarzeniem
  editEvent: () => void; // callback do otwarcia formularza edycji
  drawTeams: () => Promise<void>;

  // Nawigacja
  goBack: () => void;

  // Odświeżanie danych
  refresh: () => Promise<void>;
}

/**
 * Główny hook do zarządzania stanem szczegółów pojedynczego wydarzenia.
 */
export function useEventDetails(eventId: number, userRole: UserRole, currentUserId?: number) {
  // Stan podstawowy
  const [event, setEvent] = useState<EventDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Stan operacji
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Transformacja surowych danych wydarzenia na ViewModel ze szczegółami
   */
  const eventVM: EventDetailsViewModel | null = useMemo(() => {
    if (!event || !currentUserId) return null;

    const isOrganizer = event.organizer_id === currentUserId;
    const userSignup = event.signups.find((signup) => {
      // Tutaj trzeba będzie sprawdzić player_id powiązany z user
      // Na razie zakładamy że currentUserId to player_id
      return signup.player_id === currentUserId;
    });
    const isSignedUp = !!userSignup;
    const canManageSignups = userRole === "admin" || isOrganizer;

    // Transformacja zapisów z nazwami graczy
    const signupsWithNames: EventSignupWithNameViewModel[] = event.signups.map((signup) => ({
      ...signup,
      playerName: `${signup.player_id}`, // TODO: Pobrać nazwę gracza z API
      // position: signup.position, // TODO: Dodać do API
      // skillRate: signup.skillRate, // TODO: Dodać do API (tylko dla organizatora/admina)
    }));

    return {
      ...event,
      isOrganizer,
      isSignedUp,
      canManageSignups,
      signupsWithNames,
    };
  }, [event, currentUserId, userRole]);

  /**
   * Pobieranie szczegółów wydarzenia z API
   */
  const fetchEventDetails = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Wydarzenie nie zostało znalezione");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: EventDetailDTO = await response.json();
        setEvent(data);
        setLastUpdated(new Date());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać szczegółów wydarzenia";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  /**
   * Efekt ładowania danych przy zmianie eventId
   */
  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId, fetchEventDetails]);

  /**
   * Zapis na wydarzenie
   */
  const signupForEvent = useCallback(async () => {
    if (!event || !currentUserId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/signups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: currentUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się zapisać na wydarzenie");
      }

      toast.success("Sukces", { description: "Zostałeś zapisany na wydarzenie" });

      // Odśwież dane
      await fetchEventDetails(eventId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać na wydarzenie";
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [event, currentUserId, eventId, fetchEventDetails, toast]);

  /**
   * Rezygnacja z wydarzenia
   */
  const resignFromEvent = useCallback(
    async (signupId: number) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups/${signupId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się zrezygnować z wydarzenia");
        }

        toast.success("Sukces", { description: "Zrezygnowałeś z udziału w wydarzeniu" });

        // Odśwież dane
        await fetchEventDetails(eventId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zrezygnować z wydarzenia";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId, fetchEventDetails, toast]
  );

  /**
   * Dodanie gracza do wydarzenia (organizator)
   */
  const addPlayerToEvent = useCallback(
    async (playerId: number) => {
      if (!eventVM?.canManageSignups) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do dodawania graczy" });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się dodać gracza do wydarzenia");
        }

        toast.success("Sukces", { description: "Gracz został dodany do wydarzenia" });

        // Odśwież dane
        await fetchEventDetails(eventId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się dodać gracza do wydarzenia";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventVM?.canManageSignups, eventId, fetchEventDetails, toast]
  );

  /**
   * Edycja wydarzenia (placeholder - callback do komponentu nadrzędnego)
   */
  const editEvent = useCallback(() => {
    if (!eventVM?.isOrganizer && userRole !== "admin") {
      toast.error("Brak uprawnień", { description: "Nie masz uprawnień do edycji wydarzenia" });
      return;
    }
    // TODO: Implementacja otworzenia modalu edycji
    toast.info("Funkcja edycji", { description: "Edycja wydarzenia będzie dostępna wkrótce" });
  }, [eventVM?.isOrganizer, userRole, toast]);

  /**
   * Losowanie drużyn
   */
  const drawTeams = useCallback(async () => {
    if (!eventVM?.canManageSignups) {
      toast.error("Brak uprawnień", { description: "Nie masz uprawnień do losowania drużyn" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/teams/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iterations: 100, balance_threshold: 0.1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się wylosować drużyn");
      }

      await response.json();
      toast.success("Sukces", { description: "Drużyny zostały wylosowane" });

      // TODO: Przejście do widoku drużyn lub odświeżenie danych
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się wylosować drużyn";
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [eventVM?.canManageSignups, eventId, toast]);

  /**
   * Nawigacja wstecz
   */
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  /**
   * Odświeżanie danych
   */
  const refresh = useCallback(async () => {
    await fetchEventDetails(eventId);
  }, [eventId, fetchEventDetails]);

  /**
   * Złożony obiekt akcji
   */
  const actions: EventDetailsActions = {
    signupForEvent,
    resignFromEvent,
    addPlayerToEvent,
    editEvent,
    drawTeams,
    goBack,
    refresh,
  };

  return {
    // Stan
    event: eventVM,
    loading,
    error,
    lastUpdated,
    isSubmitting,

    // Akcje
    actions,
  };
}
