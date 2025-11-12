# 🔍 Debug Guide: Zapętlone Requesty do `/api/users?select`

## ✅ Zmiany Wprowadzone

### 1. **Usunięto Nieprawidłową Dyrektywę `"use client"`**
- **Plik:** `src/components/ToastProvider.tsx`
- **Problem:** Dyrektywa Next.js w projekcie Astro może powodować problemy z hydratacją
- **Rozwiązanie:** Usunięto dyrektywę - w Astro używamy `client:load` / `client:only`

### 2. **Dodano Rozbudowane Logowanie**
Dodano szczegółowe logi w następujących miejscach:

#### a) API Endpoint `/api/users/index.ts`
```
=== [DEBUG] /api/users Request ===
URL: ...
Method: ...
Headers: ...
Referrer: ...
User: ... (role)
Actor: ...
```

#### b) Komponent `UsersManagementPage.tsx`
```
[UsersManagementPage] useEffect triggered
[UsersManagementPage] loadUsers called
[UsersManagementPage] Fetching /api/users with params: ...
```

#### c) Walidacja Parametrów `src/lib/validation/users.ts`
```
[validateListUsersParams] Unknown parameters detected: ['select']
```

### 3. **Dodano Strict Mode do Walidacji**
- Schemat Zod teraz używa `.strict()` - odrzuci nieznane parametry jak `select`

### 4. **Utworzono Narzędzie Debugowania**
- **URL:** `http://localhost:4321/check-service-worker.html`
- **Funkcje:**
  - ✅ Wykrywa service workers
  - ✅ Wykrywa cached requesty
  - ✅ Pokazuje localStorage/sessionStorage
  - ✅ Przyciski do czyszczenia wszystkiego

---

## 🎯 Jak Debugować Problem

### **Krok 1: Sprawdź Narzędzie Debugowania**

1. **Otwórz:** `http://localhost:4321/check-service-worker.html`
2. **Sprawdź:**
   - Czy są service workery?
   - Czy są cache'owane requesty?
   - Co jest w localStorage/sessionStorage?
3. **Jeśli znajdziesz coś podejrzanego:**
   - Kliknij "Clear All" i przeładuj stronę

### **Krok 2: Sprawdź Logi Serwera**

Uruchom serwer deweloperski i obserwuj konsole:

```bash
npm run dev
```

Otwórz stronę logowania i poszukaj w konsoli:

```
=== [DEBUG] /api/users Request ===
```

**Zwróć uwagę na:**
- `Referrer:` - z jakiej strony przychodzi request?
- `User:` - czy to anonymous czy zalogowany użytkownik?
- `Headers:` - czy są nietypowe headery?

### **Krok 3: Sprawdź Network Tab w Przeglądarce**

1. **Otwórz DevTools** (F12)
2. **Zakładka Network**
3. **Włącz "Preserve log"**
4. **Odśwież stronę logowania**
5. **Znajdź requesty do `/api/users?select`**
6. **Kliknij na request i sprawdź:**
   - **Initiator** - który kod/plik wywołuje request?
   - **Request Headers** - czy są nietypowe headery?
   - **Call Stack** - dokładny stos wywołań

### **Krok 4: Wyłącz Rozszerzenia Przeglądarki**

Request może pochodzić z rozszerzeń. Sprawdź:

1. **Otwórz tryb Incognito** (bez rozszerzeń)
2. **Sprawdź czy problem znika**
3. **Jeśli tak, wyłączaj rozszerzenia jedno po drugim:**
   - `chrome://extensions/` (Chrome)
   - `about:addons` (Firefox)
   - `edge://extensions/` (Edge)

**Podejrzane typy rozszerzeń:**
- 🔍 API Testing tools (Postman, Insomnia)
- 🔍 REST Client extensions
- 🔍 GraphQL tools (Apollo DevTools)
- 🔍 Security scanners (Burp Suite, ZAP)
- 🔍 Performance monitors (Sentry, LogRocket)
- 🔍 Ad blockers (czasami skanują API)

### **Krok 5: Wyczyść Całkowicie Przeglądarkę**

```bash
# W DevTools -> Application -> Storage
# Kliknij "Clear site data"
```

Lub manualnie:
1. **Clear browsing data** (Ctrl+Shift+Del)
2. **Zaznacz wszystko:**
   - Cached images and files
   - Cookies and site data
   - Hosted app data
3. **Time range:** All time
4. **Clear data**

### **Krok 6: Sprawdź Narzędzia IDE/VS Code**

Niektóre rozszerzenia VS Code mogą automatycznie skanować API:
- REST Client
- Thunder Client
- API Testing tools

**Wyłącz wszystkie rozszerzenia VS Code i sprawdź ponownie.**

### **Krok 7: Sprawdź Proxy/VPN**

Jeśli używasz:
- Corporate proxy
- VPN z monitoringiem
- Network monitoring tools

**Mogą one automatycznie skanować endpointy.**

---

## 🔍 Interpretacja Logów

### Przykład 1: Request z Rozszerzenia Przeglądarki

```
=== [DEBUG] /api/users Request ===
URL: http://localhost:4321/api/users?select
Referrer: 
User: anonymous
Headers: {
  "x-extension-id": "chrome-extension://...",
  ...
}
```

**Diagnoza:** Rozszerzenie Chrome wywołuje request. Wyłącz rozszerzenia.

### Przykład 2: Request z Cached Code

```
[UsersManagementPage] useEffect triggered, initialUsers.length: 0
[UsersManagementPage] Calling loadUsers()
[UsersManagementPage] Fetching /api/users with params: page=1&limit=20
```

**Diagnoza:** Normalny request z komponentu. Sprawdź czy nie jest wywoływany wielokrotnie.

### Przykład 3: Nieznany Parametr

```
[validateListUsersParams] Unknown parameters detected: ['select']
Full params: { select: '' }
```

**Diagnoza:** Ktoś/coś wysyła parametr `select` którego nie używamy. Sprawdź Initiator w Network tab.

---

## 🚨 Możliwe Przyczyny (Rangowane)

### **Najczęstsze:**
1. ✅ Browser extension (API tester, REST client)
2. ✅ Cached service worker z poprzedniej wersji
3. ✅ Stale browser cache
4. ✅ Multiple tabs otwartych

### **Mniej Prawdopodobne:**
5. VS Code extension
6. Proxy/VPN monitoring
7. Security scanner w tle
8. Supabase Studio/DevTools

### **Bardzo Rzadkie:**
9. Malware/Adware
10. Network layer injection

---

## ✅ Checklist Debugowania

- [ ] Sprawdziłem `/check-service-worker.html`
- [ ] Wyczyściłem service workers
- [ ] Wyczyściłem cache przeglądarki (Ctrl+Shift+Del)
- [ ] Sprawdziłem w trybie Incognito
- [ ] Wyłączyłem wszystkie rozszerzenia przeglądarki
- [ ] Sprawdziłem logi serwera
- [ ] Sprawdziłem Network tab -> Initiator
- [ ] Wyłączyłem rozszerzenia VS Code
- [ ] Sprawdziłem czy mam tylko jedną kartę otwartą
- [ ] Sprawdziłem proxy/VPN

---

## 📞 Jeśli Nic Nie Pomogło

Jeśli po wykonaniu wszystkich kroków problem nadal występuje:

1. **Zrób screenshot Network tab** z widocznym:
   - Requestem `/api/users?select`
   - Zakładką "Initiator"
   - Call stackiem

2. **Skopiuj logi z konsoli serwera** (szczególnie DEBUG logi)

3. **Sprawdź czy to nie jest:**
   - Multiple tabs problem (zamknij wszystkie karty oprócz jednej)
   - Browser się nie odświeża (hard refresh: Ctrl+Shift+R)

---

## 🔧 Przywrócenie Zmian (Jeśli Chcesz Rollback)

Zmiany były głównie diagnostyczne. Jeśli chcesz przywrócić:

```bash
git diff src/components/ToastProvider.tsx
git diff src/pages/api/users/index.ts
git diff src/lib/validation/users.ts
git diff src/components/users/UsersManagementPage.tsx
```

Ale **zalecam zachowanie zmian** - pomagają w debugowaniu i są dobrą praktyką.

---

**Powodzenia! 🎯**

