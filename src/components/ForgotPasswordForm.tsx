import { useForgotPasswordForm } from "../lib/hooks/useForgotPasswordForm";

import { EmailInput } from "./ui/email-input";
import { SubmitButton } from "./ui/submit-button";
import { ForgotPasswordSuccess } from "./ForgotPasswordSuccess";

function ForgotPasswordForm() {
  const { email, errors, isSubmitting, isSuccess, submittedEmail, handleChange, handleSubmit, reset } =
    useForgotPasswordForm();

  if (isSuccess) {
    return <ForgotPasswordSuccess email={submittedEmail} onRetry={reset} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Podaj adres email powiązany z kontem FairPlay.</p>
        <p>Wyślemy instrukcje resetu hasła wraz z linkiem ważnym przez 60 minut.</p>
      </div>

      <EmailInput value={email} onChange={handleChange} error={errors} />

      <SubmitButton disabled={isSubmitting} isLoading={isSubmitting}>
        Wyślij instrukcje resetu
      </SubmitButton>

      <div className="text-center text-sm text-muted-foreground">
        <a href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </a>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
