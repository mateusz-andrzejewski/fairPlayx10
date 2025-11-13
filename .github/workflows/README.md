# GitHub Actions Workflows

## Przegląd

Projekt zawiera dwa główne workflow:

### 1. `build.yml` - Build and Test
Uruchamia się przy każdym pushu do `main` i:
- Instaluje zależności
- Uruchamia testy jednostkowe
- Buduje projekt

### 2. `master.yml` - Deploy to Cloudflare Pages
Uruchamia się przy każdym pushu do `main` oraz może być uruchomiony ręcznie przez GitHub UI (workflow_dispatch). Składa się z dwóch zadań:

#### Job 1: Test
- Instaluje zależności
- Uruchamia testy jednostkowe (bez testów E2E)
- Buduje projekt

#### Job 2: Deploy
- Buduje projekt
- Wdraża na Cloudflare Pages przy użyciu Wrangler

## Wymagane Secrets w GitHub

Aby workflows działały poprawnie, musisz dodać następujące secrets w Settings > Secrets and variables > Actions:

### Secrets dla Supabase:
- `PUBLIC_SUPABASE_URL` - URL Twojego projektu Supabase (np. `https://xxx.supabase.co`)
- `PUBLIC_SUPABASE_ANON_KEY` - Publiczny klucz anon Supabase

### Secrets dla Cloudflare (tylko dla master.yml):
- `CLOUDFLARE_API_TOKEN` - API Token z Cloudflare Dashboard
  - Przejdź do: Profile > API Tokens > Create Token
  - Wybierz: "Edit Cloudflare Workers" template
  - Lub użyj custom token z uprawnieniami:
    - Account > Cloudflare Pages > Edit
- `CLOUDFLARE_ACCOUNT_ID` - ID Twojego konta Cloudflare
  - Znajdziesz w: Cloudflare Dashboard > Workers & Pages > Overview (po prawej stronie)

## Konfiguracja projektu Cloudflare Pages

1. **Utwórz projekt w Cloudflare Pages:**
   - Przejdź do: Workers & Pages > Create application > Pages
   - Nazwa projektu: `fairplayx10` (zgodnie z wrangler.toml)

2. **Skonfiguruj zmienne środowiskowe w Cloudflare:**
   - W projekcie przejdź do: Settings > Environment variables
   - Dodaj:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`

3. **Skonfiguruj KV Namespace dla sesji:**
   ```bash
   npx wrangler kv:namespace create "SESSION"
   ```
   - Skopiuj ID z output
   - Zaktualizuj `wrangler.toml` (linia 12) z otrzymanym ID
   - W Cloudflare Dashboard dodaj binding:
     - Przejdź do: Settings > Functions > KV namespace bindings
     - Variable name: `SESSION`
     - KV namespace: wybierz utworzoną przestrzeń

## Struktura workflow zgodnie z best practices

✅ Używamy zmiennych środowiskowych na poziomie job (nie global)
✅ Używamy `npm ci` zamiast `npm install`
✅ Używamy najnowszych wersji akcji (v5, v6)
✅ Używamy wersji Node.js z `.nvmrc`
✅ Dodaliśmy caching dla npm w setup-node
✅ Dodaliśmy uprawnienia dla deployment job
✅ Używamy workflow_dispatch dla ręcznego uruchamiania

## Testowanie workflow lokalnie

Możesz przetestować deployment lokalnie:

```bash
# Build projektu
npm run build

# Deploy na Cloudflare Pages
npx wrangler pages deploy dist --project-name=fairplayx10
```

## Troubleshooting

### Problem: "Invalid binding SESSION"
- Upewnij się, że utworzyłeś KV namespace i dodałeś ID do `wrangler.toml`
- Sprawdź czy binding jest dodany w Cloudflare Dashboard

### Problem: "Unauthorized" podczas deployment
- Sprawdź czy `CLOUDFLARE_API_TOKEN` jest poprawny
- Sprawdź czy token ma odpowiednie uprawnienia (Cloudflare Pages Edit)

### Problem: Błędy testów
- Upewnij się, że zmienne `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` są ustawione w GitHub Secrets
- Sprawdź logi w Actions > konkretny run > konkretny job

## Przydatne linki

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)

