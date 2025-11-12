"use client";

import React from "react";
import { useDrop } from "react-dnd";
import { UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "./PlayerCard";
import type { TeamViewModel, UserRole } from "@/types";

interface TeamColumnProps {
  team: TeamViewModel;
  userRole: UserRole;
  onDrop: (playerId: number, teamNumber: number) => void;
  canDrop: boolean;
}

// Typ dla przeciąganych elementów
interface DragItem {
  type: string;
  playerId: number;
}

/**
 * Kolumna reprezentująca pojedynczą drużynę w interfejsie drag-and-drop.
 * Akceptuje upuszczanie graczy i wyświetla listę graczy w drużynie.
 */
export function TeamColumn({ team, userRole, onDrop, canDrop }: TeamColumnProps) {
  // Hook useDrop dla obsługi upuszczania
  const [{ isOver, canDrop: canDropHere }, drop] = useDrop<DragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: "player",
    drop: (item) => {
      onDrop(item.playerId, team.teamNumber);
    },
    canDrop: () => canDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Czy użytkownik może zobaczyć skill rate (tylko admin)
  const canViewSkillRate = userRole === "admin";

  // Styl dla stanu przeciągania
  const columnClassName = `transition-colors duration-200 ${
    isOver && canDropHere
      ? "ring-2 ring-primary bg-primary/5"
      : isOver && !canDropHere
        ? "ring-2 ring-destructive bg-destructive/5"
        : ""
  }`;

  return (
    <Card
      ref={drop}
      className={columnClassName}
      role="region"
      aria-labelledby={`team-${team.teamNumber}-heading`}
      aria-describedby={`team-${team.teamNumber}-stats`}
    >
      <CardHeader className="pb-3">
        <CardTitle
          id={`team-${team.teamNumber}-heading`}
          className="text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" aria-hidden="true" />
            Drużyna {team.teamNumber}
          </div>
          {canViewSkillRate && (
            <Badge variant="secondary" className="font-mono self-start sm:self-auto">
              {team.avgSkillRate.toFixed(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 min-h-[200px]">
        {team.players.length === 0 ? (
          <div
            className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/25 rounded-lg"
            role="status"
            aria-live="polite"
          >
            Przeciągnij graczy tutaj
          </div>
        ) : (
          <div role="list" aria-label={`Gracze drużyny ${team.teamNumber}`}>
            {team.players.map((player) => (
              <PlayerCard key={player.signupId} player={player} userRole={userRole} />
            ))}
          </div>
        )}

        {/* Rozkład pozycji */}
        <div id={`team-${team.teamNumber}-stats`} className="mt-4 pt-3 border-t">
          <div className="text-xs text-muted-foreground mb-2">Pozycje:</div>
          <div className="flex flex-wrap gap-1" role="list" aria-label="Rozkład pozycji w drużynie">
            {Object.entries(team.positions).map(([position, count]) => (
              <Badge
                key={position}
                variant="outline"
                className="text-xs px-1.5 py-0.5"
                role="listitem"
                aria-label={`${count} ${position}${count === 1 ? "" : "ów"}`}
              >
                {position}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
