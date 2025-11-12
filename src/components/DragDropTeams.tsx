"use client";

import React, { useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { TeamColumn } from "./TeamColumn";
import type { TeamViewModel, ManualTeamAssignmentEntry, UserRole } from "@/types";

interface DragDropTeamsProps {
  teams: TeamViewModel[];
  onAssignTeams: (assignments: ManualTeamAssignmentEntry[]) => void;
  userRole: UserRole;
  balanceAchieved: boolean;
}

/**
 * Interfejs drag-and-drop umożliwiający manualne przenoszenie graczy między drużynami.
 * Aktualizuje statystyki drużyn w czasie rzeczywistym i sprawdza balans.
 */
export function DragDropTeams({ teams, onAssignTeams, userRole, balanceAchieved }: DragDropTeamsProps) {
  // Obsługa upuszczenia gracza do drużyny
  const handleDrop = useCallback(
    (playerSignupId: number, targetTeamNumber: number) => {
      // Znajdź aktualną drużynę gracza
      const currentTeam = teams.find((team) => team.players.some((player) => player.signupId === playerSignupId));

      // Jeśli gracz jest już w docelowej drużynie, nie rób nic
      if (currentTeam?.teamNumber === targetTeamNumber) {
        return;
      }

      // Utwórz nowe przypisania - wszystkie gracze muszą być przypisane
      const assignments: ManualTeamAssignmentEntry[] = [];

      teams.forEach((team) => {
        team.players.forEach((player) => {
          let teamNumber = team.teamNumber;
          let teamColor = team.teamColor;

          // Jeśli to gracz, którego przenosimy, przypisz do nowej drużyny
          if (player.signupId === playerSignupId) {
            teamNumber = targetTeamNumber;
            // Znajdź kolor docelowej drużyny
            const targetTeam = teams.find((t) => t.teamNumber === targetTeamNumber);
            teamColor = targetTeam?.teamColor || team.teamColor;
          }

          assignments.push({
            signup_id: player.signupId,
            team_number: teamNumber,
            team_color: teamColor,
          });
        });
      });

      // Wywołaj przypisanie drużyn
      onAssignTeams(assignments);
    },
    [teams, onAssignTeams]
  );

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Brak drużyn do zarządzania. Najpierw uruchom losowanie.</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Ostrzeżenie o braku balansu */}
        {!balanceAchieved && (
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Różnica średniego skill rate między drużynami przekracza 7%. Przenieś graczy między drużynami, aby
              osiągnąć balans.
            </AlertDescription>
          </Alert>
        )}

        {/* Obszar drag-and-drop */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          role="region"
          aria-label="Obszar przeciągania i upuszczania drużyn"
        >
          {teams.map((team) => (
            <TeamColumn
              key={team.teamNumber}
              team={team}
              userRole={userRole}
              onDrop={handleDrop}
              canDrop={!balanceAchieved} // Zablokuj upuszczanie jeśli balans osiągnięty
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
