import { useEffect } from "react";
import { toast } from "sonner";

interface ErrorToastProps {
  message: string | null;
}

function ErrorToast({ message }: ErrorToastProps) {
  useEffect(() => {
    if (message) {
      let title = "Błąd logowania";
      let description = message;

      // Customize title based on error type
      if (message.includes("limit czasu")) {
        title = "Przekroczono limit czasu";
      } else if (message.includes("połączenia") || message.includes("sieci")) {
        title = "Błąd połączenia";
      } else if (message.includes("email") || message.includes("hasło") || message.includes("dane")) {
        title = "Nieprawidłowe dane";
      } else if (message.includes("zatwierdzenia")) {
        title = "Konto oczekuje zatwierdzenia";
      }

      toast.error(title, {
        description,
        duration: 6000,
      });
    }
  }, [message]);

  // This component doesn't render anything visible - it just triggers toasts
  return null;
}

export { ErrorToast };
