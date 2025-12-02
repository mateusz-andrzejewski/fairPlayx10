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
import { Checkbox } from "@/components/ui/checkbox";
import type { AddPlayerFormData, AvailablePlayerDTO } from "@/types/eventSignupsView";
import { translatePlayerPosition } from "../../lib/utils/translations";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddPlayerFormData) => void;
  availablePlayers: AvailablePlayerDTO[];
  isSubmitting?: boolean;
  isLoading?: boolean;
}

/**
 * Modal umożliwiający organizatorowi dodanie nowych graczy do wydarzenia.
 * Zawiera formularz z checkboxami wyboru graczy oraz przycisk "zaznacz wszystkie".
 */
export function AddPlayerModal({
  isOpen,
  onClose,
  onSubmit,
  availablePlayers,
  isSubmitting = false,
  isLoading = false,
}: AddPlayerModalProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);

  // Reset formularza przy otwieraniu
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPlayerIds([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayerIds.length === 0 || isLoading) {
      return; // Walidacja - przynajmniej jeden gracz musi być wybrany
    }

    onSubmit({
      playerIds: selectedPlayerIds,
    });
  };

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    if (checked) {
      setSelectedPlayerIds((prev) => [...prev, playerId]);
    } else {
      setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlayerIds(availablePlayers.map((player) => player.id));
    } else {
      setSelectedPlayerIds([]);
    }
  };

  const isAllSelected = availablePlayers.length > 0 && selectedPlayerIds.length === availablePlayers.length;

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
            Dodaj graczy do wydarzenia
          </DialogTitle>
          <DialogDescription>
            Zaznacz graczy z listy dostępnych, aby dodać ich do wydarzenia. Tylko gracze, którzy jeszcze się nie
            zapisali, będą widoczni na liście.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="players-container" className="text-sm font-medium">
                Wybierz graczy
              </label>
              {availablePlayers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isSubmitting || isLoading}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Zaznacz wszystkie
                  </label>
                </div>
              )}
            </div>

            <div id="players-container" className="max-h-60 overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <SearchIcon className="w-4 h-4 animate-spin" />
                    Ładowanie dostępnych graczy...
                  </div>
                </div>
              ) : availablePlayers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Brak dostępnych graczy do dodania</div>
              ) : (
                <div className="p-2 space-y-2">
                  {availablePlayers.map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={`player-${player.id}`}
                        checked={selectedPlayerIds.includes(player.id)}
                        onCheckedChange={(checked) => handlePlayerToggle(player.id, checked as boolean)}
                        disabled={isSubmitting || isLoading}
                      />
                      <label
                        htmlFor={`player-${player.id}`}
                        className="flex items-center gap-2 flex-1 cursor-pointer text-sm"
                      >
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {player.first_name} {player.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({translatePlayerPosition(player.position)})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={selectedPlayerIds.length === 0 || isSubmitting || isLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? `Dodawanie... (${selectedPlayerIds.length})`
                : `Dodaj graczy (${selectedPlayerIds.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
