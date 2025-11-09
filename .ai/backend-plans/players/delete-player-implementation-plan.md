# API Endpoint Implementation Plan: DELETE /api/players/{id}

## 1. Przegląd punktu końcowego

- Cel: miękkie usunięcie gracza poprzez ustawienie `deleted_at`, dostępne wyłącznie dla administratorów.
- Warstwa HTTP: `src/pages/api/players/[id].ts` (obsługa metody DELETE).
- Logika domenowa: `softDeletePlayer` w `src/lib/services/players.service.ts`.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- Struktura URL: `/api/players/{id}`
- Parametry:
  - Wymagane: `id` w ścieżce (int > 0)
  - Opcjonalne: brak
- Request Body: brak
- Nagłówki: `Authorization: Bearer <JWT>`

## 3. Wykorzystywane typy

- Można użyć `PlayerDTO` (jeśli zwracamy payload diagnostyczny) lub brak.
- Standardowy `ApiErrorResponse`.

## 3. Szczegóły odpowiedzi

- Status 204: brak treści (sukces)
- Status 400: `validation_error` dla nieprawidłowego `id`
- Status 401: `unauthorized`
- Status 403: `forbidden` gdy rola ≠ `admin`
- Status 404: `not_found` jeżeli gracz nie istnieje lub już soft-deleted
- Status 500: `internal_error`

## 4. Przepływ danych

1. Handler weryfikuje metodę i autoryzację (`admin` tylko).
2. Waliduje `params.id` (Zod `playerIdParamSchema`).
3. Wywołuje `softDeletePlayer(supabase, id)`.
4. Serwis wykonuje `update({ deleted_at: new Date().toISOString() })` z warunkiem `.eq("id", id).is("deleted_at", null).select("id").maybeSingle()`.
5. Brak rekordu → null → handler zwraca 404.
6. Sukces → handler odpowiada 204 (brak body) oraz `cache-control: no-store`.
7. Opcjonalnie loguje operację (audit trail) w osobnej tabeli.

## 5. Względy bezpieczeństwa

- Ścisła autoryzacja do roli `admin`.
- Audyt operacji (jeśli system wymaga) – zapis do logów/tabeli działań.
- Idempotencja: wymuś 404 dla rekordów już soft-deleted, aby uniknąć leaków stanu.
- Zapobiegaj twardemu usunięciu – nie używać `delete()`.

## 6. Obsługa błędów

- Nieprawidłowe `id` → 400.
- Brak tokena → 401.
- Brak uprawnień → 403.
- Brak gracza → 404.
- Błędy Supabase → log + 500 (zawiera `error.message`).
- Jeżeli występuje tabela błędów, zapisz wpis z `action = "delete_player"`, `user_id`, `player_id` i detalami błędu.

## 7. Rozważania dotyczące wydajności

- Aktualizacja pojedynczego rekordu – minimalne obciążenie.
- Upewnij się, że `deleted_at` ma indeks, aby przyspieszyć późniejsze wyszukiwania aktywnych graczy.
- Brak dodatkowych danych w odpowiedzi redukuje ruch.

## 8. Etapy wdrożenia

1. Zapewnić `playerIdParamSchema` w `src/lib/validation/players.ts` (jeśli nie istnieje).
2. Dodać `softDeletePlayer` do `players.service.ts` z logiką opisane w sekcji 4.
3. Rozszerzyć `src/pages/api/players/[id].ts` o obsługę DELETE: autoryzacja admin, walidacja id, wywołanie serwisu, mapowanie odpowiedzi.
4. Dodać testy jednostkowe/integracyjne dla serwisu (sukces, brak rekordu, soft-deleted) oraz endpointu (403, 404, 204).
5. Upewnić się, że linter/testy przechodzą i uaktualnić dokumentację.
