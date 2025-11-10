import type { APIRoute } from "astro";

import { createEventService } from "../../../lib/services/event.service";
import { validateListEventsParams } from "../../../lib/validation/event";

/**
 * GET /api/events
 *
 * Pobiera paginowaną listę aktywnych wydarzeń z opcjonalnym filtrowaniem.
 * TODO: Dodać kompleksową autoryzację (rola user/organizer/admin).
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // TODO: Dodać kompleksową autoryzację JWT i sprawdzenie roli
    // Tymczasowo pomijamy autoryzację dla testowania

    // Parsuj i zwaliduj parametry zapytania
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());

    let validatedParams;
    try {
      validatedParams = validateListEventsParams(rawParams);
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
    const eventService = createEventService(locals.supabase);
    const result = await eventService.listEvents(validatedParams);

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd w GET /api/events:", error);

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
