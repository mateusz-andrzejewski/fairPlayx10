"use client";

import React from "react";
import { ShuffleIcon, AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DrawButtonProps {
  onDraw: () => void;
  isLoading: boolean;
  disabled: boolean;
  minPlayersRequired: number;
  currentPlayersCount: number;
}

/**
 * Przycisk akcji do uruchomienia automatycznego algorytmu losowania drużyn.
 * Wyświetla stan ładowania podczas przetwarzania i waliduje warunki uruchomienia.
 */
export function DrawButton({ onDraw, isLoading, disabled, minPlayersRequired, currentPlayersCount }: DrawButtonProps) {
  const handleClick = () => {
    if (!disabled && !isLoading) {
      onDraw();
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className="space-y-4">
      {/* Ostrzeżenie o minimalnej liczbie graczy */}
      {currentPlayersCount < minPlayersRequired && (
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            Do uruchomienia losowania wymaganych jest co najmniej {minPlayersRequired} graczy. Obecnie zapisanych:{" "}
            {currentPlayersCount}.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleClick}
        disabled={isDisabled}
        size="lg"
        className="flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium w-full sm:w-auto"
        aria-describedby={currentPlayersCount < minPlayersRequired ? "draw-requirements" : undefined}
      >
        <ShuffleIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        {isLoading ? "Uruchamianie losowania..." : "Uruchom losowanie"}
      </Button>

      {/* Ukryty opis wymagań dostępności */}
      {currentPlayersCount < minPlayersRequired && (
        <div id="draw-requirements" className="sr-only">
          Wymagania nie zostały spełnione. Minimalna liczba graczy: {minPlayersRequired}. Obecnie: {currentPlayersCount}
          .
        </div>
      )}
    </div>
  );
}
