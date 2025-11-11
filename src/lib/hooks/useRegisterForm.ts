import { useState } from "react";
import { toast } from "sonner";
import type { RegisterFormData, RegisterFormErrors, CreateUserCommand, PlayerPosition } from "../../types";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    position: "",
    consent: false,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({
    email: [],
    password: [],
    first_name: [],
    last_name: [],
    position: [],
    consent: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (name: keyof RegisterFormData, value: any): string[] => {
    const fieldErrors: string[] = [];

    switch (name) {
      case "email":
        if (!value) {
          fieldErrors.push("Adres email jest wymagany");
        } else if (!EMAIL_REGEX.test(value)) {
          fieldErrors.push("Nieprawidłowy format adresu email");
        }
        break;

      case "password":
        if (!value) {
          fieldErrors.push("Hasło jest wymagane");
        } else if (!PASSWORD_REGEX.test(value)) {
          fieldErrors.push("Hasło musi mieć minimum 8 znaków, zawierać cyfrę i wielką literę");
        }
        break;

      case "first_name":
        if (!value) {
          fieldErrors.push("Imię jest wymagane");
        } else if (value.length > 100) {
          fieldErrors.push("Imię może mieć maksymalnie 100 znaków");
        }
        break;

      case "last_name":
        if (!value) {
          fieldErrors.push("Nazwisko jest wymagane");
        } else if (value.length > 100) {
          fieldErrors.push("Nazwisko może mieć maksymalnie 100 znaków");
        }
        break;

      case "position":
        if (!value) {
          fieldErrors.push("Pozycja jest wymagana");
        }
        break;

      case "consent":
        if (!value) {
          fieldErrors.push("Zgoda na przetwarzanie danych jest wymagana");
        }
        break;
    }

    return fieldErrors;
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      first_name: validateField("first_name", formData.first_name),
      last_name: validateField("last_name", formData.last_name),
      position: validateField("position", formData.position),
      consent: validateField("consent", formData.consent),
    };

    setErrors(newErrors);

    // Check if any field has errors
    return Object.values(newErrors).every(fieldErrors => fieldErrors.length === 0);
  };

  const handleChange = (name: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field when user starts typing
    if (errors[name].length > 0) {
      setErrors(prev => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zapobiegaj wielokrotnemu submit podczas ładowania
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Dodaj timeout dla wywołania API (30 sekund)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Przekroczono limit czasu żądania")), 30000);
    });

    try {
      const command: CreateUserCommand = {
        email: formData.email.trim().toLowerCase(), // Normalizuj email
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        position: formData.position as PlayerPosition,
        consent_date: new Date(),
        consent_version: "1.0",
      };

      // MOCK API CALL - TODO: Replace with real API endpoint
      console.log("Registering user:", command);

      // Symulacja opóźnienia API z możliwością timeout
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000)), // 1-4 sekundy
        timeoutPromise
      ]);

      // Symulacja różnych scenariuszy błędów (można zmienić dla testowania)
      const random = Math.random();
      if (random < 0.1) {
        // Symulacja błędu sieciowego
        throw new Error("Brak połączenia z serwerem");
      } else if (random < 0.4) {
        // Symulacja błędu walidacji z backendu
        throw new Error("Adres email jest już zajęty");
      } else if (random < 0.6) {
        // Symulacja błędu serwera
        throw new Error("Wystąpił błąd serwera. Spróbuj ponownie później.");
      }
      // 40% sukces

      toast.success("Rejestracja zakończona sukcesem!", {
        description: "Twoje konto oczekuje na zatwierdzenie przez administratora.",
        duration: 5000,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
      let toastTitle = "Błąd rejestracji";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Dostosuj tytuł toastu w zależności od typu błędu
        if (errorMessage.includes("limit czasu")) {
          toastTitle = "Przekroczono limit czasu";
        } else if (errorMessage.includes("połączenia")) {
          toastTitle = "Błąd połączenia";
        } else if (errorMessage.includes("zajęty")) {
          toastTitle = "Email już istnieje";
        }
      }

      toast.error(toastTitle, {
        description: errorMessage,
        duration: 6000,
      });

      // Dla błędów związanych z emailem, ustaw błąd w formularzu
      if (errorMessage.includes("email") || errorMessage.includes("Email")) {
        setErrors(prev => ({
          ...prev,
          email: [errorMessage],
        }));
      } else {
        // Dla innych błędów, wyczyść błędy formularza (mogą być stare)
        setErrors({
          email: [],
          password: [],
          first_name: [],
          last_name: [],
          position: [],
          consent: [],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
  };
}
