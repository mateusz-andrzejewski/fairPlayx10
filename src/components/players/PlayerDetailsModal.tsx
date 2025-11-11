import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Dodamy badge jeśli istnieje, inaczej użyjemy prostego tekstu
import type { PlayerDTO, UserRole } from "../../types";

interface PlayerDetailsModalProps {
  player: PlayerDTO;
  isOpen: boolean;
  userRole: UserRole;
  onClose: () => void;
  onEdit?: (player: PlayerDTO) => void;
}

export function PlayerDetailsModal({ player, isOpen, userRole, onClose, onEdit }: PlayerDetailsModalProps) {
  // Jeśli nie ma gracza, nie renderuj komponentu
  if (!player) {
    return null;
  }

  /**
   * Tłumaczenie pozycji na polski
   */
  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      forward: "Napastnik",
      midfielder: "Pomocnik",
      defender: "Obrońca",
      goalkeeper: "Bramkarz",
    };
    return labels[position] || position;
  };

  /**
   * Formatowanie daty
   */
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Nie podano";
    try {
      return new Date(dateString).toLocaleDateString("pl-PL");
    } catch {
      return "Nieprawidłowa data";
    }
  };

  /**
   * Czy użytkownik może edytować
   */
  const canEdit = userRole === "admin" || userRole === "organizer";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Szczegóły gracza</DialogTitle>
          <DialogDescription>
            Informacje o graczu {player.first_name} {player.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Imię</dt>
              <dd className="text-sm font-medium">{player.first_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nazwisko</dt>
              <dd className="text-sm font-medium">{player.last_name}</dd>
            </div>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Pozycja</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{getPositionLabel(player.position)}</Badge>
            </dd>
          </div>

          {userRole === "admin" && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ocena umiejętności</dt>
              <dd className="text-sm font-medium">{player.skill_rate ? `${player.skill_rate}/10` : "Nie oceniony"}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Data urodzenia</dt>
            <dd className="text-sm font-medium">{formatDate(player.date_of_birth)}</dd>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span>Data utworzenia: {formatDate(player.created_at)}</span>
            </div>
            <div>
              <span>Ostatnia aktualizacja: {formatDate(player.updated_at)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
          {onEdit && canEdit && <Button onClick={() => onEdit(player)}>Edytuj</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
