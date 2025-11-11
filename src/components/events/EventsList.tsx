import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "./EventCard";
import { EventFilters } from "./EventFilters";
import { useEventsList } from "../../lib/hooks/useEventsList";
import type { UserRole, EventFiltersViewModel } from "../../types";

interface EventsListProps {
  userRole: UserRole;
  currentUserId?: number;
  onEventClick?: (eventId: number) => void;
  initialFilters?: Partial<EventFiltersViewModel>;
  showBackToDashboard?: boolean;
}

/**
 * Główny komponent odpowiedzialny za wyświetlanie paginowanej listy wydarzeń
 * z możliwością filtrowania, wyszukiwania i obsługi akcji użytkownika.
 */
export function EventsList({
  userRole,
  currentUserId,
  onEventClick,
  initialFilters,
  showBackToDashboard = false,
}: EventsListProps) {
  // Hook zarządzania listą wydarzeń
  const { events, pagination, loading, error, filters, actions } = useEventsList(userRole, currentUserId);

  // Lista dostępnych lokalizacji (w przyszłości może pochodzić z API)
  const availableLocations = useMemo(
    () => [
      { value: "Stadion Miejski", label: "Stadion Miejski" },
      { value: "Hala Sportowa", label: "Hala Sportowa" },
      { value: "Boisko Szkoły", label: "Boisko Szkoły" },
      { value: "Park Centralny", label: "Park Centralny" },
      { value: "Centrum Sportowe", label: "Centrum Sportowe" },
    ],
    []
  );

  /**
   * Obsługa nawigacji do szczegółów wydarzenia
   */
  const handleEventClick = (eventId: number) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
    // Domyślne zachowanie - nawigacja przez URL
    // W Astro/React używamy routera zamiast window.location
    window.history.pushState({}, "", `/dashboard/events/${eventId}`);
  };

  /**
   * Obsługa zapisu na wydarzenie
   */
  const handleSignup = async (eventId: number) => {
    await actions.signupForEvent(eventId);
  };

  /**
   * Reset filtrów
   */
  const handleResetFilters = () => {
    actions.clearFilters();
  };

  /**
   * Komponent paginacji
   */
  const PaginationControls = () => {
    const { page, total_pages, total, limit } = pagination;

    if (total === 0) return null;

    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(total_pages, page + 2);

    return (
      <div className="flex items-center justify-between px-2 py-4">
        {/* Informacje o wynikach */}
        <div className="text-sm text-muted-foreground">
          Pokazuje {Math.min((page - 1) * limit + 1, total)} do {Math.min(page * limit, total)} z {total} wydarzeń
        </div>

        {/* Kontrolki paginacji */}
        <div className="flex items-center gap-2">
          {/* Poprzednia strona */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.goToPage(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Poprzednia strona"
          >
            <ChevronLeft className="h-4 w-4" />
            Poprzednia
          </Button>

          {/* Numery stron */}
          <div className="flex items-center gap-1">
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => actions.goToPage(pageNum)}
                disabled={loading}
                className="w-10"
                aria-current={pageNum === page ? "page" : undefined}
              >
                {pageNum}
              </Button>
            ))}
          </div>

          {/* Następna strona */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.goToPage(page + 1)}
            disabled={page >= total_pages || loading}
            aria-label="Następna strona"
          >
            Następna
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Rozmiar strony */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Na stronę:</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => actions.changePageSize(parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Przycisk powrotu do dashboard */}
      {showBackToDashboard && (
        <div className="mb-4">
          <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Powrót do dashboard
          </Button>
        </div>
      )}

      {/* Filtry */}
      <EventFilters
        filters={filters}
        availableLocations={availableLocations}
        onFiltersChange={actions.setFilters}
        onReset={handleResetFilters}
        isLoading={loading}
      />

      {/* Komunikaty błędów */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stan ładowania */}
      {loading && events.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Ładowanie wydarzeń...</p>
          </div>
        </div>
      )}

      {/* Lista wydarzeń */}
      {!loading || events.length > 0 ? (
        <>
          {events.length > 0 ? (
            <>
              {/* Siatka kart wydarzeń */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userRole={userRole}
                    onSignup={handleSignup}
                    onNavigate={handleEventClick}
                  />
                ))}
              </div>

              {/* Paginacja */}
              <PaginationControls />
            </>
          ) : (
            /* Brak wyników */
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="text-6xl">🏆</div>
                <h3 className="text-lg font-medium">Brak wydarzeń</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {filters.search || filters.location || filters.date_from || filters.date_to
                    ? "Nie znaleziono wydarzeń spełniających kryteria wyszukiwania. Spróbuj zmienić filtry."
                    : "Aktualnie nie ma zaplanowanych wydarzeń. Sprawdź ponownie później."}
                </p>
                {(filters.search || filters.location || filters.date_from || filters.date_to) && (
                  <Button variant="outline" onClick={handleResetFilters} disabled={loading}>
                    Wyczyść filtry
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Loading overlay dla kolejnych stron */}
      {loading && events.length > 0 && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Ładowanie kolejnych wydarzeń...</p>
          </div>
        </div>
      )}
    </div>
  );
}
