import type { APIRoute } from "astro";

import { createDashboardService } from "../../lib/services/dashboard/dashboard.service";
import { ensureDevDashboardData } from "../../lib/dev/ensureDevDashboardData";
import { isDashboardAuthDisabled } from "../../lib/utils/featureFlags";

/**
 * GET /api/dashboard
 *
 * Zwraca agregację danych kontekstowych dla zalogowanego użytkownika,
 * obejmującą profil, nadchodzące wydarzenia, własne zapisy,
 * wydarzenia organizowane oraz liczbę oczekujących użytkowników (dla administratorów).
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const authDisabled = locals.isDashboardAuthDisabled ?? isDashboardAuthDisabled();

    let user = locals.user;

    if (authDisabled) {
      user = await ensureDevDashboardData(locals.supabase);
      locals.user = user;
    }

    // Odczytujemy dane użytkownika z kontekstu (auth zostanie dodane później)
    // TODO: Implement authentication middleware
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Brak sesji użytkownika",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja statusu użytkownika - tylko aktywni użytkownicy mogą korzystać z dashboardu
    if (user.status === "pending") {
      return new Response(
        JSON.stringify({
          error: "forbidden",
          message: "Konto użytkownika oczekuje na zatwierdzenie",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź czy użytkownik ma powiązany profil gracza (wymagane dla większości funkcji)
    if (!user.player_id) {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Profil gracza nie został znaleziony",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wykonaj logikę biznesową - pobierz dane dashboardu
    const dashboardService = createDashboardService(locals.supabase);
    const dashboardData = await dashboardService.getDashboardData(
      user.id,
      user.role,
      user.player_id ?? undefined
    );

    // Zwróć pomyślną odpowiedź z danymi dashboardu
    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store", // Dane wrażliwe, nie cachuj
      },
    });
  } catch (error) {
    // Logowanie błędów dla diagnostyki
    console.error("Dashboard fetch failed:", {
      userId: locals.user?.id,
      cause: error instanceof Error ? error.message : "Unknown error",
    });

    // Sprawdź czy to błąd związany z nieistniejącym profilem użytkownika
    if (error instanceof Error && error.message.includes("User profile not found")) {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Profil użytkownika nie istnieje",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ogólny błąd serwera dla pozostałych przypadków
    return new Response(
      JSON.stringify({
        error: "internal_server_error",
        message: "Wystąpił błąd serwera podczas pobierania danych dashboardu",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Wyłącz prerendering dla endpointów API
export const prerender = false;
