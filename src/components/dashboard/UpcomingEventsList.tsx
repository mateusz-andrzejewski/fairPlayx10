import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { EventCard } from "../events/EventCard";
import type { EventDTO, EventCardViewModel } from "../../types";

/**
 * Komponent UpcomingEventsList - lista kart wydarzeń z paginacją.
 */
interface UpcomingEventsListProps {
  events: EventDTO[];
  onLoadMore?: () => void;
}

export function UpcomingEventsList({ events, onLoadMore }: UpcomingEventsListProps) {
  // Transform EventDTO na EventCardViewModel
  const transformToCardViewModel = (event: EventDTO): EventCardViewModel => {
    const eventDate = new Date(event.event_datetime);
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...event,
      isFull: event.current_signups_count >= event.max_places,
      canSignup: event.current_signups_count < event.max_places && event.status === 'open_for_signups',
      daysUntilEvent,
      formattedDate: eventDate.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      formattedTime: eventDate.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const handleNavigate = (eventId: number) => {
    window.location.href = `/dashboard/events/${eventId}`;
  };

  const handleSignup = async (eventId: number) => {
    // TODO: Implement signup logic
    console.log('Signup for event:', eventId);
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nadchodzące wydarzenia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Brak nadchodzących wydarzeń.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nadchodzące wydarzenia</h2>
        {onLoadMore && (
          <Button variant="outline" onClick={onLoadMore}>
            Załaduj więcej
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={transformToCardViewModel(event)}
            userRole="player" // TODO: Pass actual user role
            onNavigate={handleNavigate}
            onSignup={handleSignup}
          />
        ))}
      </div>
    </div>
  );
}
