import type { APIRoute } from "astro";

import { createPlayersService } from "../../../lib/services/players.service";
import { validatePlayerIdParam, updatePlayerSchema } from "../../../lib/validation/players";

/**
 * GET /api/player/{id}
 *
 * Pobiera szczegółowe informacje o pojedynczym graczu.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametr id z ścieżki
    let validatedParams;
    try {
      validatedParams = validatePlayerIdParam(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format ID gracza",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Wywołaj logikę biznesową
    const playersService = createPlayersService(locals.supabase);
    const player = await playersService.getPlayerById(validatedParams.id, true);

    // 3. Zwróć odpowiedź w zależności od wyniku
    if (!player) {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Gracz o podanym ID nie został znaleziony lub jest niedostępny",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(player), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd w GET /api/player/[id]:", error);

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
 * PATCH /api/player/{id}
 *
 * Częściowo aktualizuje dane gracza.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Parsuj i zwaliduj parametr id z ścieżki
    let validatedParams;
    try {
      validatedParams = validatePlayerIdParam(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format ID gracza",
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
      validatedBody = updatePlayerSchema.parse(requestBody);
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
    const playersService = createPlayersService(locals.supabase);
    const updatedPlayer = await playersService.updatePlayer(validatedParams.id, validatedBody, true); // TODO: Implement proper auth check

    // 4. Zwróć odpowiedź w zależności od wyniku
    if (!updatedPlayer) {
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Gracz o podanym ID nie został znaleziony lub jest niedostępny",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(updatedPlayer), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd biznesowy (np. konflikt danych)
    if (error instanceof Error && error.message.includes("już istnieje")) {
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

    console.error("Nieoczekiwany błąd w PATCH /api/player/[id]:", error);

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
