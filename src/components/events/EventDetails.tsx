import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Banknote,
  UserPlus,
  Edit,
  Shuffle,
  UserMinus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEventDetails } from "../../lib/hooks/useEventDetails";
import { AddPlayerModal } from "../event-signups/AddPlayerModal";
import { TeamAssignmentsView } from "./TeamAssignmentsView";
import type { AvailablePlayerDTO, AddPlayerFormData } from "@/types/eventSignupsView";
import type { PlayersListResponseDTO } from "../../types";
import type { UserRole } from "../../types";
import { toast } from "sonner";

interface EventDetailsProps {
  eventId: number;
  userRole: UserRole;
  userId: number;
  currentPlayerId?: number;
}

/**
 * Komponent wyświetlający pełne szczegóły pojedynczego wydarzenia wraz z listą zapisanych uczestników.
 * Centralny punkt dla interakcji z konkretnym wydarzeniem.
 */
export function EventDetails({ eventId, userRole, userId, currentPlayerId }: EventDetailsProps) {
  // Hook zarządzania szczegółami wydarzenia
  const { event, loading, error, isSubmitting, actions } = useEventDetails(eventId, userRole, userId, currentPlayerId);

  // Stan lokalny dla modalnych akcji
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayerDTO[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // Hooks muszą być wywołane przed warunkowymi return - Rules of Hooks
  // Temporarily commented out to debug hooks issue
  // const signedPlayerIds = useMemo(() => {
  //   if (!event?.signupsWithNames) {
  //     return new Set<number>();
  //   }
  //   const ids = new Set<number>();
  //   event.signupsWithNames.forEach((signup) => {
  //     if (typeof signup.player_id === "number") {
  //       ids.add(signup.player_id);
  //     }
  //   }
  //   return ids;
  // }, [event?.signupsWithNames]);

  useEffect(() => {
    if (!isAddPlayerDialogOpen) {
      return;
    }

    let cancelled = false;

    const loadPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const response = await fetch("/api/players?page=1&limit=100");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: PlayersListResponseDTO = await response.json();
        if (cancelled) {
          return;
        }

        const signedPlayerIds = new Set<number>();
        if (event?.signupsWithNames) {
          event.signupsWithNames.forEach((signup) => {
            if (typeof signup.player_id === "number") {
              signedPlayerIds.add(signup.player_id);
            }
          });
        }

        const filtered: AvailablePlayerDTO[] =
          data.data
            ?.filter((player) => !signedPlayerIds.has(player.id))
            .map((player) => ({
              id: player.id,
              first_name: player.first_name,
              last_name: player.last_name,
              position: player.position,
            })) ?? [];

        setAvailablePlayers(filtered);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Nie udało się pobrać listy dostępnych graczy";
          toast.error("Błąd podczas pobierania graczy", { description: message });
          setAvailablePlayers([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPlayers(false);
        }
      }
    };

    loadPlayers();

    return () => {
      cancelled = true;
    };
  }, [isAddPlayerDialogOpen, event?.signupsWithNames]);

  useEffect(() => {
    if (!isAddPlayerDialogOpen) {
      setAvailablePlayers([]);
    }
  }, [isAddPlayerDialogOpen]);

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Ładowanie szczegółów wydarzenia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Wydarzenie nie zostało znalezione.</AlertDescription>
      </Alert>
    );
  }

  const handleOpenAddPlayerDialog = () => {
    setIsAddPlayerDialogOpen(true);
  };

  const handleCloseAddPlayerDialog = () => {
    if (!isSubmitting) {
      setIsAddPlayerDialogOpen(false);
    }
  };

  const handleAddPlayerSubmit = async (form: AddPlayerFormData) => {
    const success = await actions.addPlayersToEvent(form.playerIds);
    if (success) {
      setIsAddPlayerDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Przycisk powrotu */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={actions.goBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Powrót do listy
        </Button>
      </div>

      {/* Nagłówek wydarzenia */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.event_datetime).toLocaleDateString("pl-PL")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(event.event_datetime).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {event.optional_fee && (
                <Badge variant="outline" className="gap-1">
                  <Banknote className="h-3 w-3" />
                  {event.optional_fee} zł
                </Badge>
              )}
              <Badge variant={event.status === "active" ? "default" : "secondary"}>
                {event.status === "active" ? "Aktywne" : "Nieaktywne"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Statystyki miejsc */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Miejsca</h4>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {event.current_signups_count}/{event.max_places}
                </span>
                <span className="text-sm text-muted-foreground">zapisanych</span>
              </div>
              {event.current_signups_count >= event.max_places && (
                <Badge variant="destructive" className="text-xs">
                  Brak miejsc
                </Badge>
              )}
            </div>

            {/* Status użytkownika */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Twój status</h4>
              <Badge variant={event.isSignedUp ? "default" : "secondary"}>
                {event.isSignedUp ? "Zapisany" : "Niezapisany"}
              </Badge>
            </div>

            {/* Informacje organizatora */}
            {event.isOrganizer && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Organizator</h4>
                <Badge variant="outline">Jesteś organizatorem</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista zapisów */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista uczestników</CardTitle>
            {event.canManageSignups && (
              <Button onClick={handleOpenAddPlayerDialog} className="gap-2" disabled={isSubmitting}>
                <UserPlus className="h-4 w-4" />
                Dodaj gracza
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {event.signupsWithNames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak zapisanych uczestników</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Potwierdzeni gracze */}
              {event.signupsWithNames.filter((s) => s.status === "confirmed").length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Potwierdzeni gracze ({event.signupsWithNames.filter((s) => s.status === "confirmed").length})
                  </h4>
                  <div className="space-y-3">
                    {event.signupsWithNames
                      .filter((s) => s.status === "confirmed")
                      .map((signup) => (
                        <div key={signup.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {signup.playerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{signup.playerName}</p>
                              {signup.position && (
                                <p className="text-sm text-muted-foreground capitalize">{signup.position}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {typeof signup.skillRate === "number" && (
                              <Badge variant="outline" className="text-xs">
                                Skill {signup.skillRate}
                              </Badge>
                            )}

                            {event.canManageSignups && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => actions.resignFromEvent(signup.id)}
                                disabled={isSubmitting}
                                className="text-destructive hover:text-destructive"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Lista rezerwowa */}
              {event.signupsWithNames.filter((s) => s.status === "pending").length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Lista rezerwowa ({event.signupsWithNames.filter((s) => s.status === "pending").length})
                  </h4>
                  <div className="space-y-3">
                    {event.signupsWithNames
                      .filter((s) => s.status === "pending")
                      .map((signup) => (
                        <div
                          key={signup.id}
                          className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-muted-foreground">
                                {signup.playerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">{signup.playerName}</p>
                              {signup.position && (
                                <p className="text-xs text-muted-foreground capitalize">{signup.position}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {typeof signup.skillRate === "number" && (
                              <Badge variant="outline" className="text-xs">
                                Skill {signup.skillRate}
                              </Badge>
                            )}

                            {event.canManageSignups && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => actions.confirmSignup(signup.id)}
                                disabled={isSubmitting}
                                className="text-xs px-3"
                              >
                                Potwierdź
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Składy drużyn - widoczne tylko gdy teams_drawn_at jest ustawione */}
      {event.teams_drawn_at && (
        <Card>
          <CardContent className="pt-6">
            <TeamAssignmentsView eventId={eventId} userRole={userRole} currentPlayerId={currentPlayerId} />
          </CardContent>
        </Card>
      )}

      {/* Sekcja akcji */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Akcje</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Akcje dla graczy */}
            {!event.isOrganizer && (
              <>
                {event.isSignedUp ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const userSignup = event.signupsWithNames.find((s) => s.player_id === currentPlayerId);
                      if (userSignup) {
                        actions.resignFromEvent(userSignup.id);
                      }
                    }}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <UserMinus className="h-4 w-4" />
                    Zrezygnuj z udziału
                  </Button>
                ) : (
                  <Button
                    onClick={actions.signupForEvent}
                    disabled={
                      isSubmitting || event.current_signups_count >= event.max_places || event.status !== "active"
                    }
                    className="gap-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Zapisz się
                  </Button>
                )}
              </>
            )}

            {/* Akcje dla organizatora/admina */}
            {event.canManageSignups && (
              <>
                <Separator orientation="vertical" className="h-8" />

                <Button variant="outline" onClick={actions.editEvent} disabled={isSubmitting} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edytuj wydarzenie
                </Button>

                <Button
                  variant="outline"
                  onClick={actions.drawTeams}
                  disabled={isSubmitting || event.signupsWithNames.filter((s) => s.status === "confirmed").length < 2}
                  className="gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Losuj drużyny
                </Button>
              </>
            )}
          </div>

          {/* Informacje o ograniczeniach */}
          {event.current_signups_count >= event.max_places && !event.isSignedUp && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Wszystkie miejsca są już zajęte. Nie można się zapisać na to wydarzenie.
              </AlertDescription>
            </Alert>
          )}

          {event.status !== "active" && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>To wydarzenie nie jest aktywne. Zapisy są niedostępne.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <AddPlayerModal
        isOpen={isAddPlayerDialogOpen}
        onClose={handleCloseAddPlayerDialog}
        onSubmit={handleAddPlayerSubmit}
        availablePlayers={availablePlayers}
        isSubmitting={isSubmitting}
        isLoading={isLoadingPlayers}
      />
    </div>
  );
}
