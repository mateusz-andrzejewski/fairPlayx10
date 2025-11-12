import { CheckCircleIcon } from "lucide-react";

export function SuccessMessage() {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Rejestracja zakończona sukcesem!</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Wysłaliśmy link potwierdzający na Twój adres email. Kliknij w link, aby aktywować konto.
          </p>
          <p>
            Po potwierdzeniu email Twoje konto będzie oczekiwać na zatwierdzenie przez administratora.
            Zazwyczaj trwa to mniej niż 24&nbsp;godziny.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 pt-1">
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Przejdź do logowania
        </a>
        <a href="/" className="text-xs text-muted-foreground hover:text-primary">
          Wróć na stronę główną
        </a>
      </div>
    </div>
  );
}


