import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, MapPin, Users, Euro, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEventBodySchema, type CreateEventValidatedParams } from "../../lib/validation/event";
import type { EventDTO } from "../../types";

interface EventFormProps {
  event?: EventDTO; // null dla tworzenia, EventDTO dla edycji
  onSubmit: (data: CreateEventValidatedParams) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Formularz do tworzenia nowych wydarzeń lub edycji istniejących.
 * Zawiera wszystkie wymagane pola z walidacją i obsługą błędów.
 */
export function EventForm({ event, onSubmit, onCancel, isSubmitting = false }: EventFormProps) {
  const isEditing = !!event;

  // Inicjalizacja formularza z react-hook-form i zod
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<CreateEventValidatedParams>({
    resolver: zodResolver(createEventBodySchema),
    mode: "onChange", // Walidacja w czasie rzeczywistym
    defaultValues: {
      name: event?.name || "",
      location: event?.location || "",
      event_datetime: event?.event_datetime
        ? new Date(event.event_datetime).toISOString().slice(0, 16) // Format dla input datetime-local
        : "",
      max_places: event?.max_places || 10,
      optional_fee: event?.optional_fee || undefined,
    },
  });

  // Watch dla pól aby móc je aktualizować
  const watchedFee = watch("optional_fee");

  /**
   * Obsługa wysłania formularza
   */
  const handleFormSubmit = async (data: CreateEventValidatedParams) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Błędy są obsługiwane przez rodzica lub hook
      console.error("Błąd podczas wysyłania formularza:", error);
    }
  };

  /**
   * Obsługa anulowania formularza
   */
  const handleCancel = () => {
    reset(); // Resetuj formularz do wartości domyślnych
    onCancel();
  };

  /**
   * Funkcja pomocnicza do formatowania błędów
   */
  const getErrorMessage = (fieldName: keyof CreateEventValidatedParams) => {
    const error = errors[fieldName];
    return error?.message || "";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{isEditing ? "Edytuj wydarzenie" : "Utwórz nowe wydarzenie"}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Nazwa wydarzenia */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nazwa wydarzenia *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="np. Piłka nożna - liga letnia"
                {...register("name")}
                disabled={isSubmitting}
                maxLength={200}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getErrorMessage("name")}
                </p>
              )}
            </div>

            {/* Lokalizacja */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Lokalizacja *
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="np. Stadion Miejski, ul. Sportowa 1"
                {...register("location")}
                disabled={isSubmitting}
                maxLength={200}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getErrorMessage("location")}
                </p>
              )}
            </div>

            {/* Data i czas */}
            <div className="space-y-2">
              <Label htmlFor="event_datetime" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <Clock className="h-4 w-4" />
                Data i czas wydarzenia *
              </Label>
              <Input
                id="event_datetime"
                type="datetime-local"
                {...register("event_datetime")}
                disabled={isSubmitting}
                className={errors.event_datetime ? "border-destructive" : ""}
              />
              {errors.event_datetime && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getErrorMessage("event_datetime")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Wydarzenie musi być zaplanowane w przyszłości</p>
            </div>

            {/* Maksymalna liczba miejsc */}
            <div className="space-y-2">
              <Label htmlFor="max_places" className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                Maksymalna liczba miejsc *
              </Label>
              <Input
                id="max_places"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                {...register("max_places", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={errors.max_places ? "border-destructive" : ""}
              />
              {errors.max_places && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getErrorMessage("max_places")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Liczba miejsc musi być między 1 a 100</p>
            </div>

            {/* Opcjonalna opłata */}
            <div className="space-y-2">
              <Label htmlFor="optional_fee" className="text-sm font-medium flex items-center gap-1">
                <Euro className="h-4 w-4" />
                Opcjonalna opłata za udział
              </Label>
              <div className="relative">
                <Input
                  id="optional_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="np. 20.00"
                  {...register("optional_fee", { valueAsNumber: true })}
                  disabled={isSubmitting}
                  className={errors.optional_fee ? "border-destructive pl-8" : "pl-8"}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
              {errors.optional_fee && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getErrorMessage("optional_fee")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Pozostaw puste jeśli udział jest bezpłatny</p>
            </div>

            {/* Przyciski akcji */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting || !isValid} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isEditing ? "Aktualizuję..." : "Tworzę..."}
                  </>
                ) : isEditing ? (
                  "Aktualizuj wydarzenie"
                ) : (
                  "Utwórz wydarzenie"
                )}
              </Button>

              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting} className="flex-1">
                Anuluj
              </Button>
            </div>
          </form>

          {/* Informacje o wymaganych polach */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>*</strong> Pola oznaczone gwiazdką są wymagane. Wszystkie dane są walidowane automatycznie.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
