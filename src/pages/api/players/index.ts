import type { APIRoute } from "astro";

import { createPlayersService } from "../../../lib/services/players.service";
import { validateListPlayersParams } from "../../../lib/validation/players";
import { createPlayerSchema } from "../../../lib/validation/players";
import { requireOrganizer } from "../../../lib/auth/request-actor";

/**
 * GET /api/players
 *
 * Pobiera paginowaną listę aktywnych graczy z opcjonalnym filtrowaniem.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź uprawnienia - administratorzy i organizatorzy mogą przeglądać graczy
    const organizerActor = requireOrganizer(locals);

    // Parsuj i zwaliduj parametry zapytania
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());

    let validatedParams;
    try {
      validatedParams = validateListPlayersParams(rawParams);
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
    const playersService = createPlayersService(locals.supabase);
    const result = await playersService.listPlayers(validatedParams, organizerActor.role === "admin");

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Nieoczekiwany błąd w GET /api/players:", error);

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
 * POST /api/players
 *
 * Tworzy nowego gracza w systemie.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź uprawnienia - administratorzy i organizatorzy mogą tworzyć graczy
    const organizerActor = requireOrganizer(locals);

    // Parsuj i zwaliduj ciało żądania
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
      validatedBody = createPlayerSchema.parse(requestBody);
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
    const playersService = createPlayersService(locals.supabase);
    const createdPlayer = await playersService.createPlayer(validatedBody, organizerActor.role === "admin");

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(createdPlayer), {
      status: 201,
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

    console.error("Nieoczekiwany błąd w POST /api/players:", error);

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
