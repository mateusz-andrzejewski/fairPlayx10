import type { APIRoute } from "astro";

import { createEventSignupsService } from "../../../../lib/services/eventSignups.service";
import {
  createEventSignupSchema,
  eventIdParamSchema,
  listEventSignupsQuerySchema,
} from "../../../../lib/validation/eventSignups";
import { requireActor } from "../../../../lib/auth/request-actor";

/**
 * GET /api/events/{eventId}/signups
 *
 * Zwraca paginowaną listę zapisów na wskazane wydarzenie z możliwością filtrowania po statusie.
 * Dostępne tylko dla organizatorów danego wydarzenia oraz administratorów.
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametr eventId z ścieżki
    let validatedParams;
    try {
      validatedParams = eventIdParamSchema.parse(params);
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

    // 2. Parsuj i zwaliduj parametry query (paginacja, filtry)
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    let validatedQuery;
    try {
      validatedQuery = listEventSignupsQuerySchema.parse(queryParams);
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

    const actor = requireActor(locals);

    // 3. Wywołaj logikę biznesową
    const eventSignupsService = createEventSignupsService(locals.supabase);
    const signupsList = await eventSignupsService.listEventSignups(validatedParams.eventId, validatedQuery, {
      userId: actor.userId,
      role: actor.role,
    });

    // 4. Zwróć pomyślną odpowiedź z EventSignupsListResponseDTO
    return new Response(JSON.stringify(signupsList), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy i mapuj na odpowiednie kody statusu
    if (error instanceof Error) {
      // Błędy związane z brakiem uprawnień
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

      // Błędy związane z walidacją biznesową
      if (error.message.includes("Brak dostępu do zapisów")) {
        return new Response(
          JSON.stringify({
            error: "forbidden",
            message: error.message,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Błędy związane z nieznalezionymi zasobami
      if (error.message.includes("Wydarzenie nie zostało znalezione")) {
        return new Response(
          JSON.stringify({
            error: "not_found",
            message: error.message,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    console.error("Nieoczekiwany błąd w GET /api/events/[eventId]/signups:", error);

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
 * POST /api/events/{eventId}/signups
 *
 * Pozwala graczowi zapisać się na wydarzenie lub organizatorowi/adminowi dodać konkretnego gracza do wydarzenia.
 * Aktualizuje licznik zapisów i zwraca nowo utworzony rekord zapisu.
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametr eventId z ścieżki
    let validatedParams;
    try {
      validatedParams = eventIdParamSchema.parse(params);
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
      validatedBody = createEventSignupSchema.parse(requestBody);
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

    const actor = requireActor(locals);

    // 3. Wywołaj logikę biznesową
    const eventSignupsService = createEventSignupsService(locals.supabase);
    const newSignup = await eventSignupsService.createEventSignup(validatedParams.eventId, actor, validatedBody);

    // 4. Zwróć pomyślną odpowiedź z EventSignupDTO
    return new Response(JSON.stringify(newSignup), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy i mapuj na odpowiednie kody statusu
    if (error instanceof Error) {
      // Błędy związane z brakiem uprawnień
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

      // Błędy związane z walidacją biznesową
      if (
        error.message.includes("Organizator musi podać") ||
        error.message.includes("Konto gracza nie jest powiązane") ||
        error.message.includes("Wydarzenie nie jest aktywne") ||
        error.message.includes("Wydarzenie jest już pełne") ||
        error.message.includes("Nieprawidłowa rola użytkownika")
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

      // Błędy związane z nieznalezionymi zasobami
      if (
        error.message.includes("Wydarzenie nie zostało znalezione") ||
        error.message.includes("Gracz nie został znaleziony")
      ) {
        return new Response(
          JSON.stringify({
            error: "not_found",
            message: error.message,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Błędy konfliktu (już zapisany)
      if (error.message.includes("już zapisany")) {
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
    }

    console.error("Nieoczekiwany błąd w POST /api/events/[eventId]/signups:", error);

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
