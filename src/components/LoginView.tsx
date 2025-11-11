import { useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { ErrorToast } from "./ErrorToast";
import type { LoginRequest, LoginViewModel } from "../types";

function LoginView() {
  const { login } = useAuth();
  const [viewModel, setViewModel] = useState<LoginViewModel>({
    email: "",
    password: "",
    isLoading: false,
    error: null,
  });

  const handleLoginSubmit = async (loginRequest: LoginRequest) => {
    setViewModel(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await login(loginRequest);

      // Success - redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      let errorMessage = "Wystąpił błąd podczas logowania";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setViewModel(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const updateViewModel = (updates: Partial<LoginViewModel>) => {
    setViewModel(prev => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <>
      <LoginForm
        viewModel={viewModel}
        onViewModelChange={updateViewModel}
        onSubmit={handleLoginSubmit}
      />
      <ErrorToast message={viewModel.error} />
    </>
  );
}

export default LoginView;
