import { useRegisterForm } from "../lib/hooks/useRegisterForm";
import { EmailInput } from "./ui/email-input";
import { PasswordInput } from "./ui/password-input";
import { FirstNameInput } from "./ui/first-name-input";
import { LastNameInput } from "./ui/last-name-input";
import { PositionSelect } from "./ui/position-select";
import { RodoCheckbox } from "./ui/rodo-checkbox";
import { SubmitButton } from "./ui/submit-button";
import { SuccessMessage } from "./SuccessMessage";

function RegisterForm() {
  const { formData, errors, isSubmitting, isSuccess, handleChange, handleSubmit } = useRegisterForm();

  if (isSuccess) {
    return <SuccessMessage />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" data-test-id="register-form">
      <EmailInput value={formData.email} onChange={(value) => handleChange("email", value)} error={errors.email} />

      <PasswordInput
        value={formData.password}
        onChange={(value) => handleChange("password", value)}
        error={errors.password}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FirstNameInput
          value={formData.first_name}
          onChange={(value) => handleChange("first_name", value)}
          error={errors.first_name}
        />

        <LastNameInput
          value={formData.last_name}
          onChange={(value) => handleChange("last_name", value)}
          error={errors.last_name}
        />
      </div>

      <PositionSelect
        value={formData.position}
        onChange={(value) => handleChange("position", value)}
        error={errors.position}
      />

      <RodoCheckbox
        checked={formData.consent}
        onChange={(checked) => handleChange("consent", checked)}
        error={errors.consent}
      />

      <SubmitButton disabled={isSubmitting} isLoading={isSubmitting}>
        Zarejestruj się
      </SubmitButton>

      <div className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <a 
          href="/login" 
          className="font-medium text-primary hover:underline"
          data-test-id="back-to-login-link"
        >
          Wróć do logowania
        </a>
      </div>
    </form>
  );
}

export default RegisterForm;
