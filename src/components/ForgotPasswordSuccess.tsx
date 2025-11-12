import { MailCheckIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "./ui/button";

interface ForgotPasswordSuccessProps {
  email: string;
  onRetry?: () => void;
}

export function ForgotPasswordSuccess({ email, onRetry }: ForgotPasswordSuccessProps) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
        <MailCheckIcon className="h-6 w-6 text-sky-700" />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Instrukcje resetu zostały wysłane</h3>
        <p className="text-sm text-muted-foreground">
          Wysłaliśmy wiadomość pod adres <span className="font-medium text-foreground break-all">{email}</span>.
          Postępuj zgodnie z instrukcjami w wiadomości, aby ustawić nowe hasło.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-center">
        <Button asChild className="w-full sm:w-auto">
          <a href="/login">Powrót do logowania</a>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full gap-2 text-sm text-primary hover:text-primary sm:w-auto"
          onClick={onRetry}
          disabled={!onRetry}
        >
          <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
          Wyślij ponownie
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Nie widzisz wiadomości? Sprawdź folder spam lub oferty. Link resetujący wygaśnie po 60 minutach.
      </p>
    </div>
  );
}
