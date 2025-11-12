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
  addPlayerToEvent: (playerId: number) => Promise<boolean>;
  confirmSignup: (signupId: number) => Promise<void>; // Promowanie z listy rezerwowej

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
export function useEventDetails(eventId: number, userRole: UserRole, userId: number, playerId?: number) {
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
    if (!event) {
      return null;
    }

    const isOrganizer = event.organizer_id === userId;
    const userSignup = playerId
      ? event.signups.find((signup) => signup.player_id === playerId && signup.status !== "withdrawn")
      : null;
    const isSignedUp = Boolean(userSignup);
    const canManageSignups = userRole === "admin" || isOrganizer;

    const signupsWithNames: EventSignupWithNameViewModel[] = event.signups.map((signup) => {
      const playerName = signup.player
        ? `${signup.player.first_name} ${signup.player.last_name}`.trim()
        : `Gracz #${signup.player_id}`;

      const position = signup.player?.position;
      const skillRate = canManageSignups ? (signup.player?.skill_rate ?? undefined) : undefined;

      return {
        id: signup.id,
        event_id: signup.event_id,
        player_id: signup.player_id,
        signup_timestamp: signup.signup_timestamp,
        status: signup.status,
        resignation_timestamp: signup.resignation_timestamp,
        playerName,
        position,
        skillRate,
      };
    });

    return {
      ...event,
      isOrganizer,
      isSignedUp,
      canManageSignups,
      signupsWithNames,
    };
  }, [event, userId, playerId, userRole]);

  /**
   * Pobieranie szczegółów wydarzenia z API
   */
  const fetchEventDetails = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/event/${id}`);
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
    if (!event) return;
    if (!playerId) {
      toast.error("Brak powiązanego gracza", {
        description: "Twoje konto nie ma przypisanego profilu gracza. Skontaktuj się z administratorem.",
      });
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
  }, [event, playerId, eventId, fetchEventDetails, toast]);

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
    async (playerId: number): Promise<boolean> => {
      if (!eventVM?.canManageSignups) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do dodawania graczy" });
        return false;
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
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się dodać gracza do wydarzenia";
        toast.error("Błąd", { description: errorMessage });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventVM?.canManageSignups, eventId, fetchEventDetails, toast]
  );

  /**
   * Potwierdzenie zapisu (przeskok z listy rezerwowej na potwierdzonego)
   */
  const confirmSignup = useCallback(
    async (signupId: number) => {
      if (!eventVM?.canManageSignups) {
        toast.error("Brak uprawnień", { description: "Nie masz uprawnień do potwierdzania zapisów" });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/events/${eventId}/signups/${signupId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "confirmed" }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Nie udało się potwierdzić zapisu");
        }

        toast.success("Sukces", { description: "Zapis został potwierdzony" });

        // Odśwież dane
        await fetchEventDetails(eventId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się potwierdzić zapisu";
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
    window.location.href = `/dashboard/events/${eventId}/edit`;
  }, [eventVM?.isOrganizer, userRole, eventId]);

  /**
   * Losowanie drużyn
   */
  const drawTeams = useCallback(async () => {
    if (!eventVM?.canManageSignups) {
      toast.error("Brak uprawnień", { description: "Nie masz uprawnień do losowania drużyn" });
      return;
    }

    // Przekieruj bezpośrednio na stronę losowania drużyn
    // Tam użytkownik kliknie przycisk "Losuj" aby wygenerować składy
    window.location.href = `/dashboard/events/${eventId}/draw`;
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
    confirmSignup,
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
