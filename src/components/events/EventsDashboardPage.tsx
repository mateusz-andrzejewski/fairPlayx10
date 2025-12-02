import React from "react";

import type { UserRole } from "../../types";
import { useAuth } from "../../lib/hooks/useAuth";
import { EventsList } from "./EventsList";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";

export function EventsDashboardPage() {
  const { user, isLoading } = useAuth();
  const userRole = (user?.role ?? "player") as UserRole;
  const playerId = user?.player_id ?? undefined;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Wydarzenia FairPlay</h1>
          <p className="mt-2 text-muted-foreground">
            Przeglądaj zaplanowane wydarzenia i zapisuj się na te, które Cię interesują.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Ładowanie danych użytkownika...</p>
          </div>
        ) : (
          <EventsList
            userRole={userRole}
            currentUserId={playerId}
            showBackToDashboard
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
