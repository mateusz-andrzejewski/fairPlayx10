import React from "react";

import type { UserRole } from "../../types";
import { useAuth } from "../../lib/hooks/useAuth";
import { EventDetails } from "./EventDetails";

interface EventDetailsPageProps {
  eventId: number;
}

export function EventDetailsPage({ eventId }: EventDetailsPageProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Ładowanie szczegółów wydarzenia...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Zaloguj się, aby zobaczyć szczegóły wydarzenia.</p>
      </div>
    );
  }

  const userRole = (user.role ?? "player") as UserRole;
  const playerId = user.player_id ?? undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EventDetails eventId={eventId} userRole={userRole} userId={user.id} currentPlayerId={playerId} />
      </div>
    </div>
  );
}


