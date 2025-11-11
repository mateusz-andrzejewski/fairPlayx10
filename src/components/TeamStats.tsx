"use client";

import React from "react";
import { UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeamViewModel, UserRole } from "@/types";

interface TeamStatsProps {
  teams: TeamViewModel[];
  userRole: UserRole;
}

/**
 * Komponent prezentacyjny wyświetlający statystyki drużyn.
 * Pokazuje średni skill rate oraz rozkład pozycji dla każdej drużyny.
 */
export function TeamStats({ teams, userRole }: TeamStatsProps) {
  // Czy użytkownik może zobaczyć skill rate (tylko admin)
  const canViewSkillRate = userRole === "admin";

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Brak drużyn do wyświetlenia. Uruchom losowanie aby utworzyć drużyny.</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      role="list"
      aria-label="Statystyki drużyn"
    >
      {teams.map((team) => (
        <Card key={team.teamNumber} className="relative" role="listitem">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UsersIcon className="w-5 h-5" aria-hidden="true" />
              Drużyna {team.teamNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Średni skill rate */}
            {canViewSkillRate && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-sm font-medium">Średni skill rate:</span>
                <Badge variant="secondary" className="font-mono self-start sm:self-auto">
                  {team.avgSkillRate.toFixed(1)}
                </Badge>
              </div>
            )}

            {/* Rozkład pozycji */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Rozkład pozycji:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(team.positions).map(([position, count]) => (
                  <Badge key={position} variant="outline" className="text-xs">
                    {position}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Liczba graczy */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-muted-foreground">
              <span>Liczba graczy:</span>
              <span className="font-medium">{team.players.length}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
