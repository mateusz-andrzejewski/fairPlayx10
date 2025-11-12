import { type FormEvent, useState } from "react";
import { EmailInput } from "./ui/email-input";
import { PasswordInput } from "./ui/password-input";
import { LoginButton } from "./LoginButton";
import { RegisterLink } from "./RegisterLink";
import type { LoginRequest, LoginViewModel } from "../types";
import { loginSchema } from "../lib/validation/auth";

interface LoginFormProps {
  viewModel: LoginViewModel;
  onViewModelChange: (updates: Partial<LoginViewModel>) => void;
  onSubmit: (loginRequest: LoginRequest) => void;
}

function LoginForm({ viewModel, onViewModelChange, onSubmit }: LoginFormProps) {
  const [validationErrors, setValidationErrors] = useState<{
    email?: string[];
    password?: string[];
  }>({});

  const handleEmailChange = (value: string) => {
    onViewModelChange({ email: value });

    // Clear email validation error when user starts typing
    if (validationErrors.email) {
      setValidationErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    onViewModelChange({ password: value });

    // Clear password validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors((prev) => ({
        ...prev,
        password: undefined,
      }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    const result = loginSchema.safeParse({
      email: viewModel.email,
      password: viewModel.password,
    });

    if (!result.success) {
      const errors: { email?: string[]; password?: string[] } = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof typeof errors;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field]!.push(error.message);
      });
      setValidationErrors(errors);
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    // Submit form
    onSubmit({
      email: result.data.email,
      password: result.data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-4">
        <EmailInput value={viewModel.email} onChange={handleEmailChange} error={validationErrors.email} />

        <PasswordInput value={viewModel.password} onChange={handlePasswordChange} error={validationErrors.password} />
      </div>

      <div className="flex items-center justify-end">
        <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Zapomniałeś hasła?
        </a>
      </div>

      <LoginButton disabled={viewModel.isLoading} isLoading={viewModel.isLoading} />

      <RegisterLink />
    </form>
  );
}

export { LoginForm };
