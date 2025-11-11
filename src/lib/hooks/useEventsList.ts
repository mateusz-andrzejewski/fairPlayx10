import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type {
  EventCardViewModel,
  EventDTO,
  PaginationMetaDTO,
  EventFiltersViewModel,
  UserRole,
  EventsListResponseDTO,
} from "../../types";

/**
 * Akcje dostępne w hooku zarządzania listą wydarzeń
 */
interface EventsListActions {
  // Filtrowanie i wyszukiwanie
  setFilters: (filters: Partial<EventFiltersViewModel>) => void;
  clearFilters: () => void;

  // Zapis na wydarzenie
  signupForEvent: (eventId: number) => Promise<void>;

  // Paginacja
  goToPage: (page: number) => void;
  changePageSize: (limit: number) => void;
}

/**
 * Główny hook do zarządzania stanem listy wydarzeń.
 * Integruje API calls, zarządzanie stanem i logikę biznesową dla listy wydarzeń.
 */
export function useEventsList(userRole: UserRole, currentUserId?: number) {
  // Stan podstawowy
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMetaDTO>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stan filtrów
  const [filters, setFilters] = useState<EventFiltersViewModel>({
    page: 1,
    limit: 20,
  });

  // Stan operacji
  const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);

  /**
   * Transformacja surowych danych wydarzeń na ViewModel dla kart
   */
  const eventsVM: EventCardViewModel[] = useMemo(() => {
    const now = new Date();

    return events.map((event) => {
      const eventDate = new Date(event.event_datetime);
      const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isFull = event.current_signups_count >= event.max_places;
      const isActive = event.status === "active";
      const isInFuture = eventDate > now;
      const canSignup = isActive && isInFuture && !isFull;

      return {
        ...event,
        isFull,
        canSignup,
        daysUntilEvent: Math.max(0, daysUntilEvent),
        formattedDate: eventDate.toLocaleDateString("pl-PL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        formattedTime: eventDate.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  }, [events]);

  /**
   * Pobieranie listy wydarzeń z API
   */
  const fetchEvents = useCallback(
    async (eventFilters: EventFiltersViewModel) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: eventFilters.page?.toString() || "1",
          limit: eventFilters.limit?.toString() || "20",
          ...(eventFilters.status && { status: eventFilters.status }),
          ...(eventFilters.location && { location: eventFilters.location }),
          ...(eventFilters.date_from && { date_from: eventFilters.date_from }),
          ...(eventFilters.date_to && { date_to: eventFilters.date_to }),
          ...(eventFilters.organizer_id && { organizer_id: eventFilters.organizer_id.toString() }),
          ...(eventFilters.search && { search: eventFilters.search }),
        });

        const response = await fetch(`/api/events?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: EventsListResponseDTO = await response.json();
        setEvents(data.data);
        setPagination(data.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać listy wydarzeń";
        setError(errorMessage);
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  /**
   * Efekt ładowania danych przy zmianie filtrów
   */
  useEffect(() => {
    fetchEvents(filters);
  }, [filters, fetchEvents]);

  /**
   * Akcje zarządzania filtrami
   */
  const setFiltersAction = useCallback((newFilters: Partial<EventFiltersViewModel>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset do pierwszej strony przy zmianie filtrów
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
    });
  }, []);

  /**
   * Zapis na wydarzenie
   */
  const signupForEvent = useCallback(
    async (eventId: number) => {
      setIsSubmittingSignup(true);
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

        // Odśwież listę wydarzeń
        await fetchEvents(filters);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać na wydarzenie";
        toast.error("Błąd", { description: errorMessage });
      } finally {
        setIsSubmittingSignup(false);
      }
    },
    [currentUserId, filters, fetchEvents, toast]
  );

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
  const actions: EventsListActions = {
    setFilters: setFiltersAction,
    clearFilters,
    signupForEvent,
    goToPage,
    changePageSize,
  };

  return {
    // Stan
    events: eventsVM,
    pagination,
    loading,
    error,
    filters,
    isSubmittingSignup,

    // Akcje
    actions,
  };
}
