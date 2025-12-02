import { type FormEvent, useState } from "react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const validateEmail = (value: string): string[] => {
    const validationErrors: string[] = [];

    if (!value) {
      validationErrors.push("Adres email jest wymagany");
    } else if (!EMAIL_REGEX.test(value)) {
      validationErrors.push("Nieprawidłowy format adresu email");
    }

    return validationErrors;
  };

  const handleChange = (value: string) => {
    setEmail(value);

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const validationErrors = validateEmail(normalizedEmail);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Wywołaj API endpoint forgot password
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "VALIDATION_ERROR" && result.details) {
          // Mapuj błędy walidacji
          const newErrors: string[] = [];
          Object.entries(result.details).forEach(([field, messages]) => {
            if (field === 'email' && Array.isArray(messages)) {
              newErrors.push(...messages);
            }
          });
          setErrors(newErrors);
          return;
        } else {
          throw new Error(result.message || "Wystąpił błąd podczas wysyłania instrukcji resetu");
        }
      }

      if (result.success) {
        setSubmittedEmail(normalizedEmail);
        setIsSuccess(true);

        toast.success("Wysłaliśmy instrukcje resetu hasła", {
          description: "Sprawdź skrzynkę pocztową i postępuj zgodnie z instrukcjami z wiadomości.",
          duration: 5000,
        });
      } else {
        throw new Error(result.message || "Wystąpił błąd podczas wysyłania instrukcji resetu");
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      let errorMessage = "Wystąpił błąd podczas wysyłania instrukcji resetu. Spróbuj ponownie.";
      let toastTitle = "Błąd wysyłania";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(toastTitle, {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setErrors([]);
  };

  return {
    email,
    errors,
    isSubmitting,
    isSuccess,
    submittedEmail,
    handleChange,
    handleSubmit,
    reset,
  };
}
