import { useEffect, useState } from "react";
import { useAuth, AuthClientError } from "../lib/hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { ErrorToast } from "./ErrorToast";
import type { LoginRequest, LoginViewModel } from "../types";

function LoginView() {
  const { login, isAuthenticated } = useAuth();
  const [viewModel, setViewModel] = useState<LoginViewModel>({
    email: "",
    password: "",
    isLoading: false,
    error: null,
  });

  // Dodaj sprawdzenie czy jesteśmy po stronie klienta
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      window.location.assign("/dashboard");
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = async (loginRequest: LoginRequest) => {
    setViewModel((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await login(loginRequest);

      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
      }));
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 50);
    } catch (error) {
      let errorMessage = "Wystąpił błąd podczas logowania";

      if (error instanceof AuthClientError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const updateViewModel = (updates: Partial<LoginViewModel>) => {
    setViewModel((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <>
      <LoginForm viewModel={viewModel} onViewModelChange={updateViewModel} onSubmit={handleLoginSubmit} />
      <ErrorToast message={viewModel.error} />
    </>
  );
}

export default LoginView;
