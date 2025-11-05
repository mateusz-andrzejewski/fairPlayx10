# API Endpoint Implementation Plan: User Management Endpoints

## 1. Przegląd punktu końcowego
Endpointy zarządzania użytkownikami obejmują kompletny CRUD dla zasobów użytkowników w systemie FairPlay. Implementacja obsługuje listowanie użytkowników z zaawansowanymi filtrami, pobieranie szczegółów, zatwierdzanie kont oraz soft delete. Wszystkie operacje są chronione kontrolą dostępu opartą na rolach, z priorytetem bezpieczeństwa i integralności danych.

## 2. Szczegóły żądania

### GET /api/users
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/users`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**:
    - `page` (integer, default: 1) - Numer strony dla paginacji
    - `limit` (integer, default: 20) - Liczba elementów na stronę (max 100)
    - `status` (enum: pending, approved) - Filtrowanie po statusie
    - `role` (enum: admin, organizer, player) - Filtrowanie po roli
    - `search` (string) - Wyszukiwanie po first_name, last_name lub email (min 3 znaki)
- **Request Body**: brak

### GET /api/users/{id}
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/users/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**: brak

### PATCH /api/users/{id}/approve
- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/users/{id}/approve`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**:
```json
{
  "role": "player",
  "player_id": 123
}
```

### DELETE /api/users/{id}
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/users/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**: brak

## 3. Wykorzystywane typy
- **DTOs**: `UserDTO`, `UsersListResponseDTO`
- **Query Parameters**: `ListUsersQueryParams`
- **Command Models**: `ApproveUserCommand`
- **Enums**: `UserRole`, `UserStatus`
- **Database Types**: `Tables<"users">`, `TablesInsert<"users">`, `TablesUpdate<"users">`

## 4. Szczegóły odpowiedzi

### GET /api/users
- **Success Codes**: 200 OK
- **Response Body**:
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "player",
      "status": "approved",
      "player_id": 123,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### GET /api/users/{id}
- **Success Codes**: 200 OK
- **Response Body**: Pojedynczy obiekt `UserDTO` (taka sama struktura jak powyżej)

### PATCH /api/users/{id}/approve
- **Success Codes**: 200 OK
- **Response Body**: Zaktualizowany obiekt `UserDTO`

### DELETE /api/users/{id}
- **Success Codes**: 204 No Content
- **Response Body**: pusty

## 5. Przepływ danych
1. **Uwierzytelnienie**: JWT token weryfikowany przez Astro middleware
2. **Autoryzacja**: Sprawdzenie roli użytkownika w context.locals
3. **Walidacja**: Zod schemas dla parametrów query i request body
4. **Service Layer**: UserService obsługuje logikę biznesową
5. **Database**: Supabase client wykonuje zapytania z RLS policies
6. **Audit Logging**: Krytyczne operacje logowane do audit_logs
7. **Response**: Strukturalizowana odpowiedź z odpowiednim statusem

## 6. Względy bezpieczeństwa
- **Autoryzacja**: JWT-based authentication z kontrolą ról (admin/organizer/player)
- **RLS Policies**: Row Level Security na poziomie bazy danych
- **Input Validation**: Kompleksowa walidacja Zod dla wszystkich wejść
- **IDOR Protection**: Sprawdzenie czy użytkownik ma dostęp do żądanych danych
- **Rate Limiting**: Ograniczenie liczby zapytań dla endpointów listowania
- **Audit Trail**: Wszystkie zmiany logowane dla compliance
- **SQL Injection Protection**: Parametryzowane zapytania przez Supabase

## 7. Obsługa błędów

### Scenariusze błędów i odpowiedzi:

**400 Bad Request**:
- Nieprawidłowa wartość roli w approve (nie z enum)
- Nieprawidłowy format player_id
- Nieistniejący player_id w bazie danych
- Nieprawidłowe parametry paginacji (ujemne wartości)

**401 Unauthorized**:
- Brak JWT token
- Nieprawidłowy/expired JWT token

**403 Forbidden**:
- Użytkownik bez roli admin próbuje dostępu
- Próba dostępu do cudzego profilu (bez uprawnień admin)

**404 Not Found**:
- Użytkownik o podanym ID nie istnieje
- Użytkownik został soft-deleted

**409 Conflict**:
- Próba zatwierdzenia już zatwierdzonego użytkownika

**500 Internal Server Error**:
- Błędy połączenia z bazą danych
- Nieoczekiwane błędy podczas operacji na danych
- Błędy audit logging

Wszystkie błędy zawierają strukturalizowaną odpowiedź z kodem błędu i opisem.

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Wykorzystanie indeksów na email, status, role dla szybkich filtrów
- **Paginacja**: Cursor-based pagination dla dużych zbiorów danych
- **Caching**: Cache dla często używanych danych użytkowników
- **Connection Pooling**: Supabase obsługuje pooling automatycznie
- **Query Optimization**: Używanie select tylko potrzebnych pól
- **Search Optimization**: Full-text search dla pola search z limitami długości

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie infrastruktury
1. Utworzenie `src/lib/services/userService.ts` z podstawowymi metodami
2. Implementacja Zod schemas w `src/lib/validation/userSchemas.ts`
3. Dodanie typów audit logging do `src/types.ts`

### Faza 2: Implementacja GET /api/users
4. Utworzenie `src/pages/api/users/index.ts`
5. Implementacja middleware autoryzacji dla roli admin
6. Dodanie walidacji parametrów query
7. Implementacja logiki filtrowania i paginacji w UserService
8. Testowanie z różnymi parametrami filtrów

### Faza 3: Implementacja GET /api/users/{id}
9. Utworzenie `src/pages/api/users/[id].ts`
10. Implementacja logiki sprawdzania dostępu (admin lub własny profil)
11. Dodanie walidacji ID użytkownika
12. Implementacja obsługi błędów 404

### Faza 4: Implementacja PATCH /api/users/{id}/approve
13. Rozszerzenie `src/pages/api/users/[id]/approve.ts`
14. Implementacja walidacji request body
15. Dodanie logiki biznesowej sprawdzenia statusu użytkownika
16. Implementacja audit logging dla operacji approve
17. Obsługa konfliktów (już zatwierdzony użytkownik)

### Faza 5: Implementacja DELETE /api/users/{id}
18. Dodanie obsługi DELETE w `src/pages/api/users/[id].ts`
19. Implementacja soft delete logiki
20. Dodanie audit logging dla operacji delete
21. Zapewnienie bezpieczeństwa (tylko admin)

### Faza 6: Testowanie i optymalizacja
22. Unit testy dla UserService
23. Integration testy dla wszystkich endpointów
24. Testy bezpieczeństwa (autoryzacja, RLS)
25. Testy wydajności z dużymi zbiorami danych
26. Code review i optymalizacja
27. Dokumentacja API

### Faza 7: Deployment i monitoring
28. Deployment na środowisko testowe
29. Monitoring błędów i wydajności
30. A/B testing jeśli potrzebne
31. Final deployment na produkcję

---

# API Endpoint Implementation Plan: Events Management Endpoints

## 1. Przegląd punktu końcowego
Endpointy zarządzania wydarzeniami obejmują kompletny CRUD dla zasobów wydarzeń w systemie FairPlay. Implementacja obsługuje listowanie wydarzeń z zaawansowanymi filtrami (status, lokalizacja, zakres dat, organizator), pobieranie szczegółów wydarzeń z zapisami, tworzenie nowych wydarzeń, aktualizację istniejących oraz soft delete. Wszystkie operacje są chronione kontrolą dostępu opartą na rolach, gdzie tworzenie i aktualizacja wydarzeń wymaga uprawnień organizatora lub administratora, a usuwanie tylko administratora.

## 2. Szczegóły żądania

### GET /api/events (Lista wydarzeń z filtrami)
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/events`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**:
    - `page` (integer, default: 1) - Numer strony dla paginacji
    - `limit` (integer, default: 20) - Liczba elementów na stronę (max 100)
    - `status` (enum: draft, active, completed) - Filtrowanie po statusie wydarzenia
    - `location` (string) - Filtrowanie po lokalizacji (częściowe dopasowanie)
    - `date_from` (string, ISO 8601) - Filtrowanie wydarzeń od tej daty
    - `date_to` (string, ISO 8601) - Filtrowanie wydarzeń do tej daty
    - `organizer_id` (integer) - Filtrowanie po ID organizatora
- **Request Body**: brak

### GET /api/events/{id} (Szczegóły wydarzenia z zapisami)
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/events/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID wydarzenia
  - **Opcjonalne**: brak
- **Request Body**: brak

### POST /api/events (Tworzenie nowego wydarzenia)
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/events`
- **Parametry**: brak
- **Request Body**:
```json
{
  "name": "Weekend Match",
  "location": "Central Park",
  "event_datetime": "2024-01-15T14:00:00Z",
  "max_places": 22,
  "optional_fee": 10.00
}
```

### PATCH /api/events/{id} (Aktualizacja wydarzenia)
- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/events/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID wydarzenia
  - **Opcjonalne**: brak
- **Request Body**: Częściowy obiekt wydarzenia (wszystkie pola opcjonalne)

### DELETE /api/events/{id} (Soft delete wydarzenia)
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/events/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID wydarzenia
  - **Opcjonalne**: brak
- **Request Body**: brak

## 3. Wykorzystywane typy
- **DTOs**: `EventDTO`, `EventDetailDTO`, `EventsListResponseDTO`
- **Query Parameters**: `ListEventsQueryParams`
- **Command Models**: `CreateEventCommand`, `UpdateEventCommand`
- **Enums**: `EventStatus`
- **Database Types**: `Tables<"events">`, `TablesInsert<"events">`, `TablesUpdate<"events">`
- **Related Types**: `EventSignupDTO`

## 4. Szczegóły odpowiedzi

### GET /api/events
- **Success Codes**: 200 OK
- **Response Body**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Weekend Match",
      "location": "Central Park",
      "event_datetime": "2024-01-15T14:00:00Z",
      "max_places": 22,
      "optional_fee": 10.00,
      "status": "active",
      "current_signups_count": 18,
      "organizer_id": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "deleted_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### GET /api/events/{id}
- **Success Codes**: 200 OK
- **Response Body**: Obiekt `EventDetailDTO` z zagnieżdżonymi zapisami
```json
{
  "id": 1,
  "name": "Weekend Match",
  "location": "Central Park",
  "event_datetime": "2024-01-15T14:00:00Z",
  "max_places": 22,
  "optional_fee": 10.00,
  "status": "active",
  "current_signups_count": 18,
  "organizer_id": 5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "deleted_at": null,
  "signups": [
    {
      "id": 1,
      "event_id": 1,
      "player_id": 10,
      "signup_timestamp": "2024-01-05T10:00:00Z",
      "status": "confirmed",
      "resignation_timestamp": null
    }
  ]
}
```

### POST /api/events
- **Success Codes**: 201 Created
- **Response Body**: Utworzony obiekt `EventDTO`

### PATCH /api/events/{id}
- **Success Codes**: 200 OK
- **Response Body**: Zaktualizowany obiekt `EventDTO`

### DELETE /api/events/{id}
- **Success Codes**: 204 No Content
- **Response Body**: pusty

## 5. Przepływ danych
1. **Uwierzytelnienie**: JWT token weryfikowany przez Astro middleware z Supabase Auth
2. **Autoryzacja**: Sprawdzenie roli użytkownika w context.locals (admin/organizer/player)
3. **Walidacja**: Zod schemas dla parametrów query, URL i request body
4. **Service Layer**: EventService obsługuje logikę biznesową i interakcję z bazą
5. **Database**: Supabase client wykonuje zapytania z RLS policies i constraints
6. **Audit Logging**: Wszystkie operacje modyfikujące logowane do audit_logs
7. **Response**: Strukturalizowana odpowiedź z odpowiednim statusem HTTP

## 6. Względy bezpieczeństwa
- **Autoryzacja**: JWT-based authentication z kontrolą ról (admin/organizer/player)
- **Role-Based Access**: 
  - GET endpoints: wszyscy uwierzytelnieni użytkownicy
  - POST: tylko organizer/admin
  - PATCH: tylko event organizer lub admin
  - DELETE: tylko admin
- **RLS Policies**: Row Level Security na poziomie bazy danych
- **Input Validation**: Kompleksowa walidacja Zod dla wszystkich wejść
- **SQL Injection Protection**: Parametryzowane zapytania przez Supabase
- **Data Integrity**: Database constraints (event_datetime > NOW(), max_places > 0, optional_fee >= 0)
- **Audit Trail**: Wszystkie zmiany logowane dla compliance i śledzenia
- **Soft Delete**: Wydarzenia usuwane miękko z zachowaniem integralności referencji

## 7. Obsługa błędów

### Scenariusze błędów i odpowiedzi:

**400 Bad Request**:
- Nieprawidłowy format daty (event_datetime)
- event_datetime w przeszłości
- max_places <= 0
- optional_fee < 0
- Nieprawidłowe parametry paginacji (ujemne wartości)
- Nieprawidłowy format ID wydarzenia

**401 Unauthorized**:
- Brak JWT token w nagłówku Authorization
- Nieprawidłowy/expired JWT token
- Brak sesji użytkownika

**403 Forbidden**:
- Użytkownik bez roli organizer/admin próbuje utworzyć wydarzenie
- Użytkownik bez roli admin/organizer próbuje aktualizować cudze wydarzenie
- Użytkownik bez roli admin próbuje usunąć wydarzenie
- Próba dostępu do soft-deleted wydarzenia

**404 Not Found**:
- Wydarzenie o podanym ID nie istnieje
- Wydarzenie zostało soft-deleted
- Organizator o podanym ID nie istnieje (przy tworzeniu)

**409 Conflict**:
- Próba aktualizacji wydarzenia z event_datetime w przeszłości
- Próba zmiany statusu na niedozwolony (np. completed -> active)

**422 Unprocessable Entity**:
- Nieprawidłowe dane wejściowe nie przechodzącą walidacji Zod
- Naruszenie constraintów bazy danych

**500 Internal Server Error**:
- Błędy połączenia z bazą danych Supabase
- Nieoczekiwane błędy podczas operacji na danych
- Błędy audit logging (choć nie powinny blokować operacji głównej)

Wszystkie błędy zawierają strukturalizowaną odpowiedź JSON z polami: `error`, `message`, `code` oraz opcjonalnie `details` dla błędów walidacji.

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Wykorzystanie indeksów na event_datetime, status, organizer_id, location dla szybkich filtrów
- **Paginacja**: Offset-based pagination z optymalizacją dla dużych zbiorów
- **Query Optimization**: Select tylko potrzebnych pól, JOIN tylko gdy wymagane
- **Connection Pooling**: Supabase obsługuje pooling automatycznie
- **Caching**: Możliwość cache'owania często wyświetlanych wydarzeń
- **Database Constraints**: CHECK constraints na poziomie bazy dla integralności danych
- **Batch Operations**: Możliwość przyszłego rozszerzenia o batch updates

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie infrastruktury
1. Utworzenie `src/lib/services/eventService.ts` z podstawowymi metodami CRUD
2. Implementacja Zod schemas w `src/lib/validation/eventSchemas.ts`
3. Dodanie utility funkcji dla autoryzacji wydarzeń
4. Aktualizacja `src/types.ts` o potrzebne typy (jeśli brakuje)

### Faza 2: Implementacja GET /api/events (lista z filtrami)
5. Utworzenie `src/pages/api/events/index.ts`
6. Implementacja middleware autoryzacji dla wszystkich uwierzytelnionych użytkowników
7. Dodanie walidacji parametrów query (page, limit, status, location, date_from, date_to, organizer_id)
8. Implementacja logiki filtrowania i paginacji w EventService
9. Dodanie optymalizacji zapytań z indeksami
10. Testowanie z różnymi kombinacjami filtrów

### Faza 3: Implementacja GET /api/events/{id} (szczegóły z zapisami)
11. Utworzenie `src/pages/api/events/[id].ts`
12. Implementacja walidacji ID wydarzenia
13. Dodanie obsługi błędów 404 dla nieistniejących wydarzeń
14. Implementacja JOIN z event_signups dla pobrania zapisów
15. Dodanie sprawdzenia soft delete (deleted_at IS NULL)

### Faza 4: Implementacja POST /api/events (tworzenie)
16. Dodanie obsługi POST w `src/pages/api/events/index.ts`
17. Implementacja walidacji request body z wymaganymi polami
18. Dodanie sprawdzenia roli użytkownika (organizer/admin)
19. Implementacja logiki biznesowej tworzenia wydarzenia
20. Dodanie audit logging dla operacji "event_created"
21. Ustawienie organizer_id na podstawie aktualnego użytkownika

### Faza 5: Implementacja PATCH /api/events/{id} (aktualizacja)
22. Dodanie obsługi PATCH w `src/pages/api/events/[id].ts`
23. Implementacja walidacji request body (częściowej)
24. Dodanie sprawdzenia uprawnień (organizer wydarzenia lub admin)
25. Implementacja logiki biznesowej aktualizacji
26. Dodanie walidacji biznesowej (np. nie można zmienić daty w przeszłość)
27. Implementacja audit logging dla operacji "event_updated"

### Faza 6: Implementacja DELETE /api/events/{id} (soft delete)
28. Dodanie obsługi DELETE w `src/pages/api/events/[id].ts`
29. Implementacja sprawdzenia roli admin
30. Dodanie soft delete logiki (ustawienie deleted_at)
31. Dodanie audit logging dla operacji "event_deleted"
32. Zapewnienie, że istniejące zapisy nie są naruszone

### Faza 7: Testowanie i optymalizacja
33. Unit testy dla EventService
34. Integration testy dla wszystkich endpointów
35. Testy bezpieczeństwa (autoryzacja, RLS, role-based access)
36. Testy wydajności z dużymi zbiorami danych
37. Testy edge cases (soft delete, validation errors)
38. Code review i optymalizacja
39. Dokumentacja API

### Faza 8: Deployment i monitoring
40. Deployment na środowisko testowe
41. Monitoring błędów i wydajności
42. A/B testing jeśli potrzebne
43. Final deployment na produkcję

---

# API Endpoint Implementation Plan: User Management Endpoints

## 1. Przegląd punktu końcowego
Endpointy zarządzania użytkownikami obejmują kompletny CRUD dla zasobów użytkowników w systemie FairPlay. Implementacja obsługuje listowanie użytkowników z zaawansowanymi filtrami, pobieranie szczegółów, zatwierdzanie kont oraz soft delete. Wszystkie operacje są chronione kontrolą dostępu opartą na rolach, z priorytetem bezpieczeństwa i integralności danych.

## 2. Szczegóły żądania

### GET /api/users
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/users`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**:
    - `page` (integer, default: 1) - Numer strony dla paginacji
    - `limit` (integer, default: 20) - Liczba elementów na stronę (max 100)
    - `status` (enum: pending, approved) - Filtrowanie po statusie
    - `role` (enum: admin, organizer, player) - Filtrowanie po roli
    - `search` (string) - Wyszukiwanie po first_name, last_name lub email (min 3 znaki)
- **Request Body**: brak

### GET /api/users/{id}
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/users/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**: brak

### PATCH /api/users/{id}/approve
- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/users/{id}/approve`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**:
```json
{
  "role": "player",
  "player_id": 123
}
```

### DELETE /api/users/{id}
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/users/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID użytkownika
  - **Opcjonalne**: brak
- **Request Body**: brak

## 3. Wykorzystywane typy
- **DTOs**: `UserDTO`, `UsersListResponseDTO`
- **Query Parameters**: `ListUsersQueryParams`
- **Command Models**: `ApproveUserCommand`
- **Enums**: `UserRole`, `UserStatus`
- **Database Types**: `Tables<"users">`, `TablesInsert<"users">`, `TablesUpdate<"users">`

## 4. Szczegóły odpowiedzi

### GET /api/users
- **Success Codes**: 200 OK
- **Response Body**:
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "player",
      "status": "approved",
      "player_id": 123,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### GET /api/users/{id}
- **Success Codes**: 200 OK
- **Response Body**: Pojedynczy obiekt `UserDTO` (taka sama struktura jak powyżej)

### PATCH /api/users/{id}/approve
- **Success Codes**: 200 OK
- **Response Body**: Zaktualizowany obiekt `UserDTO`

### DELETE /api/users/{id}
- **Success Codes**: 204 No Content
- **Response Body**: pusty

## 5. Przepływ danych
1. **Uwierzytelnienie**: JWT token weryfikowany przez Astro middleware
2. **Autoryzacja**: Sprawdzenie roli użytkownika w context.locals
3. **Walidacja**: Zod schemas dla parametrów query i request body
4. **Service Layer**: UserService obsługuje logikę biznesową
5. **Database**: Supabase client wykonuje zapytania z RLS policies
6. **Audit Logging**: Krytyczne operacje logowane do audit_logs
7. **Response**: Strukturalizowana odpowiedź z odpowiednim statusem

## 6. Względy bezpieczeństwa
- **Autoryzacja**: JWT-based authentication z kontrolą ról (admin/organizer/player)
- **RLS Policies**: Row Level Security na poziomie bazy danych
- **Input Validation**: Kompleksowa walidacja Zod dla wszystkich wejść
- **IDOR Protection**: Sprawdzenie czy użytkownik ma dostęp do żądanych danych
- **Rate Limiting**: Ograniczenie liczby zapytań dla endpointów listowania
- **Audit Trail**: Wszystkie zmiany logowane dla compliance
- **SQL Injection Protection**: Parametryzowane zapytania przez Supabase

## 7. Obsługa błędów

### Scenariusze błędów i odpowiedzi:

**400 Bad Request**:
- Nieprawidłowa wartość roli w approve (nie z enum)
- Nieprawidłowy format player_id
- Nieistniejący player_id w bazie danych
- Nieprawidłowe parametry paginacji (ujemne wartości)

**401 Unauthorized**:
- Brak JWT token
- Nieprawidłowy/expired JWT token

**403 Forbidden**:
- Użytkownik bez roli admin próbuje dostępu
- Próba dostępu do cudzego profilu (bez uprawnień admin)

**404 Not Found**:
- Użytkownik o podanym ID nie istnieje
- Użytkownik został soft-deleted

**409 Conflict**:
- Próba zatwierdzenia już zatwierdzonego użytkownika

**500 Internal Server Error**:
- Błędy połączenia z bazą danych
- Nieoczekiwane błędy podczas operacji na danych
- Błędy audit logging

Wszystkie błędy zawierają strukturalizowaną odpowiedź z kodem błędu i opisem.

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Wykorzystanie indeksów na email, status, role dla szybkich filtrów
- **Paginacja**: Cursor-based pagination dla dużych zbiorów danych
- **Caching**: Cache dla często używanych danych użytkowników
- **Connection Pooling**: Supabase obsługuje pooling automatycznie
- **Query Optimization**: Używanie select tylko potrzebnych pól
- **Search Optimization**: Full-text search dla pola search z limitami długości

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie infrastruktury
1. Utworzenie `src/lib/services/userService.ts` z podstawowymi metodami
2. Implementacja Zod schemas w `src/lib/validation/userSchemas.ts`
3. Dodanie typów audit logging do `src/types.ts`

### Faza 2: Implementacja GET /api/users
4. Utworzenie `src/pages/api/users/index.ts`
5. Implementacja middleware autoryzacji dla roli admin
6. Dodanie walidacji parametrów query
7. Implementacja logiki filtrowania i paginacji w UserService
8. Testowanie z różnymi parametrami filtrów

### Faza 3: Implementacja GET /api/users/{id}
9. Utworzenie `src/pages/api/users/[id].ts`
10. Implementacja logiki sprawdzania dostępu (admin lub własny profil)
11. Dodanie walidacji ID użytkownika
12. Dodanie obsługi błędów 404

### Faza 4: Implementacja PATCH /api/users/{id}/approve
13. Rozszerzenie `src/pages/api/users/[id]/approve.ts`
14. Implementacja walidacji request body
15. Dodanie logiki biznesowej sprawdzenia statusu użytkownika
16. Implementacja audit logging dla operacji approve
17. Obsługa konfliktów (już zatwierdzony użytkownik)

### Faza 5: Implementacja DELETE /api/users/{id}
18. Dodanie obsługi DELETE w `src/pages/api/users/[id].ts`
19. Implementacja soft delete logiki
20. Dodanie audit logging dla operacji delete
21. Zapewnienie bezpieczeństwa (tylko admin)

### Faza 6: Testowanie i optymalizacja
22. Unit testy dla UserService
23. Integration testy dla wszystkich endpointów
24. Testy bezpieczeństwa (autoryzacja, RLS)
25. Testy wydajności z dużymi zbiorami danych
26. Code review i optymalizacja
27. Dokumentacja API

### Faza 7: Deployment i monitoring
28. Deployment na środowisko testowe
29. Monitoring błędów i wydajności
30. A/B testing jeśli potrzebne
31. Final deployment na produkcję

---

# API Endpoint Implementation Plan: Player Management Endpoints

## 1. Przegląd punktu końcowego
Endpointy zarządzania graczami obejmują kompletny CRUD dla zasobów graczy w systemie FairPlay. Implementacja obsługuje listowanie graczy z zaawansowanymi filtrami, pobieranie szczegółów, tworzenie nowych graczy, aktualizację danych oraz soft delete. Wszystkie operacje są chronione kontrolą dostępu opartą na rolach, z dodatkowymi restrykcjami dla wrażliwych pól jak skill_rate (tylko admin).

## 2. Szczegóły żądania

### GET /api/players
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/players`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**:
    - `page` (integer, default: 1) - Numer strony dla paginacji
    - `limit` (integer, default: 20) - Liczba elementów na stronę (max 100)
    - `position` (enum: forward, midfielder, defender, goalkeeper) - Filtrowanie po pozycji
    - `search` (string) - Wyszukiwanie po first_name lub last_name (min 3 znaki)
    - `include_skill_rate` (boolean, default: false) - Uwzględnij skill_rate w odpowiedzi (tylko admin)
- **Request Body**: brak

### GET /api/players/{id}
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/players/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID gracza
  - **Opcjonalne**: brak
- **Request Body**: brak

### POST /api/players
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/players`
- **Parametry**: brak
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "position": "forward",
  "skill_rate": 8,
  "date_of_birth": "1990-01-01"
}
```

### PATCH /api/players/{id}
- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/players/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID gracza
  - **Opcjonalne**: brak
- **Request Body**: Częściowy obiekt gracza (wszystkie pola opcjonalne)

### DELETE /api/players/{id}
- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/players/{id}`
- **Parametry**:
  - **Wymagane**: `id` (integer) - ID gracza
  - **Opcjonalne**: brak
- **Request Body**: brak

## 3. Wykorzystywane typy
- **DTOs**: `PlayerDTO`, `PlayersListResponseDTO`
- **Query Parameters**: `ListPlayersQueryParams`
- **Command Models**: `CreatePlayerCommand`, `UpdatePlayerCommand`
- **Enums**: `PlayerPosition`
- **Database Types**: `Tables<"players">`, `TablesInsert<"players">`, `TablesUpdate<"players">`

## 4. Szczegóły odpowiedzi

### GET /api/players
- **Success Codes**: 200 OK
- **Response Body**:
```json
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "position": "forward",
      "skill_rate": 8,
      "date_of_birth": "1990-01-01",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### GET /api/players/{id}
- **Success Codes**: 200 OK
- **Response Body**: Pojedynczy obiekt `PlayerDTO`

### POST /api/players
- **Success Codes**: 201 Created
- **Response Body**: Utworzony obiekt `PlayerDTO`

### PATCH /api/players/{id}
- **Success Codes**: 200 OK
- **Response Body**: Zaktualizowany obiekt `PlayerDTO`

### DELETE /api/players/{id}
- **Success Codes**: 204 No Content
- **Response Body**: pusty

## 5. Przepływ danych
1. **Uwierzytelnienie**: JWT token weryfikowany przez Astro middleware
2. **Autoryzacja**: Sprawdzenie roli użytkownika w context.locals (admin/organizer/player)
3. **Walidacja**: Zod schemas dla parametrów query i request body
4. **Service Layer**: PlayerService obsługuje logikę biznesową
5. **Database**: Supabase client wykonuje zapytania z RLS policies
6. **Audit Logging**: Krytyczne operacje (create/update/delete) logowane do audit_logs
7. **Response**: Strukturalizowana odpowiedź z odpowiednim statusem

## 6. Względy bezpieczeństwa
- **Autoryzacja**: JWT-based authentication z kontrolą ról (admin/organizer/player)
- **RLS Policies**: Row Level Security na poziomie bazy danych
- **Input Validation**: Kompleksowa walidacja Zod dla wszystkich wejść
- **Field-Level Security**: skill_rate widoczne tylko dla admin (include_skill_rate flag)
- **Role-Based Access**: Create/Update operations wymagają admin/organizer, skill_rate updates tylko admin
- **Audit Trail**: Wszystkie zmiany logowane dla compliance
- **SQL Injection Protection**: Parametryzowane zapytania przez Supabase

## 7. Obsługa błędów

### Scenariusze błędów i odpowiedzi:

**400 Bad Request**:
- Nieprawidłowa wartość pozycji (nie z enum)
- Nieprawidłowy zakres skill_rate (poza 1-10)
- Nieprawidłowy format date_of_birth
- Nieprawidłowe parametry paginacji (ujemne wartości)
- Nieprawidłowa długość pól tekstowych

**401 Unauthorized**:
- Brak JWT token
- Nieprawidłowy/expired JWT token

**403 Forbidden**:
- Użytkownik bez wymaganych uprawnień próbuje dostępu
- Próba dostępu do skill_rate bez roli admin
- Próba aktualizacji skill_rate bez roli admin

**404 Not Found**:
- Gracz o podanym ID nie istnieje
- Gracz został soft-deleted

**409 Conflict**:
- Próba utworzenia gracza z istniejącymi danymi (jeśli wymagane unikalne constraints)

**422 Unprocessable Entity**:
- Nieprawidłowe dane wejściowe nie przechodzącą walidacji Zod

**500 Internal Server Error**:
- Błędy połączenia z bazą danych
- Nieoczekiwane błędy podczas operacji na danych
- Błędy audit logging

Wszystkie błędy zawierają strukturalizowaną odpowiedź z kodem błędu i opisem.

## 8. Rozważania dotyczące wydajności
- **Indeksy**: Wykorzystanie indeksów na first_name, last_name, position dla szybkich filtrów
- **Paginacja**: Cursor-based pagination dla dużych zbiorów danych
- **Caching**: Cache dla często używanych danych graczy
- **Connection Pooling**: Supabase obsługuje pooling automatycznie
- **Query Optimization**: Używanie select tylko potrzebnych pól
- **Search Optimization**: Full-text search dla pól name z limitami długości

## 9. Etapy wdrożenia

### Faza 1: Przygotowanie infrastruktury
1. Utworzenie `src/lib/services/playerService.ts` z podstawowymi metodami
2. Implementacja Zod schemas w `src/lib/validation/playerSchemas.ts`
3. Dodanie typów audit logging do `src/types.ts` (jeśli potrzebne)

### Faza 2: Implementacja GET /api/players
4. Utworzenie `src/pages/api/players/index.ts`
5. Implementacja middleware autoryzacji
6. Dodanie walidacji parametrów query
7. Implementacja logiki filtrowania i paginacji w PlayerService
8. Implementacja field-level security dla skill_rate
9. Testowanie z różnymi parametrami filtrów

### Faza 3: Implementacja GET /api/players/{id}
10. Utworzenie `src/pages/api/players/[id].ts`
11. Implementacja walidacji ID gracza
12. Dodanie obsługi błędów 404
13. Implementacja field-level security dla skill_rate

### Faza 4: Implementacja POST /api/players
14. Dodanie obsługi POST w `src/pages/api/players/index.ts`
15. Implementacja walidacji request body
16. Dodanie logiki biznesowej tworzenia gracza
17. Implementacja audit logging dla operacji create
18. Zapewnienie bezpieczeństwa (admin/organizer)

### Faza 5: Implementacja PATCH /api/players/{id}
19. Dodanie obsługi PATCH w `src/pages/api/players/[id].ts`
20. Implementacja walidacji request body
21. Dodanie logiki biznesowej aktualizacji gracza
22. Implementacja field-level security dla skill_rate (tylko admin)
23. Implementacja audit logging dla operacji update
24. Obsługa konfliktów i błędów walidacji

### Faza 6: Implementacja DELETE /api/players/{id}
25. Dodanie obsługi DELETE w `src/pages/api/players/[id].ts`
26. Implementacja soft delete logiki
27. Dodanie audit logging dla operacji delete
28. Zapewnienie bezpieczeństwa (tylko admin)

### Faza 7: Testowanie i optymalizacja
29. Unit testy dla PlayerService
30. Integration testy dla wszystkich endpointów
31. Testy bezpieczeństwa (autoryzacja, RLS, field-level security)
32. Testy wydajności z dużymi zbiorami danych
33. Code review i optymalizacja
34. Dokumentacja API

### Faza 8: Deployment i monitoring
35. Deployment na środowisko testowe
36. Monitoring błędów i wydajności
37. A/B testing jeśli potrzebne
38. Final deployment na produkcję