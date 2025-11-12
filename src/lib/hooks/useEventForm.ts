import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { EventFormViewModel, EventFormErrors, EventDTO } from "../../types";

/**
 * Akcje dostępne w hooku formularza wydarzenia
 */
interface EventFormActions {
  // Zarządzanie formularzem
  updateField: <K extends keyof EventFormViewModel>(field: K, value: EventFormViewModel[K]) => void;
  setErrors: (errors: Partial<EventFormErrors>) => void;
  clearErrors: () => void;

  // Operacje CRUD
  submit: () => Promise<void>;
  reset: () => void;
}

/**
 * Główny hook do zarządzania stanem formularza tworzenia/edycji wydarzenia.
 */
export function useEventForm(event?: EventDTO, onSuccess?: (event: EventDTO) => void, onCancel?: () => void) {
  // Stan formularza
  const [formData, setFormData] = useState<EventFormViewModel>(() => ({
    id: event?.id,
    name: event?.name || "",
    location: event?.location || "",
    event_datetime: event?.event_datetime
      ? new Date(event.event_datetime).toISOString().slice(0, 16) // Format dla input datetime-local
      : "",
    max_places: event?.max_places || 10,
    optional_fee: event?.optional_fee || undefined,
    isSubmitting: false,
    errors: {
      name: [],
      location: [],
      event_datetime: [],
      max_places: [],
      optional_fee: [],
    },
  }));

  /**
   * Aktualizacja pojedynczego pola formularza
   */
  const updateField = useCallback(
    <K extends keyof EventFormViewModel>(field: K, value: EventFormViewModel[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Wyczyść błąd dla tego pola przy zmianie wartości
      if (formData.errors[field as keyof EventFormErrors]) {
        setFormData((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: [],
          },
        }));
      }
    },
    [formData.errors]
  );

  /**
   * Ustawienie błędów walidacji
   */
  const setErrors = useCallback((errors: Partial<EventFormErrors>) => {
    setFormData((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors,
      },
    }));
  }, []);

  /**
   * Wyczyszczenie wszystkich błędów
   */
  const clearErrors = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      errors: {
        name: [],
        location: [],
        event_datetime: [],
        max_places: [],
        optional_fee: [],
      },
    }));
  }, []);

  /**
   * Walidacja formularza
   */
  const validateForm = useCallback((): boolean => {
    const errors: Partial<EventFormErrors> = {};
    let isValid = true;

    // Walidacja nazwy
    if (!formData.name.trim()) {
      errors.name = ["Nazwa wydarzenia jest wymagana"];
      isValid = false;
    } else if (formData.name.length > 200) {
      errors.name = ["Nazwa nie może być dłuższa niż 200 znaków"];
      isValid = false;
    }

    // Walidacja lokalizacji
    if (!formData.location.trim()) {
      errors.location = ["Lokalizacja jest wymagana"];
      isValid = false;
    } else if (formData.location.length > 200) {
      errors.location = ["Lokalizacja nie może być dłuższa niż 200 znaków"];
      isValid = false;
    }

    // Walidacja daty
    if (!formData.event_datetime) {
      errors.event_datetime = ["Data i czas wydarzenia są wymagane"];
      isValid = false;
    } else {
      const eventDate = new Date(formData.event_datetime);
      const now = new Date();
      if (eventDate <= now) {
        errors.event_datetime = ["Data wydarzenia musi być w przyszłości"];
        isValid = false;
      }
    }

    // Walidacja maksymalnej liczby miejsc
    if (formData.max_places < 1) {
      errors.max_places = ["Liczba miejsc musi być większa od 0"];
      isValid = false;
    } else if (formData.max_places > 100) {
      errors.max_places = ["Liczba miejsc nie może być większa niż 100"];
      isValid = false;
    }

    // Walidacja opcjonalnej opłaty
    if (formData.optional_fee !== undefined && formData.optional_fee < 0) {
      errors.optional_fee = ["Opłata nie może być ujemna"];
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  }, [formData, setErrors]);

  /**
   * Wysłanie formularza
   */
  const submit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setFormData((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const command = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        event_datetime: new Date(formData.event_datetime).toISOString(),
        max_places: formData.max_places,
        optional_fee: formData.optional_fee,
      };

      let response: Response;
      let result: EventDTO;

      if (event) {
        // Edycja istniejącego wydarzenia
        response = await fetch(`/api/event/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });
        result = await response.json();
      } else {
        // Tworzenie nowego wydarzenia
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });
        result = await response.json();
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się zapisać wydarzenia");
      }

      toast.success("Sukces", {
        description: event ? "Wydarzenie zostało zaktualizowane" : "Wydarzenie zostało utworzone",
      });

      // Wywołaj callback sukcesu
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać wydarzenia";
      toast.error("Błąd", { description: errorMessage });
    } finally {
      setFormData((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [formData, event, validateForm, onSuccess, toast]);

  /**
   * Resetowanie formularza
   */
  const reset = useCallback(() => {
    setFormData({
      id: event?.id,
      name: event?.name || "",
      location: event?.location || "",
      event_datetime: event?.event_datetime ? new Date(event.event_datetime).toISOString().slice(0, 16) : "",
      max_places: event?.max_places || 10,
      optional_fee: event?.optional_fee || undefined,
      isSubmitting: false,
      errors: {
        name: [],
        location: [],
        event_datetime: [],
        max_places: [],
        optional_fee: [],
      },
    });

    if (onCancel) {
      onCancel();
    }
  }, [event, onCancel]);

  /**
   * Złożony obiekt akcji
   */
  const actions: EventFormActions = {
    updateField,
    setErrors,
    clearErrors,
    submit,
    reset,
  };

  return {
    // Stan
    formData,

    // Akcje
    actions,
  };
}
