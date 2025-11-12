import type { APIRoute } from "astro";

import { createUsersService } from "../../../lib/services/users.service";
import { userIdParamSchema } from "../../../lib/validation/users";
import { requireAdmin } from "../../../lib/auth/request-actor";

/**
 * DELETE /api/users/{id}
 *
 * Wykonuje soft delete użytkownika poprzez ustawienie znacznika deleted_at.
 * Operacja wymaga roli admin i nie pozwala na usunięcie własnego konta.
 * Jest idempotentna - ponowne wywołanie na już usuniętym użytkowniku zwraca sukces.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Sprawdź uprawnienia - tylko administratorzy mogą usuwać użytkowników
    const adminActor = requireAdmin(locals);

    // Parsuj i zwaliduj parametr ścieżki
    const rawId = params.id;
    if (!rawId) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Brak wymaganego parametru id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedParams;
    try {
      validatedParams = userIdParamSchema.parse({ id: rawId });
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format parametru id",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }


    // Sprawdź czy użytkownik próbuje usunąć samego siebie
    if (adminActor.userId === validatedParams.id) {
      return new Response(
        JSON.stringify({
          error: "conflict",
          message: "Nie można usunąć własnego konta",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wykonaj soft delete
    const usersService = createUsersService(locals.supabase);
    const result = await usersService.softDeleteUser(adminActor.userId, validatedParams.id);

    // Zwróć odpowiedź w zależności od wyniku
    if (result.deleted) {
      // Pomyślne usunięcie - 204 No Content
      return new Response(null, {
        status: 204,
        headers: {
          "Cache-Control": "private, no-store",
        },
      });
    } else {
      // Użytkownik nie istnieje lub już został usunięty
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Użytkownik nie został znaleziony",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Nieoczekiwany błąd w DELETE /api/users/[id]:", error);

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
