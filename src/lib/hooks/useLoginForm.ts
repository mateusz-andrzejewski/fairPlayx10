import { useState } from "react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email: string[];
  password: string[];
}

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({
    email: [],
    password: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: keyof LoginFormData, value: any): string[] => {
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
        } else if (value.length < 8) {
          fieldErrors.push("Hasło musi mieć minimum 8 znaków");
        }
        break;
    }

    return fieldErrors;
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };

    setErrors(newErrors);

    // Check if any field has errors
    return Object.values(newErrors).every((fieldErrors) => fieldErrors.length === 0);
  };

  const handleChange = (name: keyof LoginFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field when user starts typing
    if (errors[name].length > 0) {
      setErrors((prev) => ({
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
      // TODO: Replace with real API call
      console.log("Logging in user:", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Symulacja opóźnienia API z możliwością timeout
      await Promise.race([
        new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 1000)), // 1-4 sekundy
        timeoutPromise,
      ]);

      // Symulacja różnych scenariuszy błędów (można zmienić dla testowania)
      const random = Math.random();
      if (random < 0.2) {
        // Symulacja błędu sieciowego
        throw new Error("Brak połączenia z serwerem");
      } else if (random < 0.5) {
        // Symulacja błędu walidacji z backendu
        throw new Error("Nieprawidłowy email lub hasło");
      } else if (random < 0.7) {
        // Symulacja błędu serwera
        throw new Error("Wystąpił błąd serwera. Spróbuj ponownie później.");
      }
      // 30% sukces

      toast.success("Logowanie zakończone sukcesem!", {
        description: "Przekierowywanie do dashboardu...",
        duration: 3000,
      });

      // Handle successful login - redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Wystąpił błąd podczas logowania. Spróbuj ponownie.";
      let toastTitle = "Błąd logowania";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Dostosuj tytuł toastu w zależności od typu błędu
        if (errorMessage.includes("limit czasu")) {
          toastTitle = "Przekroczono limit czasu";
        } else if (errorMessage.includes("połączenia")) {
          toastTitle = "Błąd połączenia";
        } else if (errorMessage.includes("email") || errorMessage.includes("hasło")) {
          toastTitle = "Nieprawidłowe dane";
        }
      }

      toast.error(toastTitle, {
        description: errorMessage,
        duration: 6000,
      });

      // Dla błędów związanych z emailem/hasłem, ustaw błąd w formularzu
      if (errorMessage.includes("email") || errorMessage.includes("hasło") || errorMessage.includes("dane")) {
        setErrors((prev) => ({
          ...prev,
          email: [errorMessage],
          password: [],
        }));
      } else {
        // Dla innych błędów, wyczyść błędy formularza (mogą być stare)
        setErrors({
          email: [],
          password: [],
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
    handleChange,
    handleSubmit,
  };
}
