import React from "react";

import type { UserRole } from "../../types";
import { useAuth } from "../../lib/hooks/useAuth";
import { EventsList } from "./EventsList";

export function EventsDashboardPage() {
  const { user, isLoading } = useAuth();
  const userRole = (user?.role ?? "player") as UserRole;
  const playerId = user?.player_id ?? undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Ładowanie wydarzeń...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Wydarzenia FairPlay</h1>
          <p className="mt-2 text-muted-foreground">
            Przeglądaj zaplanowane wydarzenia i zapisuj się na te, które Cię interesują.
          </p>
        </div>

        <EventsList userRole={userRole} currentUserId={playerId} showBackToDashboard />
      </div>
    </div>
  );
}
