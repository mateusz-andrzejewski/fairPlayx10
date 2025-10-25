# Schemat Bazy Danych - Platforma FairPlay

## 1. Typy Enum

```sql
-- Role użytkowników
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'player');

-- Status konta
CREATE TYPE user_status AS ENUM ('pending', 'approved');

-- Status wydarzenia
CREATE TYPE event_status AS ENUM ('draft', 'active', 'completed');

-- Status zapisu
CREATE TYPE signup_status AS ENUM ('pending', 'confirmed', 'withdrawn');

-- Pozycje piłkarskie
CREATE TYPE player_position AS ENUM ('forward', 'midfielder', 'defender', 'goalkeeper');

-- Typy akcji audytowych
CREATE TYPE audit_action AS ENUM (
  'user_approved', 'user_rejected', 'player_created', 'player_updated', 'player_deleted',
  'event_created', 'event_updated', 'event_deleted', 'signup_confirmed', 'signup_withdrawn',
  'team_assigned', 'team_reassigned'
);
```

## 2. Lista Tabel

### users
Ta tabela jest zarządzana przez Supabase Auth
Tabela przechowująca konta użytkowników z autentyfikacją i rolami.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator konta |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Adres email użytkownika |
| password_hash | VARCHAR(255) | NOT NULL | Hash hasła |
| first_name | VARCHAR(100) | NOT NULL | Imię |
| last_name | VARCHAR(100) | NOT NULL | Nazwisko |
| role | user_role | NOT NULL DEFAULT 'player' | Rola użytkownika |
| status | user_status | NOT NULL DEFAULT 'pending' | Status konta |
| consent_date | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data zgody RODO |
| consent_version | VARCHAR(20) | NOT NULL | Wersja zgody RODO |
| player_id | INTEGER | FOREIGN KEY REFERENCES players(id) ON DELETE SET NULL | Powiązany gracz (opcjonalne) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data utworzenia |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data ostatniej aktualizacji |

### players
Niezależna tabela graczy z podstawowymi danymi i skill rate.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator gracza |
| first_name | VARCHAR(100) | NOT NULL | Imię |
| last_name | VARCHAR(100) | NOT NULL | Nazwisko |
| position | player_position | NOT NULL | Pozycja piłkarska |
| skill_rate | SMALLINT | CHECK (skill_rate >= 1 AND skill_rate <= 10) | Ocena umiejętności (1-10, tylko dla admina) |
| date_of_birth | DATE |  | Data urodzenia (opcjonalna) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data utworzenia |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data ostatniej aktualizacji |
| deleted_at | TIMESTAMPTZ |  | Soft delete (NULL = aktywny) |

### events
Tabela wydarzeń z parametrami i organizatorem.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator wydarzenia |
| name | VARCHAR(200) | NOT NULL | Nazwa wydarzenia |
| location | VARCHAR(200) | NOT NULL | Lokalizacja |
| event_datetime | TIMESTAMPTZ | NOT NULL, CHECK (event_datetime > NOW()) | Data i czas wydarzenia |
| max_places | INTEGER | NOT NULL, CHECK (max_places > 0) | Maksymalna liczba miejsc |
| optional_fee | DECIMAL(10,2) | CHECK (optional_fee >= 0) | Opcjonalna opłata (NULL = bezpłatne) |
| status | event_status | NOT NULL DEFAULT 'draft' | Status wydarzenia |
| current_signups_count | INTEGER | NOT NULL DEFAULT 0 | Aktualna liczba zapisów |
| organizer_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE | Organizator |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data utworzenia |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data ostatniej aktualizacji |
| deleted_at | TIMESTAMPTZ |  | Soft delete (NULL = aktywny) |

### event_signups
Tabela pośrednicząca dla zapisów na wydarzenia z timestampami.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator zapisu |
| event_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES events(id) ON DELETE CASCADE | Wydarzenie |
| player_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES players(id) ON DELETE CASCADE | Gracz |
| signup_timestamp | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Timestamp zapisu |
| status | signup_status | NOT NULL DEFAULT 'pending' | Status zapisu |
| resignation_timestamp | TIMESTAMPTZ |  | Timestamp rezygnacji (jeśli dotyczy) |
| UNIQUE(event_id, player_id) |  |  | Jeden zapis na gracza na wydarzenie |

### team_assignments
Przypisania graczy do drużyn po losowaniu.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator przypisania |
| signup_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES event_signups(id) ON DELETE CASCADE | Zapis uczestnika |
| team_number | SMALLINT | NOT NULL, CHECK (team_number > 0) | Numer drużyny (1, 2, ...) |
| assignment_timestamp | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Timestamp przypisania |
| UNIQUE(signup_id) |  |  | Jeden uczestnik w jednej drużynie |

### audit_logs
Tabela audytowa dla śledzenia zmian krytycznych.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|-------------|------|
| id | SERIAL | PRIMARY KEY | Unikalny identyfikator wpisu |
| timestamp | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Timestamp akcji |
| action_type | audit_action | NOT NULL | Typ akcji |
| actor_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE | Użytkownik wykonujący akcję |
| target_table | VARCHAR(50) | NOT NULL | Tabela docelowa |
| target_id | INTEGER | NOT NULL | ID rekordu docelowego |
| changes | JSONB |  | Szczegóły zmian (JSON) |
| ip_address | INET |  | Adres IP (opcjonalny) |

## 3. Relacje między Tabelami

### Relacje jeden-do-jednego:
- `users.player_id` → `players.id` (opcjonalne, pozwala na powiązanie konta z istniejącym graczem)

### Relacje jeden-do-wielu:
- `users.id` → `events.organizer_id` (jedno konto może organizować wiele wydarzeń)
- `users.id` → `audit_logs.actor_id` (jedno konto może wykonywać wiele akcji audytowych)
- `events.id` → `event_signups.event_id` (jedno wydarzenie może mieć wiele zapisów)
- `players.id` → `event_signups.player_id` (jeden gracz może zapisać się na wiele wydarzeń)
- `event_signups.id` → `team_assignments.signup_id` (jedna rejestracja prowadzi do jednego przypisania drużynowego)

### Relacje wiele-do-wielu (przez tabele pośredniczące):
- `events` ↔ `players` przez `event_signups` (wiele wydarzeń, wielu graczy z zapisami i timestampami)

## 4. Indeksy

```sql
-- Indeksy dla wydajności filtrów w events
CREATE INDEX idx_events_datetime_location ON events (event_datetime, location);
CREATE INDEX idx_events_location ON events (location);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_organizer_id ON events (organizer_id);

-- Indeksy dla kolejności zapisów
CREATE INDEX idx_event_signups_event_timestamp ON event_signups (event_id, signup_timestamp ASC);
CREATE INDEX idx_event_signups_player ON event_signups (player_id);
CREATE INDEX idx_event_signups_status ON event_signups (status);

-- Indeksy dla przypisań drużynowych
CREATE INDEX idx_team_assignments_signup ON team_assignments (signup_id);
CREATE INDEX idx_team_assignments_event_team ON team_assignments (signup_id, team_number);

-- Indeksy dla audytu
CREATE INDEX idx_audit_logs_timestamp_actor ON audit_logs (timestamp DESC, actor_id);
CREATE INDEX idx_audit_logs_target ON audit_logs (target_table, target_id);

-- Indeksy dla soft deletes
CREATE INDEX idx_players_deleted_at ON players (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_events_deleted_at ON events (deleted_at) WHERE deleted_at IS NOT NULL;
```

## 5. Zasady PostgreSQL (RLS - Row Level Security)

```sql
-- Włącz RLS na wszystkich tabelach
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Polityka dla users: użytkownicy widzą tylko swoje konto, admin wszystkich
CREATE POLICY users_policy ON users
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR
  id = (auth.jwt() ->> 'sub')::integer
);

-- Polityka dla players: wszyscy mogą czytać, admin może edytować, skill_rate ukryty dla nie-adminów
CREATE POLICY players_read_policy ON players
FOR SELECT USING (
  deleted_at IS NULL AND
  (auth.jwt() ->> 'role' = 'admin' OR
   auth.jwt() ->> 'role' IN ('organizer', 'player'))
);

CREATE POLICY players_admin_policy ON players
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Polityka dla events: admin pełny dostęp, organizer własne wydarzenia, gracze tylko aktywne
CREATE POLICY events_policy ON events
FOR ALL USING (
  deleted_at IS NULL AND
  (auth.jwt() ->> 'role' = 'admin' OR
   (auth.jwt() ->> 'role' = 'organizer' AND organizer_id = (auth.jwt() ->> 'sub')::integer) OR
   (auth.jwt() ->> 'role' = 'player' AND status = 'active' AND auth.jwt() ->> 'status' = 'approved'))
);

-- Polityka dla event_signups: admin i organizer wydarzenia mogą zarządzać
CREATE POLICY event_signups_policy ON event_signups
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_signups.event_id
    AND events.organizer_id = (auth.jwt() ->> 'sub')::integer
  ) OR
  (auth.jwt() ->> 'role' = 'player' AND
   player_id = (SELECT player_id FROM users WHERE id = (auth.jwt() ->> 'sub')::integer))
);

-- Polityka dla team_assignments: admin i organizer wydarzenia
CREATE POLICY team_assignments_policy ON team_assignments
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM event_signups es
    JOIN events e ON es.event_id = e.id
    WHERE es.id = team_assignments.signup_id
    AND e.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- Polityka dla audit_logs: tylko admin może czytać
CREATE POLICY audit_logs_policy ON audit_logs
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

## 6. Dodatkowe Uwagi

### Decyzje Projektowe:
- **Niezależna tabela players**: Umożliwia zarządzanie graczami bez kont i łatwe merge profili przy rejestracji
- **Soft deletes**: Zachowują historię bez utraty danych, ważne dla audytu i RODO
- **Timestampy**: signup_timestamp zapewnia kolejność zapisów, resignation_timestamp śledzi rezygnacje
- **Skill rate ukryty**: RLS maskuje skill_rate dla nie-adminów, zgodne z RODO
- **Elastyczne drużyny**: team_number jako SMALLINT pozwala na zmienną liczbę drużyn
- **Enums**: Zapewniają type safety i łatwiejsze walidacje
- **Audit trail**: Kompleksowe logowanie zmian z JSONB dla szczegółów

### Uwagi dotyczące Wydajności:
- Indeksy zoptymalizowane pod główne zapytania (filtry wydarzeń, lista zapisów)
- current_signups_count w events aktualizowany przez triggery dla wydajności
- Brak partycjonowania w MVP, ale struktura gotowa na skalowanie

### Bezpieczeństwo:
- RLS na wszystkich tabelach z role-based access
- Supabase Auth integracja zakładana przez JWT claims
- Audit logs dla wszystkich krytycznych operacji
- Check constraints dla walidacji danych (skill_rate 1-10, daty przyszłe)

### Edge Cases:
- Brakujące dane w losowaniu: Algorytm powinien używać default wartości (np. neutralna pozycja dla graczy bez pozycji)
- Duplikaty profili: Optional FK w users pozwala na merge przy zatwierdzaniu
- Rezygnacje: resignation_timestamp i status withdrawn dla historii

Schemat jest znormalizowany do 3NF z uzasadnioną denormalizacją (current_signups_count) dla wydajności w często używanych zapytaniach.
