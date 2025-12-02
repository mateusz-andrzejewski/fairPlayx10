import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import type { UserDTO, UserRole } from "../../types";
import { translateUserRole } from "../../lib/utils/translations";

interface EditUserRoleModalProps {
  user: UserDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, newRole: UserRole) => Promise<void>;
  isSubmitting: boolean;
}

export function EditUserRoleModal({ user, isOpen, onClose, onSave, isSubmitting }: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("player");

  // Zaktualizuj wybór roli gdy zmieni się użytkownik
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role as UserRole);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    await onSave(user.id, selectedRole);
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "player",
      label: "Gracz",
      description: "Użytkownik może przeglądać wydarzenia i zapisywać się na nie",
    },
    {
      value: "organizer",
      label: "Organizator",
      description: "Użytkownik może tworzyć i zarządzać wydarzeniami oraz graczami",
    },
    {
      value: "admin",
      label: "Administrator",
      description: "Pełny dostęp do wszystkich funkcji systemu",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edytuj rolę użytkownika</DialogTitle>
          <DialogDescription>
            Zmień rolę użytkownika {user.first_name} {user.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">Imię i nazwisko:</span>
              <span>
                {user.first_name} {user.last_name}
              </span>
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
              <span className="font-medium">Aktualna rola:</span>
              <span className="font-semibold">{translateUserRole(user.role)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Wybierz nową rolę</Label>
            <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              {roles.map((role) => (
                <div key={role.value} className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value={role.value} id={role.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={role.value} className="font-medium cursor-pointer">
                      {role.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || selectedRole === user.role}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Zapisz zmiany"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
