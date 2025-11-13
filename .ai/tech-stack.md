Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testy jednostkowe i integracyjne:

- Vitest jako główny framework testowy dla testów jednostkowych i integracyjnych
- @testing-library/react do testowania komponentów React
- @vitest/coverage-v8 do analizy pokrycia kodu testami
- MSW (Mock Service Worker) do mockowania żądań HTTP w testach
- @testcontainers/postgresql do testów integracyjnych z prawdziwą bazą PostgreSQL w kontenerze Docker
- @faker-js/faker do generowania realistycznych danych testowych
- @anatine/zod-mock do automatycznego tworzenia mocków z schematów Zod

Testy E2E i dostępności:

- Playwright jako framework do testów end-to-end
- @axe-core/playwright do automatycznych testów dostępności WCAG 2.1 Level AA
- Natywne screenshots Playwright do testów regresji wizualnej

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD z dedykowanymi job'ami dla testów jednostkowych, integracyjnych, E2E oraz mutation testing
- Cloudflare pages jako hosting applikacji Astro
