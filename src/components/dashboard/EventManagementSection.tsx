import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, Plus, Edit } from "lucide-react";
import type { EventDTO } from "../../types";

/**
 * Komponent EventManagementSection - sekcja zarządzania wydarzeniami (admin/organizer).
 */
interface EventManagementSectionProps {
  events: EventDTO[];
}

export function EventManagementSection({ events }: EventManagementSectionProps) {
  const upcomingEvents = events.filter((event) => new Date(event.event_datetime) > new Date());
  const pastEvents = events.filter((event) => new Date(event.event_datetime) <= new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Zarządzanie wydarzeniami
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{events.length}</div>
            <p className="text-sm text-muted-foreground">Wszystkich wydarzeń</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
            <p className="text-sm text-muted-foreground">Nadchodzących</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{pastEvents.length}</div>
            <p className="text-sm text-muted-foreground">Zakończonych</p>
          </div>
        </div>

        {/* Lista nadchodzących wydarzeń */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Nadchodzące wydarzenia</h4>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((event) => {
                const eventDate = new Date(event.event_datetime);
                const formattedDate = eventDate.toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formattedDate} • {event.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.current_signups_count}/{event.max_places} zapisanych
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {event.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => (window.location.href = `/dashboard/events/${event.id}`)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edytuj
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex gap-2 justify-center pt-4">
          <Button onClick={() => (window.location.href = "/dashboard/events")} variant="outline">
            Wszystkie wydarzenia
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard/events/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj wydarzenie
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
