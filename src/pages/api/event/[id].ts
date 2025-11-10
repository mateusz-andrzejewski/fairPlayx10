import type { APIRoute } from "astro";

import { createEventService } from "../../../lib/services/event.service";
import { validateEventIdParam, updateEventBodySchema } from "../../../lib/validation/event";

/**
 * PATCH /api/event/{id}
 *
 * Częściowo aktualizuje dane wydarzenia.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametr id z ścieżki
    let validatedParams;
    try {
      validatedParams = validateEventIdParam(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format ID wydarzenia",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Parsuj i zwaliduj ciało żądania
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format danych JSON",
          details: "Ciało żądania musi być prawidłowym JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedBody;
    try {
      validatedBody = updateEventBodySchema.parse(requestBody);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Dane wejściowe nie przeszły walidacji",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Wywołaj logikę biznesową
    const eventService = createEventService(locals.supabase);
    const updatedEvent = await eventService.updateEvent(
      validatedParams.id,
      validatedBody,
      1, // TODO: Pobierz ID aktualnego użytkownika z kontekstu autoryzacji
      false // TODO: Sprawdź czy użytkownik jest administratorem
    );

    // 4. Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy (np. brak uprawnień, nieprawidłowe dane)
    if (error instanceof Error) {
      if (error.message.includes("nie zostało znalezione") || error.message.includes("nie istnieje")) {
        return new Response(
          JSON.stringify({
            error: "not_found",
            message: "Wydarzenie o podanym ID nie zostało znalezione lub jest niedostępne",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message.includes("Brak uprawnień")) {
        return new Response(
          JSON.stringify({
            error: "forbidden",
            message: "Brak uprawnień do wykonania tej operacji",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (
        error.message.includes("Data wydarzenia") ||
        error.message.includes("Maksymalna liczba miejsc") ||
        error.message.includes("Nie można zmienić statusu") ||
        error.message.includes("Tylko administrator")
      ) {
        return new Response(
          JSON.stringify({
            error: "validation_error",
            message: error.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    console.error("Nieoczekiwany błąd w PATCH /api/event/[id]:", error);

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
