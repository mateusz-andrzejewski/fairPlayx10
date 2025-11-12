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
import type { UserDTO } from "../../types";

interface DeleteUserModalProps {
  user: UserDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteUserModal({ user, isOpen, onClose, onConfirm, isDeleting }: DeleteUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Usuń użytkownika
          </DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Uwaga: Usunięcie użytkownika spowoduje ustawienie flagi deleted_at i użytkownik nie będzie mógł się
            zalogować.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 rounded-lg bg-muted p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium">Imię i nazwisko:</span>
            <span>
              {user.first_name} {user.last_name}
            </span>
            <span className="font-medium">Email:</span>
            <span>{user.email}</span>
            <span className="font-medium">Rola:</span>
            <span className="capitalize">{user.role}</span>
            <span className="font-medium">Status:</span>
            <span className="capitalize">{user.status === "approved" ? "Zatwierdzony" : "Oczekujący"}</span>
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
              "Usuń użytkownika"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

