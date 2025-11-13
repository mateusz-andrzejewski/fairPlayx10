import type { APIRoute } from "astro";

import { createUsersService } from "../../../lib/services/users.service";
import { validateListUsersParams } from "../../../lib/validation/users";
import { requireAdmin } from "../../../lib/auth/request-actor";

/**
 * GET /api/users
 *
 * Pobiera paginowaną listę użytkowników z opcjonalnym filtrowaniem.
 * Wymaga autoryzacji Bearer i roli admin - implementacja zostanie dodana później.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Dodaj rozbudowane logowanie do debugowania
    console.log("\n=== [DEBUG] /api/users Request ===");
    console.log("URL:", request.url);
    console.log("Method:", request.method);
    console.log("Headers:", Object.fromEntries(request.headers.entries()));
    console.log("Referrer:", request.referrer);
    console.log("User:", locals.user ? `${locals.user.email} (${locals.user.role})` : "anonymous");
    console.log("Actor:", locals.actor);

    // Sprawdź uprawnienia - tylko administratorzy mogą przeglądać użytkowników
    requireAdmin(locals);

    // Parsuj i zwaliduj parametry zapytania z URL
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());
    console.log("[API] /api/users params:", rawParams);

    let validatedParams;
    try {
      validatedParams = validateListUsersParams(rawParams);
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
    const usersService = createUsersService(locals.supabase);
    const result = await usersService.listUsers(validatedParams);

    // Zwróć pomyślną odpowiedź z metadanymi paginacji
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd w GET /api/users:", error);

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
