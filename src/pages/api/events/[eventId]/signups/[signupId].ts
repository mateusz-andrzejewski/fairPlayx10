import type { APIRoute } from "astro";

import { createEventSignupsService } from "../../../../../lib/services/eventSignups.service";
import { updateEventSignupSchema, eventSignupIdParamsSchema } from "../../../../../lib/validation/eventSignups";
import { requireActor } from "../../../../../lib/auth/request-actor";

/**
 * PATCH /api/events/{eventId}/signups/{signupId}
 *
 * Aktualizuje status istniejącego zapisu na wydarzenie. Dostępne dla organizatora wydarzenia lub administratora.
 * Obsługuje przejścia statusów: pending -> confirmed|withdrawn, confirmed -> withdrawn.
 * W przypadku zmiany na withdrawn zmniejsza licznik zapisów w wydarzeniu.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametry ścieżki (eventId i signupId)
    let validatedParams;
    try {
      validatedParams = eventSignupIdParamsSchema.parse(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format parametrów ścieżki",
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
      validatedBody = updateEventSignupSchema.parse(requestBody);
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
    const updatedSignup = await eventSignupsService.updateEventSignupStatus(
      validatedParams.eventId,
      validatedParams.signupId,
      validatedBody,
      actor
    );

    // 4. Zwróć pomyślną odpowiedź z zaktualizowanym EventSignupDTO
    return new Response(JSON.stringify(updatedSignup), {
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

      // Błędy związane z walidacją biznesową (niedozwolone przejścia statusów)
      if (error.message.includes("Niedozwolone przejście statusu")) {
        return new Response(
          JSON.stringify({
            error: "invalid_status_transition",
            message: error.message,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Błędy związane z walidacją biznesową
      if (
        error.message.includes("Organizator może zarządzać zapisami tylko") ||
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
        error.message.includes("Zapis nie został znaleziony") ||
        error.message.includes("nie należy do podanego wydarzenia")
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
    }

    console.error("Nieoczekiwany błąd w PATCH /api/events/[eventId]/signups/[signupId]:", error);

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
 * DELETE /api/events/{eventId}/signups/{signupId}
 *
 * Wycofuje zapis z wydarzenia. Gracz może wycofać własny zapis, organizator może wycofać
 * zapisy tylko na własnych wydarzeniach, administrator może wycofać dowolny zapis.
 * Zapis zostaje oznaczony jako withdrawn zamiast fizycznego usunięcia.
 */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametry ścieżki (eventId i signupId)
    let validatedParams;
    try {
      validatedParams = eventSignupIdParamsSchema.parse(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format parametrów ścieżki",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const actor = requireActor(locals);

    // 2. Wywołaj logikę biznesową wycofania zapisu
    const eventSignupsService = createEventSignupsService(locals.supabase);
    await eventSignupsService.deleteEventSignup(validatedParams.eventId, validatedParams.signupId, actor);

    // 3. Zwróć pomyślną odpowiedź bez treści (204 No Content)
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy i mapuj na odpowiednie kody statusu
    if (error instanceof Error) {
      // Błędy związane z brakiem uprawnień
      if (error.message.includes("Brak uprawnień do wycofywania zapisów")) {
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
        error.message.includes("Organizator może zarządzać zapisami tylko") ||
        error.message.includes("Gracz może wycofać tylko własny zapis") ||
        error.message.includes("Zapis został już wcześniej wycofany")
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
        error.message.includes("Zapis nie został znaleziony") ||
        error.message.includes("nie należy do podanego wydarzenia")
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
    }

    console.error("Nieoczekiwany błąd w DELETE /api/events/[eventId]/signups/[signupId]:", error);

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
