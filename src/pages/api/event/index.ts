import type { APIRoute } from "astro";

import { createEventService } from "../../../lib/services/event.service";
import { createEventBodySchema } from "../../../lib/validation/event";

/**
 * POST /api/event
 *
 * Tworzy nowe wydarzenie w systemie.
 * TODO: Dodać kompleksową autoryzację (rola organizer lub admin).
 * Tymczasowo zakładamy uprawnienia organizatora dla testowania.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // TODO: Dodać kompleksową autoryzację JWT i sprawdzenie roli
    // Tymczasowo zakładamy ID organizatora dla testowania
    const organizerId = 1; // TODO: Pobrać z locals.user.id po dodaniu autoryzacji

    // Parsuj i zwaliduj ciało żądania
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format JSON w ciele żądania",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedData;
    try {
      validatedData = createEventBodySchema.parse(requestBody);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowe dane w ciele żądania",
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
    const createdEvent = await eventService.createEvent(validatedData, organizerId);

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(createdEvent), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Location: `/api/event/${createdEvent.id}`,
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy z serwisu
    if (error instanceof Error) {
      if (error.message.includes("już istnieje")) {
        return new Response(
          JSON.stringify({
            error: "conflict",
            message: error.message,
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      if (error.message.includes("nie istnieje")) {
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

    console.error("Nieoczekiwany błąd w POST /api/events:", error);

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd podczas tworzenia wydarzenia",
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
