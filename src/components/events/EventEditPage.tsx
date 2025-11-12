import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { EventForm } from "./EventForm";
import { useAuth } from "../../lib/hooks/useAuth";
import type { EventDetailDTO } from "../../types";
import type { CreateEventValidatedParams } from "../../lib/validation/event";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventEditPageProps {
  eventId: number;
}

export function EventEditPage({ eventId }: EventEditPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = useMemo(() => {
    if (!user || !event) {
      return false;
    }
    return user.role === "admin" || event.organizer_id === user.id;
  }, [user, event]);

  useEffect(() => {
    let cancelled = false;
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/event/${eventId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: EventDetailDTO = await response.json();
        if (!cancelled) {
          setEvent(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Nie udało się pobrać danych wydarzenia";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleSubmit = async (data: CreateEventValidatedParams) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/event/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? `HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedEvent: EventDetailDTO = await response.json();
      setEvent(updatedEvent);
      toast.success("Wydarzenie zaktualizowane pomyślnie");
      window.location.href = `/dashboard/events/${eventId}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się zaktualizować wydarzenia";
      toast.error("Aktualizacja wydarzenia nie powiodła się", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Ładowanie danych wydarzenia...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Musisz być zalogowany, aby edytować wydarzenie.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nie udało się odnaleźć wydarzenia do edycji.</AlertDescription>
      </Alert>
    );
  }

  if (!canEdit) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nie masz uprawnień do edycji tego wydarzenia.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="py-8">
      <EventForm event={event} onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
    </div>
  );
}
