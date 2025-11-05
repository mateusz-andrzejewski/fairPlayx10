# API Endpoint Implementation Plan: GET /api/events/{eventId}/teams

## 1. Przegląd punktu końcowego

Zwraca listę przypisań drużynowych dla danego wydarzenia, umożliwiając organizerom i administratorom wgląd w aktualny podział uczestników na drużyny.

## 2. Szczegóły żądania

- Metoda HTTP: `GET`
- Struktura URL: `/api/events/{eventId}/teams`
- Parametry:
  - Wymagane: `eventId` (parametr ścieżki, dodatnia liczba całkowita)
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy

- `TeamAssignmentDTO` do reprezentacji pojedynczego rekordu przypisania
- `TeamAssignmentsListResponseDTO` jako opakowanie odpowiedzi z listą danych

```164:175:src/types.ts
export type TeamAssignmentDTO = Pick<TeamAssignmentRow, "id" | "signup_id" | "team_number" | "assignment_timestamp">;

export interface TeamAssignmentsListResponseDTO {
  data: TeamAssignmentDTO[];
}
```

## 3. Szczegóły odpowiedzi

- `200 OK` z ciałem zgodnym z `TeamAssignmentsListResponseDTO`
- `401 Unauthorized` gdy brak uwierzytelnionej sesji
- `403 Forbidden` gdy użytkownik nie jest organizatorem wydarzenia ani administratorem
- `404 Not Found` gdy wydarzenie nie istnieje lub jest niewidoczne z powodu RLS
- `500 Internal Server Error` dla nieoczekiwanych błędów Supabase lub logiki

## 4. Przepływ danych

1. Endpoint `src/pages/api/events/[eventId]/teams.ts` implementuje handler `GET`.
2. Z `context.locals` pobieramy `supabase` oraz informację o uwierzytelnionym użytkowniku/rolach.
3. Walidujemy `eventId` przez schemat Zod (`eventIdParamSchema`) upewniając się, że to dodatnia liczba całkowita.
4. Wywołujemy `teamAssignmentsService.listAssignments(eventId, authContext)` (nowy moduł `src/lib/services/team-assignments.service.ts`).
5. Serwis:
   - Sprawdza istnienie wydarzenia i uprawnienia (admin lub organizer przypisany do wydarzenia) korzystając z `events`.
   - Pobiera przypisania z `team_assignments` dołączając `event_signups` przez `signup_id` w celu filtrowania po `event_id`.
   - Mapuje wyniki do `TeamAssignmentDTO`.
6. Handler zwraca `200` wraz z listą przypisań (pusta tablica, jeśli brak przypisań).
7. Wszystkie błędy kontrolowane przekładamy na wspólne wyjątki (`ForbiddenError`, `NotFoundError`, `ValidationError`).

## 5. Względy bezpieczeństwa

- Wymagana sesja Supabase; brak sesji → `401`.
- Walidacja roli użytkownika (tylko `admin` lub organizer wydarzenia) przed zapytaniem do Supabase, aby uniknąć niejednoznacznych odpowiedzi RLS.
- Filtrujemy wyniki po `event_id`, aby wykluczyć wycieki danych innych wydarzeń.
- Zwracamy jedynie niezbędne pola DTO, zgodne ze specyfikacją.

## 6. Obsługa błędów

- Błędny `eventId` lub niespełnione walidacje Zod → `400` z komunikatem o walidacji.
- Brak uprawnień → `403`.
- Wydarzenie niewidoczne lub nieistniejące → `404`.
- Błędy Supabase (sieć, RLS) logujemy (`logger.error`) i mapujemy na `500` z identyfikatorem korelacji.

## 7. Rozważania dotyczące wydajności

- Korzystamy z indeksu `idx_team_assignments_signup`/`idx_team_assignments_event_team` dla filtrowania po `signup_id`.
- Pobieramy tylko wymagane kolumny, bez nadmiarowych `select *`.
- Możliwe cache’owanie w warstwie aplikacji (do rozważenia w przyszłości); obecnie dane są wrażliwe, więc brak publicznego cache.

## 8. Etapy wdrożenia

1. Dodać Zod `eventIdParamSchema` w module walidacji (np. `src/lib/validation/events.ts`).
2. Utworzyć `src/lib/services/team-assignments.service.ts` z funkcją `listAssignments` realizującą logikę Supabase.
3. Zaimplementować handler `GET` w `src/pages/api/events/[eventId]/teams.ts`, wykorzystujący nowy serwis i wspólne formatowanie odpowiedzi.
4. Pokryć logikę testami (mock Supabase) oraz dodać testy kontraktowe endpointu (Vitest + supertest/fetch).
5. Zintegrować logowanie błędów przez centralny logger; upewnić się, że identyfikatory korelacji trafiają do odpowiedzi przy `500`.
6. Zaktualizować dokumentację API (OpenAPI/README) dla nowego endpointu.

