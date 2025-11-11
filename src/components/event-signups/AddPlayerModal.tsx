"use client";

import React, { useState } from "react";
import { UserIcon, SearchIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AddPlayerFormData, AvailablePlayerDTO } from "@/types";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddPlayerFormData) => void;
  availablePlayers: AvailablePlayerDTO[];
  isSubmitting?: boolean;
}

/**
 * Modal umożliwiający organizatorowi dodanie nowego gracza do wydarzenia.
 * Zawiera formularz z polem wyboru gracza oraz przyciski akcji.
 */
export function AddPlayerModal({
  isOpen,
  onClose,
  onSubmit,
  availablePlayers,
  isSubmitting = false,
}: AddPlayerModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  // Reset formularza przy otwieraniu
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPlayerId("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlayerId) {
      return; // Walidacja - gracz musi być wybrany
    }

    onSubmit({
      playerId: parseInt(selectedPlayerId, 10),
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Dodaj gracza do wydarzenia
          </DialogTitle>
          <DialogDescription>
            Wybierz gracza z listy dostępnych, aby dodać go do wydarzenia. Tylko gracze, którzy jeszcze się nie
            zapisali, będą widoczni na liście.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="player-select" className="text-sm font-medium">
              Wybierz gracza
            </label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <SearchIcon className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Wyszukaj i wybierz gracza..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Brak dostępnych graczy do dodania</div>
                ) : (
                  availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>
                          {player.first_name} {player.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">({player.position})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={!selectedPlayerId || isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Dodawanie..." : "Dodaj gracza"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
