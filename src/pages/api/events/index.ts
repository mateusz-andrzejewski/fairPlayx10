import type { APIRoute } from "astro";

import { createEventService } from "../../../lib/services/event.service";
import { validateListEventsParams, createEventBodySchema } from "../../../lib/validation/event";
import { requireActor, UnauthorizedError } from "../../../lib/auth/request-actor";

/**
 * GET /api/events
 *
 * Pobiera paginowaną listę aktywnych wydarzeń z opcjonalnym filtrowaniem.
 * TODO: Dodać kompleksową autoryzację (rola user/organizer/admin).
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź uprawnienia - wszyscy zalogowani użytkownicy mogą przeglądać wydarzenia
    requireActor(locals);

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

/**
 * POST /api/events
 *
 * Tworzy nowe wydarzenie.
 * Dostępne dla organizatorów i administratorów.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź uprawnienia - tylko organizatorzy i administratorzy mogą tworzyć wydarzenia
    const actor = requireActor(locals);
    
    if (actor.role !== "admin" && actor.role !== "organizer") {
      return new Response(
        JSON.stringify({
          error: "forbidden",
          message: "Brak uprawnień do tworzenia wydarzeń. Tylko administratorzy i organizatorzy mogą tworzyć wydarzenia.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsuj i zwaliduj ciało żądania
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
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
      validatedBody = createEventBodySchema.parse(requestBody);
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

    // Wykonaj logikę biznesową
    const eventService = createEventService(locals.supabase);
    const createdEvent = await eventService.createEvent(validatedBody, actor.userId);

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(createdEvent), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: error.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź czy to błąd biznesowy
    if (error instanceof Error) {
      if (
        error.message.includes("Data wydarzenia") ||
        error.message.includes("Maksymalna liczba miejsc") ||
        error.message.includes("Nazwa wydarzenia")
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
