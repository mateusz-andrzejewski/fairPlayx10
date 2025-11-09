# API Endpoint Implementation Plan: DELETE /api/users/{id}

## 1. Przegląd punktu końcowego

- Cel: umożliwić administratorom soft delete konta użytkownika, tak aby dane zostały ukryte dla reszty systemu, przy zachowaniu spójności powiązanych rekordów.
- Implementacja w Astro jako serverless handler `src/pages/api/users/[id]/delete.ts` (lub analogiczny plik), koniecznie z `export const prerender = false`.
- Operacja polega na ustawieniu znacznika `deleted_at` (wymaga dodania kolumny w tabeli `users`) oraz ewentualnym cofnięciu statusu/połączeń zależnych.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE.
- Struktura URL: `/api/users/{id}` gdzie `{id}` odpowiada rekordowi w Supabase (`SERIAL` wg planu bazy; zweryfikować ewentualne przejście na UUID).
- Nagłówki wymagane: `Authorization: Bearer <JWT>`, `Accept: application/json`.
- Parametry:
  - Wymagane (path): `id` – koercja do liczby całkowitej > 0.
  - Opcjonalne: brak.
- Body: brak.
- Idempotencja: ponowne wywołanie na już usuniętym koncie powinno zwrócić 404 (brak aktywnego rekordu).

## 3. Wykorzystywane typy

- `UserRow` / `Tables<"users">` oraz `UserDTO` z `src/types.ts` (mapowanie kolumn i walidacja stanu).
- `SupabaseClient` eksportowany z `src/db/supabase.client.ts` (do interakcji z bazą w serwisie).
- `UserStatus` enum (ew. wymuszenie statusu końcowego po soft delete).
- Nowy typ pomocniczy `SoftDeleteUserResult` (np. `{ deleted: boolean; userId: number; }`) zwracany przez serwis w celu kontrolowania logiki HTTP.
- Dla audytu rozszerzone `AuditAction` o wartość `user_deleted` oraz struktura payloadu (np. `{ previousStatus, previousRole }`).

## 4. Szczegóły odpowiedzi

- 204 No Content: sukces operacji soft delete (brak payloadu).
- 400 Bad Request: naruszenia walidacji parametru `id` lub konflikt biznesowy (np. próba usunięcia samego siebie jeśli zabronione – omówić czy użyć 409 zamiast 400).
- 401 Unauthorized: brak tokena lub niezweryfikowany użytkownik (np. `auth.getUser` zwraca błąd).
- 403 Forbidden: zalogowany użytkownik nie ma roli `admin`.
- 404 Not Found: wskazany rekord nie istnieje albo został już soft-deletowany (`deleted_at IS NOT NULL`).
- 500 Internal Server Error: błąd Supabase lub audytu.
- Standardowe nagłówki: `Content-Type: application/json` przy odpowiedziach z ciałem, `Cache-Control: private, no-store` dla spójności polityki.
- (Do potwierdzenia) Czy utrzymać 204 mimo ogólnej wytycznej o 200 – rekomendacja: zachować 204 zgodnie ze specyfikacją REST.

## 5. Przepływ danych

1. Handler w Astro odczytuje `Astro.params.id`, waliduje schematem Zod (`userIdParamSchema`) i konwertuje na liczbę.
2. Pobiera token z nagłówka Authorization, weryfikuje użytkownika przez `context.locals.supabase.auth.getUser(token)` lub istniejący helper auth.
3. Sprawdza, czy zalogowany użytkownik ma rolę `admin`; w przeciwnym razie kończy 403. Opcjonalnie blokuje usunięcie samego siebie.
4. Deleguje logikę do funkcji `softDeleteUser` w `src/lib/services/users.service.ts`, przekazując `SupabaseClient`, `actorId`, `targetId` oraz obecną rolę.
5. Serwis:
   - Pobiera użytkownika `targetId` z kolumnami potrzebnymi do audytu, filtrowany `deleted_at IS NULL`.
   - Jeżeli brak rekordu, zwraca kod dla 404.
   - Aktualizuje rekord `users` wywołaniem `.update({ deleted_at: new Date().toISOString(), status: 'pending', player_id: null })` (ustalenie czy resetować `status`/`player_id` wymaga potwierdzenia biznesowego).
   - Ustawia także `updated_at = now()` (jeśli Supabase nie robi tego automatycznie) i zapewnia idempotencję przez warunek `.eq("deleted_at", null)` lub RPC.
   - Wstawia zapis do `audit_logs` (`action_type = 'user_deleted'`, `changes` z poprzednim stanem) używając transakcji RPC lub dwóch kroków z kontrolą błędów.
6. Serwis zwraca wynik do handlera; handler serializuje status 204 lub mapuje błędy kontrolowane na HTTP.
7. Niezłapane wyjątki są logowane (`logger.error`) i kończą się 500.

## 6. Względy bezpieczeństwa

- Autoryzacja Bearer oraz ról: tylko `admin` może soft-deletować innych, zgodnie z polityką RLS (`FOR ALL`).
- RLS dla tabeli `users` należy rozszerzyć o warunek `deleted_at IS NULL` (dla operacji SELECT/UPDATE), aby usunięte konta nie były widoczne oraz aby aktualizacja była możliwa tylko na aktywnych rekordach.
- Dodanie kolumny `deleted_at` wymaga uzupełnienia migracji oraz nadania indeksu filtrowanego (`idx_users_deleted_at`) dla zapytań.
- Logowanie audytowe umożliwia śledzenie kto i kogo usunął; wpis powinien maskować dane wrażliwe i przechowywać IP (jeżeli dostępne).
- Rozważyć ochronę przed samousunięciem admina (zakończyć 409) oraz przed usuwaniem ostatniego aktywnego admina – do ustalenia z biznesem.
- Zadbać o brak wycieków danych w komunikatach błędów (generować przyjazne, generyczne treści).

## 7. Obsługa błędów

- Walidacja Zod → w handlerze zwrócić 400 z `{ error: "validation_error", message, details }`.
- Brak lub zły token → 401 `{ error: "unauthorized", message: "Authentication required" }`.
- Brak uprawnień → 403 `{ error: "forbidden", message: "Admin role required" }`.
- Użytkownik nie istnieje / już usunięty → 404 `{ error: "not_found", message: "User not found" }` (lub doprecyzowana treść bez zdradzania stanu).
- Konflikt biznesowy (np. próba usunięcia samego siebie) → 409 `{ error: "conflict", message: "Cannot delete own account" }` jeśli scenariusz zostanie przyjęty.
- Błędy Supabase/audytu → logować (`logger.error({ scope: "DELETE /api/users", actorId, targetId, error })`) i zwracać 500 `{ error: "internal_error", message: "Unexpected server error" }`.
- Brak dedykowanej tabeli błędów → decyzja: pozostajemy przy centralnym loggerze lub dodajemy osobną tabelę w przyszłej iteracji.

## 8. Rozważania dotyczące wydajności

- Operacje po kluczu głównym są tanie; filtr `deleted_at IS NULL` wymaga indeksu częściowego dla zachowania szybkości.
- Idempotentna aktualizacja (`.eq("deleted_at", null)`) zapobiega powtórnej pracy i minimalizuje konflikty.
- Unikaj dodatkowych zapytań – łącz pobranie i aktualizację w jednej transakcji (Supabase `rpc` lub `select().single()` + `update`) w zależności od wsparcia.
- Audyt może być kosztowny przy dużym natężeniu – w razie potrzeby użyć kolejek lub batchowania (poza zakresem MVP, ale uwzględnić w roadmapie).

## 9. Etapy wdrożenia

1. Przygotuj migrację Supabase dodającą `deleted_at TIMESTAMPTZ` do `users`, indeks częściowy `idx_users_deleted_at`, aktualizację RLS (`USING deleted_at IS NULL`) oraz rozszerzenie enum `audit_action` o `user_deleted`.
2. Zaktualizuj generowane typy (`src/db/database.types.ts`) i ewentualnie `UserDTO`/powiązane typy, aby uwzględnić nową kolumnę (opcjonalnie jeśli DTO ma ją ignorować).
3. Dodaj schemat walidacji `userIdParamSchema` w `src/lib/validation/users.ts` (lub istniejącym module) z koercją i kontrolą zakresu.
4. Rozszerz `src/lib/services/users.service.ts` o funkcję `softDeleteUser(client, actor, id)` implementującą logikę z sekcji 5, oraz centralizującą mapowanie błędów (np. poprzez dedykowane klasy `NotFoundError`, `ForbiddenError`).
5. Utwórz lub zaktualizuj endpoint Astro w `src/pages/api/users/[id].ts` lub `src/pages/api/users/[id]/delete.ts`: obsługa auth, walidacji, wywołania serwisu oraz mapowanie wyjątków na kody HTTP (204/4xx/5xx).
6. Dodaj logikę audytu w serwisie (wpis do `audit_logs`) z zabezpieczeniem przed rollbackiem – w razie błędu audytu przywróć aktualizację lub zgłoś 500.
7. Przygotuj testy jednostkowe dla walidacji i serwisu (mock Supabase) oraz test integracyjny endpointu (scenariusze 204, 403, 404, konflikt samousunięcia).
8. Upewnij się, że lint/test przechodzą (`npm run lint`, `npm run test`) i zaktualizuj dokumentację (`.ai/api-plan.md`) jeśli wprowadzono zmiany w kontrakcie (np. nowy kod 409).
