import React from "react";

import type { UserRole } from "../../types";
import { useAuth } from "../../lib/hooks/useAuth";
import { EventDetails } from "./EventDetails";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";

interface EventDetailsPageProps {
  eventId: number;
}

export function EventDetailsPage({ eventId }: EventDetailsPageProps) {
  const { user, isLoading } = useAuth();

  // If loading or no user, AuthenticatedLayout handles the header,
  // but we might want to handle the content area states.
  // Actually AuthenticatedLayout only handles spinner if isLoading=true.
  // If user is null, it renders children with Header showing "Gość".
  // So we should check user here.

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Ładowanie szczegółów wydarzenia...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Zaloguj się, aby zobaczyć szczegóły wydarzenia.</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  const userRole = (user.role ?? "player") as UserRole;
  const playerId = user.player_id ?? undefined;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <EventDetails eventId={eventId} userRole={userRole} userId={user.id} currentPlayerId={playerId} />
      </div>
    </AuthenticatedLayout>
  );
}

