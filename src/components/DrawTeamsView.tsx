"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useDrawTeams } from "@/lib/hooks/useDrawTeams";
import { useAuth } from "@/lib/hooks/useAuth";
import { TeamStats } from "./TeamStats";
import { DrawButton } from "./DrawButton";
import { DragDropTeams } from "./DragDropTeams";
import type { EventDTO } from "@/types";

interface DrawTeamsViewProps {
  eventId: number;
}

/**
 * Główny komponent widoku losowania drużyn dla wydarzenia.
 * Koordynuje wszystkie podkomponenty i integruje się z hookiem useDrawTeams.
 */
export function DrawTeamsView({ eventId }: DrawTeamsViewProps) {
  // Hooki
  const { user } = useAuth();
  const { state, actions } = useDrawTeams(eventId, user?.role || "player");

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
  const canManageDraw = user?.role === "admin" || user?.role === "organizer";

  // Obsługa błędów walidacji eventId
  if (!eventId || isNaN(eventId)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>Nieprawidłowy identyfikator wydarzenia.</AlertDescription>
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
          <AlertDescription>{eventError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ładowanie
  if (eventLoading || state.isLoading) {
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

          {/* Statystyki drużyn - skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>

          {/* Przycisk losowania - skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Obszar drag-and-drop - skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-6 w-16" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="border rounded p-2">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
          <AlertDescription>Wydarzenie nie zostało znalezione.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Brak uprawnień
  if (!canManageDraw) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Brak uprawnień do zarządzania losowaniem drużyn. Wymagana rola organizatora lub administratora.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Nagłówek */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
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
              {event.optional_fee && <span>Wpisowe: {event.optional_fee} zł</span>}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Statystyki drużyn */}
      <section className="mb-8" aria-labelledby="teams-stats-heading">
        <h2 id="teams-stats-heading" className="text-lg font-semibold mb-4">
          Statystyki drużyn
        </h2>
        <TeamStats teams={state.teams} userRole={user?.role || "player"} />
      </section>

      {/* Przycisk losowania */}
      <section className="mb-8 flex justify-center" aria-labelledby="draw-button-heading">
        <div className="w-full max-w-md">
          <h2 id="draw-button-heading" className="sr-only">
            Losowanie drużyn
          </h2>
          <DrawButton
            onDraw={actions.runDraw}
            isLoading={state.isLoading}
            disabled={event.current_signups_count < 4}
            minPlayersRequired={4}
            currentPlayersCount={event.current_signups_count}
          />
        </div>
      </section>

      {/* Obszar drag-and-drop */}
      <section className="mb-8" aria-labelledby="drag-drop-heading">
        <h2 id="drag-drop-heading" className="text-lg font-semibold mb-4">
          Ręczne przypisywanie graczy
          {!state.balanceAchieved && (
            <span className="ml-2 text-sm text-muted-foreground">(Różnica średniego skill rate przekracza 7%)</span>
          )}
        </h2>
        <DragDropTeams
          teams={state.teams}
          onAssignTeams={actions.assignTeams}
          userRole={user?.role || "player"}
          balanceAchieved={state.balanceAchieved}
        />
      </section>

      {/* Obsługa błędów */}
      {state.error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
