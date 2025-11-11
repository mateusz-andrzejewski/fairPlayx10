import { CheckCircleIcon } from "lucide-react";

export function SuccessMessage() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Rejestracja zakończona sukcesem!
        </h3>
        <p className="text-sm text-gray-600">
          Twoje konto zostało utworzone i oczekuje na zatwierdzenie przez administratora.
          Otrzymasz powiadomienie na adres email po zatwierdzeniu konta.
        </p>
      </div>
      <div className="pt-4">
        <p className="text-xs text-gray-500">
          Możesz teraz zamknąć tę stronę lub przejść do{" "}
          <a href="/" className="text-primary hover:underline">
            strony głównej
          </a>
        </p>
      </div>
    </div>
  );
}

