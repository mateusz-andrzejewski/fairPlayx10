import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Euro,
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
import type { UserRole } from "../../types";

interface EventDetailsProps {
  eventId: number;
  userRole: UserRole;
  currentUserId?: number;
}

/**
 * Komponent wyświetlający pełne szczegóły pojedynczego wydarzenia wraz z listą zapisanych uczestników.
 * Centralny punkt dla interakcji z konkretnym wydarzeniem.
 */
export function EventDetails({ eventId, userRole, currentUserId }: EventDetailsProps) {
  // Hook zarządzania szczegółami wydarzenia
  const { event, loading, error, isSubmitting, actions } = useEventDetails(eventId, userRole, currentUserId);

  // Stan lokalny dla modalnych akcji
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);

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
                  <Euro className="h-3 w-3" />
                  {event.optional_fee}
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
              <Button onClick={() => setShowAddPlayerDialog(true)} className="gap-2" disabled={isSubmitting}>
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
            <div className="space-y-3">
              {event.signupsWithNames.map((signup) => (
                <div key={signup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {signup.playerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{signup.playerName}</p>
                      {signup.position && <p className="text-sm text-muted-foreground">{signup.position}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        signup.status === "confirmed"
                          ? "default"
                          : signup.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {signup.status === "confirmed"
                        ? "Potwierdzony"
                        : signup.status === "pending"
                          ? "Oczekujący"
                          : "Anulowany"}
                    </Badge>

                    {/* Przyciski akcji dla organizatora/admina */}
                    {event.canManageSignups && signup.status === "confirmed" && (
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
          )}
        </CardContent>
      </Card>

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
                      const userSignup = event.signupsWithNames.find((s) => s.player_id === currentUserId);
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

      {/* Modal dodawania gracza - TODO: Implementacja w następnym kroku */}
      {showAddPlayerDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Dodaj gracza do wydarzenia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Funkcja dodawania graczy zostanie zaimplementowana wkrótce.
              </p>
            </CardContent>
            <div className="flex gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowAddPlayerDialog(false)} className="flex-1">
                Anuluj
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
