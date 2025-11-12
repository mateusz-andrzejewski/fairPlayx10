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
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteEventModalProps {
  eventName: string;
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteEventModal({
  eventName,
  eventId,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteEventModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Usuń wydarzenie
          </DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć to wydarzenie? Ta operacja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Uwaga: Usunięcie wydarzenia spowoduje ustawienie statusu wydarzenia na odwołany. Wszystkie zapisy zostaną
            automatycznie anulowane.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 rounded-lg bg-muted p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium">Nazwa wydarzenia:</span>
            <span className="font-semibold">{eventName}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Usuwanie...
              </>
            ) : (
              "Usuń wydarzenie"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
