import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import type { EventDTO } from "../../types";

/**
 * Komponent WelcomeSection - wyświetla najbliższe wydarzenie z przyciskami akcji.
 */
interface WelcomeSectionProps {
  nearestEvent: EventDTO | null;
}

export function WelcomeSection({ nearestEvent }: WelcomeSectionProps) {
  if (!nearestEvent) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Witaj w FairPlay!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Obecnie nie ma zaplanowanych wydarzeń. Sprawdź później!
          </p>
        </CardContent>
      </Card>
    );
  }

  const eventDate = new Date(nearestEvent.event_datetime);
  const formattedDate = eventDate.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl">Najbliższe wydarzenie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{nearestEvent.name}</h3>
          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{nearestEvent.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {nearestEvent.current_signups_count}/{nearestEvent.max_places} zapisanych
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => window.location.href = `/dashboard/events/${nearestEvent.id}`}
          >
            Zobacz szczegóły
          </Button>
          {nearestEvent.optional_fee && (
            <div className="text-sm text-muted-foreground self-center">
              Koszt: {nearestEvent.optional_fee} zł
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
