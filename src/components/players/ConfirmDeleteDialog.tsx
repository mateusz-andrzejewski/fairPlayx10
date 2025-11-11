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
import { AlertTriangle } from "lucide-react";
import type { PlayerDTO } from "../../types";

interface ConfirmDeleteDialogProps {
  player: PlayerDTO;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ player, isOpen, isDeleting, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  // Jeśli nie ma gracza, nie renderuj komponentu
  if (!player) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Potwierdź usunięcie gracza</DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz usunąć tego gracza? Ta operacja jest nieodwracalna.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Gracz: </span>
                {player.first_name} {player.last_name}
              </div>
              <div className="text-sm">
                <span className="font-medium">Pozycja: </span>
                {player.position}
              </div>
              {player.skill_rate && (
                <div className="text-sm">
                  <span className="font-medium">Ocena umiejętności: </span>
                  {player.skill_rate}/10
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Uwaga:</strong> Usunięcie gracza spowoduje trwałe usunięcie wszystkich jego danych z systemu. Ta
              operacja nie może zostać cofnięta.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Usuń gracza"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
