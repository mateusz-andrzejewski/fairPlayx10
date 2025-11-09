import type { APIRoute } from "astro";

import { createPlayersService } from "../../../lib/services/players.service";
import { validateListPlayersParams } from "../../../lib/validation/players";

/**
 * GET /api/players
 *
 * Pobiera paginowaną listę aktywnych graczy z opcjonalnym filtrowaniem.
 * Wymaga autoryzacji z rolą admin lub organizer.
 * Oceny umiejętności są widoczne tylko dla użytkowników admin.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Wyciągnij i zwaliduj token JWT
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Brakujący lub nieprawidłowy nagłówek autoryzacji",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.slice(7); // Usuń prefiks "Bearer "

    // Pobierz użytkownika z tokena JWT
    const { data: userData, error: authError } = await locals.supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Nieprawidłowy lub wygasły token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobierz profil użytkownika z rolą
    const { data: profile, error: profileError } = await locals.supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at")
      .eq("id", parseInt(userData.user.id))
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "Nie znaleziono profilu użytkownika",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź autoryzację - tylko role admin i organizer mają dostęp
    if (profile.role !== "admin" && profile.role !== "organizer") {
      return new Response(
        JSON.stringify({
          error: "forbidden",
          message: "Niewystarczające uprawnienia. Wymagana rola admin lub organizer.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsuj i zwaliduj parametry zapytania
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());

    let validatedParams;
    try {
      validatedParams = validateListPlayersParams(rawParams);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowe parametry zapytania",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Określ czy użytkownik może zobaczyć oceny umiejętności (tylko admin)
    const canSeeSkillRate = profile.role === "admin" && validatedParams.include_skill_rate;

    // Wykonaj logikę biznesową
    const playersService = createPlayersService(locals.supabase);
    const result = await playersService.listPlayers(validatedParams, canSeeSkillRate);

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd w GET /api/players:", error);

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
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
