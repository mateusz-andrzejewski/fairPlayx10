import type { APIRoute } from "astro";

import { createPlayersService } from "../../../lib/services/players.service";
import { createPlayerSchema } from "../../../lib/validation/players";
import type { CreatePlayerCommand } from "../../../types";

/**
 * POST /api/player
 *
 * Tworzy nowego gracza w systemie.
 * TODO: Dodać kompleksową autoryzację (rola admin lub organizer).
 * Tymczasowo zakładamy uprawnienia administratora dla testowania.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // TODO: Dodać kompleksową autoryzację JWT
    // Tymczasowo zakładamy uprawnienia administratora
    const isAdmin = true;

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
      validatedData = createPlayerSchema.parse(requestBody);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Dodać sprawdzenie czy organizer próbuje ustawić skill_rate

    // Przygotuj command dla serwisu
    const command: CreatePlayerCommand = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      position: validatedData.position,
      skill_rate: validatedData.skill_rate,
      date_of_birth: validatedData.date_of_birth,
    };

    // Wykonaj logikę biznesową
    const playersService = createPlayersService(locals.supabase);
    const createdPlayer = await playersService.createPlayer(command, isAdmin);

    // Zwróć pomyślną odpowiedź
    return new Response(JSON.stringify(createdPlayer), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Location: `/api/player/${createdPlayer.id}`,
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd konfliktu z serwisu
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

    console.error("Nieoczekiwany błąd w POST /api/player:", error);

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd podczas tworzenia gracza",
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
