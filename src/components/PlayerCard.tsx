"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PlayerViewModel, UserRole } from "@/types";

interface PlayerCardProps {
  player: PlayerViewModel;
  userRole: UserRole;
}

// Typ dla przeciąganych elementów
interface DragItem {
  type: string;
  playerId: number;
}

/**
 * Karta gracza do przeciągania w interfejsie drag-and-drop.
 * Wyświetla informacje o graczu i umożliwia przeciąganie między drużynami.
 */
export function PlayerCard({ player, userRole }: PlayerCardProps) {
  // Hook useDrag dla obsługi przeciągania
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: "player",
    item: { type: "player", playerId: player.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Czy użytkownik może zobaczyć skill rate (tylko admin)
  const canViewSkillRate = userRole === "admin";

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg bg-background transition-all duration-200 cursor-move hover:shadow-md focus-within:ring-2 focus-within:ring-primary/50 ${
        isDragging ? "opacity-50 shadow-lg scale-105" : ""
      }`}
      role="listitem"
      aria-label={`Gracz ${player.name}, pozycja ${player.position}${canViewSkillRate ? `, skill rate ${player.skillRate}` : ""}. Przeciągnij aby przenieść do innej drużyny.`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UserIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{player.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5" aria-label={`Pozycja: ${player.position}`}>
                {player.position}
              </Badge>
              {canViewSkillRate && (
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 font-mono"
                  aria-label={`Skill rate: ${player.skillRate}`}
                >
                  {player.skillRate}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
