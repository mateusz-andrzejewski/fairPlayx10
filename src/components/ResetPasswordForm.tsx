import { useResetPasswordForm } from "../lib/hooks/useResetPasswordForm";
import { PasswordInput } from "./ui/password-input";
import { SubmitButton } from "./ui/submit-button";
import { Button } from "./ui/button";
import { CheckCircleIcon } from "lucide-react";

function ResetPasswordForm() {
  const {
    password,
    confirmPassword,
    errors,
    isSubmitting,
    isSuccess,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useResetPasswordForm();

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircleIcon className="h-6 w-6 text-green-700" />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Hasło zostało zmienione</h3>
          <p className="text-sm text-muted-foreground">
            Twoje hasło zostało pomyślnie zaktualizowane. Możesz teraz wrócić do logowania i korzystać z nowego hasła.
          </p>
        </div>
        <Button asChild className="w-full">
          <a href="/login">Przejdź do logowania</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Wprowadź nowe hasło dla swojego konta.</p>
        <p>Hasło musi zawierać minimum 8 znaków, wielką literę i cyfrę.</p>
      </div>

      <PasswordInput
        label="Nowe hasło"
        value={password}
        onChange={handlePasswordChange}
        error={errors.password}
        placeholder="Wprowadź nowe hasło"
      />

      <PasswordInput
        label="Potwierdź hasło"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        error={errors.confirmPassword}
        placeholder="Powtórz nowe hasło"
      />

      <SubmitButton disabled={isSubmitting} isLoading={isSubmitting}>
        Zmień hasło
      </SubmitButton>

      <div className="text-center text-sm text-muted-foreground">
        <a href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </a>
      </div>
    </form>
  );
}

export default ResetPasswordForm;
