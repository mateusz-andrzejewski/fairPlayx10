import { useLoginForm } from "../lib/hooks/useLoginForm";
import { EmailInput } from "./ui/email-input";
import { PasswordInput } from "./ui/password-input";
import { SubmitButton } from "./ui/submit-button";

function LoginForm() {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EmailInput
        value={formData.email}
        onChange={(value) => handleChange("email", value)}
        error={errors.email}
      />

      <PasswordInput
        value={formData.password}
        onChange={(value) => handleChange("password", value)}
        error={errors.password}
      />

      <SubmitButton disabled={isSubmitting} isLoading={isSubmitting}>
        Zaloguj się
      </SubmitButton>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Nie masz jeszcze konta?{" "}
          <a
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Zarejestruj się
          </a>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;
