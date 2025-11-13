import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { EventForm } from "./EventForm";
import { useAuth } from "../../lib/hooks/useAuth";
import type { CreateEventValidatedParams } from "../../lib/validation/event";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EventCreatePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = user?.role === "admin" || user?.role === "organizer";

  const handleSubmit = async (data: CreateEventValidatedParams) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? `HTTP ${response.status}: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      toast.success("Wydarzenie utworzone pomyślnie");

      // Przekieruj do szczegółów nowo utworzonego wydarzenia
      window.location.href = `/dashboard/events/${createdEvent.id}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się utworzyć wydarzenia";
      toast.error("Tworzenie wydarzenia nie powiodło się", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Musisz być zalogowany, aby tworzyć wydarzenia.</AlertDescription>
      </Alert>
    );
  }

  if (!canCreate) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nie masz uprawnień do tworzenia wydarzeń. Tylko administratorzy i organizatorzy mogą tworzyć wydarzenia.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="py-8">
      <EventForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
    </div>
  );
}
