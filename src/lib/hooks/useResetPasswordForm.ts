import { useState, useEffect } from "react";
import { toast } from "sonner";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export function useResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password: string[]; confirmPassword: string[] }>({
    password: [],
    confirmPassword: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sprawdź czy mamy access token w URL (pochodzi z linku resetowania)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Ustaw sesję Supabase z tokenami z URL
      // To zostanie obsłużone przez Supabase auth
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validateField = (field: 'password' | 'confirmPassword', value: string): string[] => {
    const fieldErrors: string[] = [];

    if (field === 'password') {
      if (!value) {
        fieldErrors.push("Hasło jest wymagane");
      } else if (!PASSWORD_REGEX.test(value)) {
        fieldErrors.push("Hasło musi mieć minimum 8 znaków, zawierać cyfrę i wielką literę");
      }
    } else if (field === 'confirmPassword') {
      if (!value) {
        fieldErrors.push("Potwierdzenie hasła jest wymagane");
      } else if (value !== password) {
        fieldErrors.push("Hasła nie są identyczne");
      }
    }

    return fieldErrors;
  };

  const validateForm = (): boolean => {
    const passwordErrors = validateField('password', password);
    const confirmPasswordErrors = validateField('confirmPassword', confirmPassword);

    setErrors({
      password: passwordErrors,
      confirmPassword: confirmPasswordErrors,
    });

    return passwordErrors.length === 0 && confirmPasswordErrors.length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password.length > 0) {
      setErrors((prev) => ({
        ...prev,
        password: [],
      }));
    }

    // Jeśli użytkownik zmienia hasło, sprawdź ponownie potwierdzenie
    if (confirmPassword && errors.confirmPassword.length > 0) {
      const confirmErrors = validateField('confirmPassword', confirmPassword);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmErrors,
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (errors.confirmPassword.length > 0) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Wywołaj API endpoint do resetowania hasła
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "VALIDATION_ERROR" && result.details) {
          const newErrors: { password: string[]; confirmPassword: string[] } = {
            password: [],
            confirmPassword: [],
          };

          Object.entries(result.details).forEach(([field, messages]) => {
            if (field === 'password' && Array.isArray(messages)) {
              newErrors.password = messages;
            }
          });

          setErrors(newErrors);
          return;
        } else {
          throw new Error(result.message || "Wystąpił błąd podczas resetowania hasła");
        }
      }

      if (result.success) {
        toast.success("Hasło zostało pomyślnie zmienione!", {
          description: "Możesz teraz zalogować się używając nowego hasła.",
          duration: 6000,
        });

        setIsSuccess(true);
      } else {
        throw new Error(result.message || "Wystąpił błąd podczas resetowania hasła");
      }
    } catch (error) {
      console.error("Reset password error:", error);

      let errorMessage = "Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.";
      let toastTitle = "Błąd resetowania hasła";

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

  return {
    password,
    confirmPassword,
    errors,
    isSubmitting,
    isSuccess,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  };
}
