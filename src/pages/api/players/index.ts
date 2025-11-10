import type { APIRoute } from "astro";

import { createPlayersService } from "../../../lib/services/players.service";
import { validateListPlayersParams } from "../../../lib/validation/players";

/**
 * GET /api/players
 *
 * Pobiera paginowaną listę aktywnych graczy z opcjonalnym filtrowaniem.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
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

    // Wykonaj logikę biznesową
    const playersService = createPlayersService(locals.supabase);
    const result = await playersService.listPlayers(validatedParams);

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

