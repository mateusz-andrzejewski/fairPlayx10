# Dokument wymagań produktu (PRD) - Platforma FairPlay

## 1. Przegląd projektu

Platforma FairPlay to aplikacja webowa zaprojektowana w celu usprawnienia organizacji amatorskich meczów piłkarskich. MVP skupia się na automatyzacji procesów takich jak rejestracja graczy, zarządzanie wydarzeniami, zapisy na mecze oraz automatyczne losowanie zrównoważonych składów drużyn. Technologia oparta na Astro 5, React 19, TypeScript 5, Tailwind 4 i Shadcn/ui, z backendem Supabase dla autentykacji i bazy danych. Rozwój realizowany przez solo developera z wsparciem AI (Cursor), z priorytetami: rejestracja, zarządzanie graczami i wydarzeniami, algorytm losowania. Aplikacja jest responsywna, z naciskiem na mobile-first UX, zastępując manualne procesy na Messengerze.

## 2. Problem użytkownika

Obecna organizacja amatorskich meczów piłkarskich opiera się na manualnych działaniach, co powoduje liczne problemy:
- Organizatorzy ręcznie zbierają zgłoszenia via Messenger, bez jasnej kolejności (brak timestampów), co prowadzi do gąszczu wiadomości i niespójności (np. brak aktualizacji po rezygnacji).
- Gracze nie mają wygodnej platformy do wyszukiwania i zapisywania się na mecze, co wydłuża proces i zwiększa błędy.
- Losowanie składów odbywa się tuż przed meczem, czasochłonnie i podatnie na błędy, bez uwzględnienia balansu pozycji czy skill rate.
- Brak scentralizowanej bazy graczy, co komplikuje zarządzanie profilami i weryfikację.
- Cały proces jest nieefektywny, z czasem interakcji przekraczającym 2 minuty na kluczowe akcje, i brakiem real-time powiadomień.

Platforma rozwiązuje te problemy poprzez one-click zapisy, automatyczne losowanie, dashboard z filtrami i ręczne zatwierdzanie dla bezpieczeństwa.

## 3. Wymagania funkcjonalne

### System kont i autentykacja
- Rejestracja i logowanie via email/hasło z Supabase Auth, z obowiązkową zgodą RODO.
- Role: Admin (zarządzanie), Organizator (wydarzenia i zapisy), Gracz (zapisy).
- Ręczne zatwierdzanie nowych kont przez admina: weryfikacja danych, powiązanie z profilem gracza, nadanie roli.
- Baza graczy niezależna od kont: organizatorzy mogą dodawać graczy bez kont, admin powiązuje nowe konta z istniejącymi profilami.

### Zarządzanie graczami
- Moduł admina: lista graczy z wyszukiwarką, widok szczegółów (imię, nazwisko, pozycja, skill rate), edycja (w tym skill rate ręcznie), usuwanie, dodawanie nowych.
- Skill rate widoczny tylko dla admina.

### Wydarzenia
- Tworzenie, edycja, usuwanie wydarzeń przez organizatora/admina: parametry (lokalizacja, data/czas, liczba miejsc, opłata opcjonalna).
- Feed/lista wydarzeń z filtrami (data, lokalizacja); archiwum historyczne.
- Dla niezalogowanych tylko strona logowania - niezalogowany nie ma informacji o niczym.

### Zapisy na wydarzenia
- One-click signup dla graczy: przyciśnięcie like na feed → modal potwierdzenia → snackbar sukcesu; timestamp dla kolejności.
- Manualne dodawanie/usuwanie graczy przez organizatora (z bazy lub nowi).
- Aktualizacja wolnych miejsc; rezygnacja automatycznie usuwa z listy.

### Algorytm losowania
- Automatyczne losowanie po osiągnięciu min. uczestników: 20 iteracyjnych prób, balans pozycji i skill rate (różnica średniej <=7%).
- Fallback: ręczna korekta przez organizatora z podglądem statystyk skill rate per drużyna i per user (to i tak widzi tylko admin).
- Powiadomienia o składach in-app podpięte pod wydarzenie i z ujawnieniem skill rate drużyny, ale nie poszczególnych graczy.

### UI/UX
- Responsywny design mobile-first (Tailwind).
- Dashboard powitalny z najbliższym wydarzeniem.
- Real-time updates (np. wolne miejsca).
- Brak integracji zewnętrznych w MVP.

### Bezpieczeństwo i compliance
- RODO: zgoda na rejestracji, ukryte dane (skill rate).
- Audit trail dla zmian admina (np. w Supabase).
- test autmoatyczny ścieżki krytycznej.

## 4. Granice projektu

MVP nie obejmuje:
- Integracji z płatnościami lub zewnętrznymi systemami.
- Automatycznej aktywacji kont (tylko ręczne zatwierdzanie).
- Zaawansowanych powiadomień (push/email podstawowe).
- Skalowalności dla >50 użytkowników (queued alerts jako contingency).
- Widoczności skill rate graczy dla graczy i organizatorów.
- Filtrów zaawansowanych (np. typ sportu, odległość) – tylko data i lokalizacja.
- Walidacji z CAPTCHA w MVP; regex podstawowy.
- Default values dla brakujących danych w algorytmie (ostrzeżenia dla admina).
- Delegacji ról lub sub-role.

Rozwój: 3 tygodnie, phased rollout (rejestracja → wydarzenia → algorytm z placeholderem). AI-driven code generation z ESLint/Prettier.

Nierozwiązane kwestie:
- Adaptacja developera z Angular na Astro/React via AI.
- Testowanie wydarzeń bez pełnego algorytmu (placeholders).
- Plan na wzrost: queued notifications.
- Dokumentacja baseline'ów metryk; iteracje UX jeśli >2 min.
- Szczegóły walidacji danych.
- Logowanie zmian w dedykowanej tabeli Supabase.
- Edge cases algorytmu: ostrzeżenia.

## 5. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika jako Gracz
Opis: Jako nowy użytkownik, chcę się zarejestrować, aby móc zapisywać się na wydarzenia i zarządzać profilem.
Kryteria akceptacji:
- Formularz zawiera pola: email, hasło, imię, nazwisko, pozycja, zgoda RODO.
- Czas rejestracji <2 min; walidacja email i hasła (regex).
- Po submit, konto w stanie pending; email potwierdzenia.
- Testowalność: Symuluj rejestrację, sprawdź pending status w admin panelu.

### US-002: Logowanie użytkownika
Opis: Jako zarejestrowany użytkownik, chcę się zalogować, aby uzyskać dostęp do dashboardu i funkcji.
Kryteria akceptacji:
- Formularz email/hasło; obsługa błędów (nieprawidłowe dane).
- Po sukcesie, przekierowanie do dashboardu.
- Sesja trwa do wylogowania lub 20 min (tokeny odświeżające); secure tokens via Supabase.
- Testowalność: Logowanie z poprawnymi/niewłaściwymi danymi, sprawdź przekierowanie.

### US-003: Zatwierdzanie rejestracji przez Admina
Opis: Jako admin, chcę zatwierdzić nowe konto, aby przypisać rolę i powiązać z profilem gracza.
Kryteria akceptacji:
- Lista pending kont w admin module; wyszukiwarka.
- Widok szczegółów: weryfikacja danych, opcja powiązania z istniejącym profilem lub stworzenia nowego.
- Nadanie roli (Gracz domyślnie / Organizator); powiadomienie email.
- Audit log zmiany.
- Testowalność: Dodaj pending konto, zatwierdź, sprawdź status i email.

### US-004: Zarządzanie profilem gracza przez Admina
Opis: Jako admin, chcę edytować profil gracza, w tym skill rate, aby utrzymać bazę danych.
Kryteria akceptacji:
- Lista graczy z wyszukiwarką; widok szczegółów (imię, nazwisko, pozycja, skill rate (widoczny tylko dla admina)).
- Edycja pól; skill rate tylko dla admina (1-10 skala).
- Usuwanie/dodawanie graczy; walidacja danych.
- Testowalność: Edytuj skill rate, sprawdź ukrycie dla innych ról.

### US-005: Tworzenie wydarzenia przez Organizatora
Opis: Jako organizator, chcę stworzyć wydarzenie, aby gracze mogli się zapisywać.
Kryteria akceptacji:
- Formularz: nazwa, lokalizacja, data/czas, max miejsc, opłata (opcjonalna).
- Czas tworzenia <2 min; walidacja dat (przyszła).
- Wydarzenie widoczne w feedzie po stworzeniu.
- Testowalność: Stwórz wydarzenie, sprawdź w feedzie.

### US-006: Przeglądanie listy wydarzeń jako Gracz
Opis: Jako gracz, chcę przeglądać feed wydarzeń z filtrami, aby znaleźć interesujące eventy.
Kryteria akceptacji:
- Lista z kartami: nazwa, data, lokalizacja, wolne miejsca, koszt.
- Filtry: data (od/do), lokalizacja (wybrana z listy miast); sortowanie po dacie.
- Brak wglądu dla niezalogowanych logowanie wymagane rejestracji.
- Responsywny na mobile.
- Testowalność: Zastosuj filtr, sprawdź wyniki.

### US-007: One-click zapis na wydarzenie jako Gracz
Opis: Jako gracz, chcę szybko zapisać się na wydarzenie, aby uniknąć manualnych wiadomości.
Kryteria akceptacji:
- Like na karcie wydarzenia lub w dashboard → modal potwierdzenia (dane gracza pre-filled).
- Po potwierdzeniu, snackbar sukcesu; timestamp zapisu.
- Aktualizacja wolnych miejsc; max 1 zapis na wydarzenie.
- Czas <2 min.
- Testowalność: Symuluj zapis, sprawdź listę uczestników i snackbar.

### US-008: Manualne dodawanie gracza do wydarzenia przez Organizatora
Opis: Jako organizator, chcę dodać gracza bez konta do wydarzenia, aby ułatwić zapis.
Kryteria akceptacji:
- W module wydarzenia: wyszukiwarka bazy graczy lub dodaj nowego.
- Automatyczne powiązanie z profilem (jeśli posiada); aktualizacja miejsc.
- Powiadomienie gracza jeśli ma konto.
- Testowalność: Dodaj gracza, sprawdź listę i miejsca.

### US-009: Rezygnacja z zapisu na wydarzenie
Opis: Jako gracz lub organizator, chcę zrezygnować z zapisu, aby zwolnić miejsce.
Kryteria akceptacji:
- Przycisk rezygnacji w liście zapisów; automatyczne odlajkowanie.
- Timestamp rezygnacji; aktualizacja miejsc.
- Powiadomienie organizatora.
- Testowalność: Rezygnuj, sprawdź zwolnienie miejsca.

### US-010: Automatyczne losowanie składów przez Organizatora
Opis: Jako organizator, chcę uruchomić algorytm losowania, aby zrównoważyć drużyny.
Kryteria akceptacji:
- Przycisk po osiągnięciu min. uczestników; 20 prób iteracyjnych.
- Balans: pozycje (np. 5-4-1) i skill rate (różnica <=7%).
- Jeśli sukces, wygeneruj składy; powiadomienia.
- Testowalność: Uruchom na sample danych (ostatnie losowanie), sprawdź balans via stats.

### US-011: Ręczna korekta losowania jako fallback
Opis: Jako organizator, chcę ręcznie edytować składy, jeśli algorytm nie osiągnie balansu.
Kryteria akceptacji:
- Podgląd statystyk (widoczne skill rate drużyn, jak i poszczególnych zawodników bo robi to admin); drag-and-drop edycja.
- Potwierdzenie zmian; powiadomienia.
- Opcja ponownego losowania.
- Testowalność: Symuluj fallback, edytuj, sprawdź powiadomienia.

### US-012: Przeglądanie dashboardu powitalnego
Opis: Jako zalogowany użytkownik, chcę zobaczyć dashboard z najbliższym wydarzeniem.
Kryteria akceptacji:
- Sekcja: najbliższe wydarzenie (jeśli zapisany), lista nadchodzących.
- Personalizacja po roli; real-time updates.
- Testowalność: Zaloguj, sprawdź wyświetlanie.

### US-013: Zarządzanie wydarzeniami przez Admina (nadzór)
Opis: Jako admin, chcę edytować/usunąć dowolne wydarzenie.
Kryteria akceptacji:
- Pełny dostęp do wszystkich wydarzeń; edycja parametrów.
- Usuwanie z potwierdzeniem; archiwum historyczne.
- Testowalność: Edytuj wydarzenie, sprawdź zmiany.

### US-014: Obsługa edge case: Powiązanie nowej rejestracji z istniejącym profilem
Opis: Jako admin, chcę powiązać nowe konto z istniejącym profilem gracza.
Kryteria akceptacji:
- Opcja match podczas zatwierdzania; merge danych.
- Unikanie duplikatów; powiadomienie.
- Testowalność: Symuluj duplikat, powiąż, sprawdź merged profil.

### US-015: Obsługa edge case: Losowanie z niekompletnymi danymi
Opis: Jako system, algorytm powinien obsłużyć brak pozycji/skill rate.
Kryteria akceptacji:
- Default values (np. neutralna pozycja); ostrzeżenie dla admina.
- Fallback do manualnego jeśli >20% brakujących.
- Testowalność: Unit test z sample brakujących danych, sprawdź ostrzeżenie.

### US-016: Wylogowanie użytkownika
Opis: Jako użytkownik, chcę się wylogować dla bezpieczeństwa.
Kryteria akceptacji:
- Przycisk w nawigacji; czyszczenie sesji.
- Przekierowanie do login.
- Testowalność: Wyloguj, sprawdź brak dostępu.

## 6. Metryki sukcesu

- Czas interakcji: <2 min na rejestrację, zapis, tworzenie wydarzenia; mierzone manualnie stoperem w testach usability, z baseline'ami w demo (np. 1:30 min średnio).
- Efektywność algorytmu: >=80% sukcesu (balans <=7% w 20 próbach); mierzone unit tests i symulacjami na 50+ sample danych graczy; fallback użycie <20%.
- Użyteczność: Redukcja błędów z Messengera (kolejność via timestamp, real-time updates); qualitative feedback od grupy testowej (znajomi); brak formalnych KPI retencji w MVP.
- Adopcja: 100% grupy testowej (mała skala) używa platformy zamiast Messengera; end-to-end flows płynne w demo po etapach.
- Techniczne: MVP ukończone w 3 tygodnie; kod ESLint clean, modular; RODO compliance (zgody, audit logs); brak błędów w manualnych end-to-end tests.
- Future metrics: Automated UX tracking dla skalowalności (>50 users), retencja 70% po MVP.
