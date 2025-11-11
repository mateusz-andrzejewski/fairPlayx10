import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PositionSelect } from "@/components/ui/position-select";
import type { PlayerDTO, UserRole } from "../../types";
import { playerFormSchema, type PlayerFormData } from "../../lib/validation/playerForm";

interface PlayerFormProps {
  player?: PlayerDTO; // null dla tworzenia, PlayerDTO dla edycji
  isOpen: boolean;
  isSubmitting: boolean;
  userRole: UserRole;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  onCancel: () => void;
}

export function PlayerForm({ player, isOpen, isSubmitting, userRole, onSubmit, onCancel }: PlayerFormProps) {
  const isEditing = !!player;

  // Inicjalizacja formularza
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      first_name: player?.first_name || "",
      last_name: player?.last_name || "",
      position: player?.position || "forward",
      skill_rate: player?.skill_rate || null,
      date_of_birth: player?.date_of_birth || "",
    },
  });

  // Watch dla pozycji aby móc ją aktualizować
  const watchedPosition = watch("position");

  /**
   * Reset formularza przy zmianie player lub otwarciu modala
   */
  React.useEffect(() => {
    if (isOpen) {
      reset({
        first_name: player?.first_name || "",
        last_name: player?.last_name || "",
        position: player?.position || "forward",
        skill_rate: player?.skill_rate || null,
        date_of_birth: player?.date_of_birth || "",
      });
    }
  }, [player, isOpen, reset]);

  /**
   * Obsługa wysłania formularza
   */
  const handleFormSubmit = async (data: PlayerFormData) => {
    await onSubmit(data);
  };

  /**
   * Obsługa zmiany pozycji
   */
  const handlePositionChange = (value: string) => {
    setValue("position", value as PlayerFormData["position"], { shouldValidate: true });
  };

  /**
   * Czy użytkownik może edytować skill_rate
   */
  const canEditSkillRate = userRole === "admin";

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edytuj gracza" : "Dodaj nowego gracza"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Wprowadź zmiany w danych gracza." : "Wypełnij formularz aby dodać nowego gracza do systemu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Imię *</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Jan"
                disabled={isSubmitting}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nazwisko *</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Kowalski"
                disabled={isSubmitting}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <PositionSelect
              value={watchedPosition}
              onChange={handlePositionChange}
              error={errors.position ? [errors.position.message!] : undefined}
              disabled={isSubmitting}
            />
          </div>

          {canEditSkillRate && (
            <div className="space-y-2">
              <Label htmlFor="skill_rate">Ocena umiejętności (1-10)</Label>
              <Input
                id="skill_rate"
                type="number"
                min="1"
                max="10"
                {...register("skill_rate", { valueAsNumber: true })}
                placeholder="Ocena umiejętności"
                disabled={isSubmitting}
                aria-invalid={!!errors.skill_rate}
              />
              {errors.skill_rate && <p className="text-sm text-destructive">{errors.skill_rate.message}</p>}
              <p className="text-xs text-muted-foreground">Opcjonalne pole dla administratorów</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Data urodzenia</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
              disabled={isSubmitting}
              aria-invalid={!!errors.date_of_birth}
            />
            {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
            <p className="text-xs text-muted-foreground">Opcjonalne pole</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
