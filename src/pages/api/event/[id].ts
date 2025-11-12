import type { APIRoute } from "astro";

import { createEventService } from "../../../lib/services/event.service";
import { validateEventIdParam, updateEventBodySchema } from "../../../lib/validation/event";
import { requireActor, UnauthorizedError } from "../../../lib/auth/request-actor";

/**
 * GET /api/event/{id}
 *
 * Zwraca szczegóły pojedynczego wydarzenia wraz z listą zapisów.
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

    // 2. Wywołaj logikę biznesową (pomiń autoryzację na razie)
    const eventService = createEventService(locals.supabase);
    const eventDetail = await eventService.getEventById(validatedParams.id);

    // 3. Zwróć odpowiedź na podstawie wyniku
    if (!eventDetail) {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Wydarzenie o podanym ID nie zostało znalezione",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Zwróć pomyślną odpowiedź z EventDetailDTO
    return new Response(JSON.stringify(eventDetail), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania";

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

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
    const actor = requireActor(locals);
    const updatedEvent = await eventService.updateEvent(
      validatedParams.id,
      validatedBody,
      actor.userId,
      actor.role === "admin"
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
 * DELETE /api/event/{id}
 *
 * Przeprowadza soft delete wydarzenia (ustawia deleted_at).
 * Dostępne wyłącznie dla administratorów. Zachowuje historię bez permanentnego usunięcia.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // 2. Wywołaj logikę biznesową (pomiń autoryzację na razie)
    const eventService = createEventService(locals.supabase);
    const result = await eventService.softDeleteEvent(validatedParams.id);

    // 3. Zwróć odpowiedź na podstawie wyniku operacji
    if (result === "not_found") {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Wydarzenie o podanym ID nie zostało znalezione lub zostało już usunięte",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Zwróć pomyślną odpowiedź bez treści dla soft delete
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania";

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message,
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
