"use client";

import React from "react";
import { AlertTriangleIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ConfirmActionData } from "@/types";

interface ConfirmModalProps {
  isOpen: boolean;
  actionData: ConfirmActionData | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Ogólny modal potwierdzenia dla akcji wymagających zgody użytkownika.
 * Wyświetla komunikat potwierdzający akcję oraz przyciski Tak/Nie.
 */
export function ConfirmModal({
  isOpen,
  actionData,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ConfirmModalProps) {
  // Konfiguracja komunikatów dla różnych akcji
  const getActionConfig = (action: ConfirmActionData["action"]) => {
    switch (action) {
      case "withdraw":
        return {
          title: "Wycofaj zapis",
          description: "Czy na pewno chcesz wycofać ten zapis? Tej akcji nie można cofnąć.",
          confirmText: "Wycofaj",
          confirmVariant: "destructive" as const,
        };
      case "updateStatus":
        return {
          title: "Zmień status zapisu",
          description: "Czy na pewno chcesz zmienić status tego zapisu?",
          confirmText: "Zmień status",
          confirmVariant: "default" as const,
        };
      default:
        return {
          title: "Potwierdź akcję",
          description: "Czy na pewno chcesz wykonać tę akcję?",
          confirmText: "Potwierdź",
          confirmVariant: "default" as const,
        };
    }
  };

  const config = actionData ? getActionConfig(actionData.action) : null;

  const handleConfirm = () => {
    if (!isSubmitting) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangleIcon className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{config?.title || "Potwierdź akcję"}</DialogTitle>
              <DialogDescription className="mt-1">
                {config?.description || "Czy na pewno chcesz wykonać tę akcję?"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant={config?.confirmVariant || "default"}
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Wykonywanie..." : (config?.confirmText || "Potwierdź")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
