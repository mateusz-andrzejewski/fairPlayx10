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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmittedEmail(normalizedEmail);
      setIsSuccess(true);

      toast.success("Wysłaliśmy instrukcje resetu hasła", {
        description: "Sprawdź skrzynkę pocztową i postępuj zgodnie z instrukcjami z wiadomości.",
        duration: 5000,
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
