"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, AlertCircleIcon, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDrawTeams } from "@/lib/hooks/useDrawTeams";
import { useAuth } from "@/lib/hooks/useAuth";
import { TeamStats } from "./TeamStats";
import { DrawButton } from "./DrawButton";
import { DragDropTeams } from "./DragDropTeams";
import type { EventDTO } from "@/types";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout";

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
  const { state, actions, hasUnsavedChanges, isConfirmed } = useDrawTeams(eventId, user?.role || "player");

  // Stan lokalny dla informacji o wydarzeniu
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // Stan lokalny dla liczby drużyn (inicjalizowany z preferred_team_count wydarzenia)
  const [teamCount, setTeamCount] = useState<number>(2);

  // Pobieranie informacji o wydarzeniu
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true);
        setEventError(null);

        // TODO: Zastąpić rzeczywistym API call gdy endpoint będzie dostępny
        // Na razie mockup - w rzeczywistości trzeba będzie stworzyć endpoint GET /api/event/{eventId}
        const response = await fetch(`/api/event/${eventId}`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać informacji o wydarzeniu");
        }

        const eventData: EventDTO = await response.json();
        setEvent(eventData);
        // Inicjalizuj licznik drużyn z preferred_team_count wydarzenia
        if (eventData.preferred_team_count) {
          setTeamCount(eventData.preferred_team_count);
        }
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
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Nieprawidłowy identyfikator wydarzenia.</AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Obsługa błędów ładowania wydarzenia
  if (eventError) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Powrót
            </Button>
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{eventError}</AlertDescription>
            </Alert>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Ładowanie
  if (eventLoading || state.isLoading) {
    return (
      <AuthenticatedLayout>
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
      </AuthenticatedLayout>
    );
  }

  // Brak wydarzenia
  if (!event) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Wydarzenie nie zostało znalezione.</AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Brak uprawnień
  if (!canManageDraw) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Brak uprawnień do zarządzania losowaniem drużyn. Wymagana rola organizatora lub administratora.
            </AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
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

        {/* Przyciski akcji */}
        <section className="mb-8" aria-labelledby="draw-actions-heading">
          <h2 id="draw-actions-heading" className="sr-only">
            Akcje losowania drużyn
          </h2>

          {/* Kontrolka liczby drużyn */}
          <div className="max-w-xs mx-auto mb-6">
            <Label htmlFor="team-count" className="text-sm font-medium flex items-center gap-2 mb-2">
              <UsersRound className="h-4 w-4" />
              Liczba drużyn do wylosowania
            </Label>
            <Input
              id="team-count"
              type="number"
              min="2"
              max="10"
              value={teamCount}
              onChange={(e) => setTeamCount(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
              disabled={state.isLoading || isConfirmed}
              className="text-center"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wartość 2-10. Domyślnie: {event.preferred_team_count || 2}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            {/* Przycisk losowania */}
            <DrawButton
              onDraw={() => actions.runDraw(teamCount)}
              isLoading={state.isLoading}
              disabled={event.current_signups_count < 4 || isConfirmed}
              minPlayersRequired={4}
              currentPlayersCount={event.current_signups_count}
            />

            {/* Przycisk potwierdzenia składów */}
            {hasUnsavedChanges && state.teams.length > 0 && !isConfirmed && (
              <Button
                onClick={actions.confirmTeams}
                disabled={state.isLoading}
                size="lg"
                variant="default"
                className="flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Potwierdź składy
              </Button>
            )}

            {/* Status zatwierdzenia */}
            {isConfirmed && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Składy zatwierdzone</span>
              </div>
            )}
          </div>

          {/* Ostrzeżenie o niezapisanych zmianach */}
          {hasUnsavedChanges && !isConfirmed && state.teams.length > 0 && (
            <Alert className="mt-4 max-w-2xl mx-auto">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Wylosowane składy nie zostały jeszcze zapisane. Kliknij &quot;Potwierdź składy&quot; aby zapisać i
                wysłać powiadomienia do graczy.
              </AlertDescription>
            </Alert>
          )}
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
    </AuthenticatedLayout>
  );
}
