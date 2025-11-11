import React from "react";
import { Calendar, Clock, MapPin, Users, Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EventCardViewModel, UserRole } from "../../types";

interface EventCardProps {
  event: EventCardViewModel;
  userRole: UserRole;
  onSignup?: (eventId: number) => Promise<void>;
  onNavigate: (eventId: number) => void;
}

/**
 * Komponent karty pojedynczego wydarzenia wyświetlający kluczowe informacje
 * w kompaktowej formie. Obsługuje nawigację do szczegółów i szybki zapis.
 */
export function EventCard({ event, userRole, onSignup, onNavigate }: EventCardProps) {
  const handleCardClick = () => {
    onNavigate(event.id);
  };

  const handleSignupClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Zapobiegaj wywołaniu onNavigate
    if (onSignup) {
      await onSignup(event.id);
    }
  };

  const getSignupButtonText = () => {
    if (event.isFull) return "Brak miejsc";
    if (!event.canSignup) return "Niedostępne";
    return "Zapisz się";
  };

  const getSignupButtonVariant = () => {
    if (event.isFull || !event.canSignup) return "secondary" as const;
    return "default" as const;
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">{event.name}</CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          {event.optional_fee && (
            <Badge variant="outline" className="shrink-0 ml-2">
              <Euro className="h-3 w-3 mr-1" />
              {event.optional_fee}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Data i czas */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{event.formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{event.formattedTime}</span>
            </div>
          </div>

          {/* Statystyki miejsc */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {event.current_signups_count}/{event.max_places}
              </span>
              <span className="text-muted-foreground">zapisanych</span>
            </div>

            {event.daysUntilEvent > 0 && (
              <Badge variant="secondary" className="text-xs">
                {event.daysUntilEvent === 1 ? "Jutro" : `Za ${event.daysUntilEvent} dni`}
              </Badge>
            )}
          </div>

          {/* Przycisk akcji */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCardClick}>
              Szczegóły
            </Button>

            {(userRole === "player" || userRole === "organizer") && onSignup && (
              <Button
                variant={getSignupButtonVariant()}
                size="sm"
                className="flex-1"
                onClick={handleSignupClick}
                disabled={event.isFull || !event.canSignup}
              >
                {getSignupButtonText()}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
