# Plan implementacji widoku błędu 500

## 1. Przegląd

Widok błędu 500 to strona przeznaczona do obsługi błędów serwera (HTTP 500 Internal Server Error) w aplikacji Platforma FairPlay. Celem tego widoku jest zapewnienie użytkownikowi przyjaznej informacji o wystąpieniu błędu, możliwości ponowienia próby oraz bezpiecznego powrotu do aplikacji. Widok powinien być responsywny, dostępny zgodnie z WCAG 2.1 i zgodny z architekturą UI aplikacji opartą na Astro, React i Tailwind CSS.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/500` lub jako fallback dla błędów 500 w aplikacji Astro. W Astro można skonfigurować globalną obsługę błędów za pomocą `src/pages/500.astro` lub obsługi w middleware.

## 3. Struktura komponentów

- **ErrorPage**: Główny komponent strony błędu, odpowiedzialny za layout i zarządzanie stanem.
- **ErrorMessage**: Komponent wyświetlający tytuł i opis błędu.
- **RetryButton**: Przycisk umożliwiający ponowienie akcji, która spowodowała błąd.
- **BackToDashboardLink**: Link nawigacyjny do powrotu na dashboard główny.

## 4. Szczegóły komponentów

### ErrorPage

- **Opis komponentu**: Główny komponent widoku błędu 500, zbudowany jako strona Astro z opcjonalnymi komponentami React dla interaktywności. Odpowiada za renderowanie całego layoutu strony błędu, zarządzanie stanem błędu oraz obsługę akcji użytkownika.
- **Główne elementy**: Kontener główny z tłem, sekcja z ikoną błędu, komponent ErrorMessage, przycisk RetryButton oraz link BackToDashboardLink. Używa Tailwind dla stylowania responsywnego.
- **Obsługiwane zdarzenia**: onRetry (ponowienie próby poprzez odświeżenie strony lub nawigację wsteczną), onBackToDashboard (nawigacja do `/dashboard`).
- **Warunki walidacji**: Brak bezpośredniej walidacji; komponent sprawdza obecność propsów i stanu błędu.
- **Typy**: ErrorPageProps (opcjonalne props dla customizacji), ErrorViewModel dla stanu wewnętrznego.
- **Propsy**: { error?: ErrorDTO, showRetry?: boolean } - komponent przyjmuje opcjonalne dane błędu i flagę wyświetlania przycisku retry.

### ErrorMessage

- **Opis komponentu**: Komponent React wyświetlający tytuł i opis błędu w sposób czytelny dla użytkownika.
- **Główne elementy**: Nagłówek (h1) z tytułem błędu, paragraf z opisem, opcjonalnie ikona ostrzeżenia z Shadcn/ui.
- **Obsługiwane zdarzenia**: Brak zdarzeń; komponent jest statyczny.
- **Warunki walidacji**: Wymaga props title i description jako niepuste stringi.
- **Typy**: ErrorMessageProps { title: string, description: string }.
- **Propsy**: { title: string, description: string } - tytuł i opis błędu do wyświetlenia.

### RetryButton

- **Opis komponentu**: Przycisk z Shadcn/ui umożliwiający ponowienie akcji, która spowodowała błąd.
- **Główne elementy**: Przycisk z tekstem "Spróbuj ponownie" i opcjonalną ikoną, używający Button z Shadcn/ui.
- **Obsługiwane zdarzenia**: onClick - wywołuje funkcję retry przekazaną jako prop.
- **Warunki walidacji**: Funkcja retry musi być przekazana i być typu function.
- **Typy**: RetryButtonProps { onRetry: () => void, disabled?: boolean }.
- **Propsy**: { onRetry: () => void, disabled?: boolean } - funkcja do wykonania przy kliknięciu i opcjonalna flaga disabled.

### BackToDashboardLink

- **Opis komponentu**: Link nawigacyjny do powrotu na dashboard główny, zbudowany z komponentu Link z Astro lub React Router.
- **Główne elementy**: Link z tekstem "Powrót do dashboardu" i ikoną strzałki wstecz.
- **Obsługiwane zdarzenia**: onClick - nawigacja do `/dashboard`.
- **Warunki walidacji**: Brak; link jest zawsze dostępny.
- **Typy**: Brak dodatkowych typów; używa standardowych propsów Link.
- **Propsy**: Brak propsów; komponent jest samodzielny.

## 5. Typy

Szczegółowy opis wymaganych typów dla implementacji widoku błędu 500:

```typescript
// DTO dla błędów API, zgodne z istniejącymi endpointami
export interface ErrorDTO {
  error: string; // Kod błędu, np. "internal_error"
  message: string; // Krótka wiadomość dla użytkownika
  details?: string; // Opcjonalne szczegóły techniczne (tylko dla debugowania)
}

// ViewModel dla widoku błędu, używany wewnętrznie przez komponenty
export interface ErrorViewModel {
  title: string; // Tytuł do wyświetlenia, np. "Wystąpił błąd serwera"
  description: string; // Opis błędu dla użytkownika
  showRetry: boolean; // Czy wyświetlić przycisk retry
  retryAction: () => void; // Funkcja do wykonania przy retry
}

// Propsy dla głównych komponentów
export interface ErrorPageProps {
  error?: ErrorDTO; // Opcjonalne dane błędu (np. z kontekstu Astro)
  showRetry?: boolean; // Domyślnie true
}

export interface ErrorMessageProps {
  title: string;
  description: string;
}

export interface RetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
}
```

## 6. Zarządzanie stanem

Zarządzanie stanem w widoku błędu 500 jest proste, ponieważ strona jest głównie statyczna. Stan jest zarządzany lokalnie w komponencie ErrorPage za pomocą hooka useState z React. Nie jest wymagany customowy hook, ale można utworzyć opcjonalny `useErrorHandler` dla ponownego użycia w innych miejscach aplikacji. Hook ten może obsługiwać parsowanie błędów z API i ustawianie odpowiedniego ViewModel.

Przykładowe użycie:

- Stan: `const [errorState, setErrorState] = useState<ErrorViewModel>({ ... });`
- Hook: `useErrorHandler` - przyjmuje ErrorDTO i zwraca ErrorViewModel, obsługuje mapowanie kodów błędów na przyjazne wiadomości.

## 7. Integracja API

Widok błędu 500 nie integruje się bezpośrednio z API, ponieważ jest przeznaczony do obsługi błędów z API. Jednak komponenty mogą przyjmować dane błędu z kontekstu Astro (np. z `Astro.props` lub middleware). Typy żądania i odpowiedzi dotyczą ogólnych błędów API:

- **Żądanie**: Brak bezpośredniego żądania; błąd pochodzi z poprzedniego wywołania API.
- **Odpowiedź**: ErrorDTO z kodami takimi jak "internal_error", "validation_error", gdzie error === "internal_error" wyzwala widok 500.

## 8. Interakcje użytkownika

Szczegółowy opis interakcji użytkownika i ich obsługi:

1. **Wyświetlenie strony błędu**: Użytkownik zostaje przekierowany na `/500` po wystąpieniu błędu 500 w API lub aplikacji. Strona wyświetla przyjazną wiadomość z tytułem "Wystąpił błąd serwera" i opisem "Przepraszamy, coś poszło nie tak. Spróbuj ponownie za chwilę.".
2. **Kliknięcie "Spróbuj ponownie"**: Przycisk wywołuje funkcję retry, która odświeża stronę (window.location.reload()) lub nawiguje wstecz w historii przeglądarki. Po akcji użytkownik zostaje przekierowany do poprzedniej strony.
3. **Kliknięcie "Powrót do dashboardu"**: Link nawiguje użytkownika do `/dashboard`, zapewniając bezpieczny powrót do głównej części aplikacji.
4. **Dostępność**: Wszystkie elementy obsługują nawigację klawiszową (Tab), screen readery (ARIA labels) i są responsywne na urządzenia mobilne.

## 9. Warunki i walidacja

Warunki weryfikowane przez interfejs dotyczą głównie obecności danych i poprawności akcji. Komponenty weryfikują:

- **ErrorPage**: Sprawdza obecność props error; jeśli nieobecne, używa domyślnego ErrorViewModel. Waliduje, czy showRetry jest boolean.
- **ErrorMessage**: Wymaga niepustych stringów title i description; waliduje długość (max 200 znaków dla description).
- **RetryButton**: Sprawdza, czy onRetry jest funkcją; disabled blokuje kliknięcie jeśli true.
- **BackToDashboardLink**: Brak walidacji; zawsze dostępny.

Warunki wpływają na stan interfejsu: jeśli retry nie jest dostępne, przycisk jest ukryty; błędne dane powodują wyświetlenie domyślnego komunikatu błędu.

## 10. Obsługa błędów

Potencjalne błędy lub przypadki brzegowe:

- **Błąd w ładowaniu strony**: Jeśli sama strona 500 nie ładuje się, użytkownik zobaczy domyślny błąd przeglądarki.
- **Brak kontekstu błędu**: Jeśli nie przekazano ErrorDTO, użyj domyślnego komunikatu.
- **Retry nie działa**: Jeśli odświeżenie nie rozwiązuje problemu, użytkownik może użyć linku powrotu.
- **Dostępność**: Upewnij się, że komunikaty błędów są czytelne; użyj toastów dla dodatkowych błędów jeśli potrzebne.

Obsługa: Wszystkie komponenty mają fallback dla błędnych danych; błędy są logowane w konsoli (console.error) dla debugowania.

## 11. Kroki implementacji

1. Utwórz plik `src/pages/500.astro` dla strony błędu w Astro.
2. Zaimplementuj komponenty React: `ErrorMessage.tsx`, `RetryButton.tsx`, `BackToDashboardLink.tsx` w `src/components/`.
3. Dodaj typy w `src/types.ts`: ErrorDTO, ErrorViewModel i propsy komponentów.
4. W `ErrorPage.astro` zintegruj komponenty z layoutem i zarządzaniem stanem.
5. Dodaj stylowanie Tailwind dla responsywności i dostępności (ARIA roles).
6. Przetestuj obsługę błędów: symuluj błąd 500 w endpointach API i sprawdź przekierowanie.
7. Dodaj opcjonalny hook `useErrorHandler` w `src/lib/hooks/` dla ponownego użycia.
8. Przeprowadź testy dostępności: sprawdź nawigację klawiszową i screen readery.
9. Zintegruj z middleware Astro dla automatycznego przekierowania na błędy 500.
10. Dokumentuj komponenty i typy w komentarzach kodu.
