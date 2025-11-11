"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, UserPlusIcon, AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { EventSignupsList } from "./EventSignupsList";
import { AddPlayerModal } from "./AddPlayerModal";
import { ConfirmModal } from "./ConfirmModal";
import { useEventSignups } from "@/lib/hooks/useEventSignups";
import { useAuth } from "@/lib/hooks/useAuth";
import type { EventDTO } from "@/types";

interface EventSignupsViewProps {
  eventId: number;
}

/**
 * Główny komponent widoku zarządzania zapisami na wydarzenie.
 * Koordynuje wszystkie podkomponenty i integruje się z hookiem useEventSignups.
 */
export function EventSignupsView({ eventId }: EventSignupsViewProps) {

  // Hooki
  const { user } = useAuth();
  const {
    state,
    actions,
    isSubmitting,
    loadingPlayers,
    availablePlayers,
  } = useEventSignups(eventId, user?.role || "player");

  // Stan lokalny dla informacji o wydarzeniu
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // Pobieranie informacji o wydarzeniu
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true);
        setEventError(null);

        // TODO: Zastąpić rzeczywistym API call gdy endpoint będzie dostępny
        // Na razie mockup - w rzeczywistości trzeba będzie stworzyć endpoint GET /api/events/{eventId}
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać informacji o wydarzeniu");
        }

        const eventData: EventDTO = await response.json();
        setEvent(eventData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd";
        setEventError(errorMessage);
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Sprawdzanie uprawnień
  const canManageSignups = user?.role === "admin" || user?.role === "organizer";
  const isOrganizer = user?.role === "organizer" && event?.organizer_id === user.id;

  // Obsługa błędów walidacji eventId
  if (!eventId || isNaN(eventId)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Nieprawidłowy identyfikator wydarzenia.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Obsługa błędów ładowania wydarzenia
  if (eventError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {eventError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ładowanie
  if (eventLoading || state.loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Nagłówek - skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Lista - skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-1">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-7 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Brak wydarzenia
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Wydarzenie nie zostało znalezione.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Nagłówek */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Powrót
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-2 truncate">{event.name}</h1>
            <p className="text-muted-foreground truncate">{event.location}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span>
                {event.current_signups_count} / {event.max_places} zapisanych
              </span>
              {event.optional_fee && (
                <span>Wpisowe: {event.optional_fee} zł</span>
              )}
            </div>
          </div>

          {/* Przycisk dodawania gracza - tylko dla organizatora/admina */}
          {canManageSignups && (
            <div className="flex-shrink-0">
              <Button
                onClick={actions.openAddPlayerModal}
                disabled={loadingPlayers}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <UserPlusIcon className="w-4 h-4" />
                Dodaj gracza
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Lista zapisów */}
      <EventSignupsList
        signups={state.signups}
        pagination={state.pagination}
        userRole={user?.role || "player"}
        loading={state.loading}
        onAction={actions.handleSignupAction}
        onPageChange={actions.changePage}
      />

      {/* Modals */}
      <AddPlayerModal
        isOpen={state.modals.addPlayerOpen}
        onClose={actions.closeAddPlayerModal}
        onSubmit={actions.addPlayerToEvent}
        availablePlayers={availablePlayers}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={state.modals.confirmOpen}
        actionData={state.modals.confirmData}
        onConfirm={actions.confirmAction}
        onCancel={actions.closeConfirmModal}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
