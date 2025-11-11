import type { APIRoute } from "astro";

import { createTeamAssignmentsService } from "../../../../lib/services/team-assignments.service";
import {
  createTeamAssignmentsSchema,
  eventIdParamSchema,
} from "../../../../lib/validation/teamAssignments";

/**
 * POST /api/events/{eventId}/teams
 *
 * Ustawia ręczne przypisania drużyn dla uczestników wydarzenia.
 * Dostępne tylko dla organizatorów danego wydarzenia oraz administratorów.
 * Zwraca listę utworzonych/zaktualizowanych przypisań drużyn.
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
          error: "invalid_json",
          message: "Nieprawidłowy format JSON w ciele żądania",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedCommand;
    try {
      validatedCommand = createTeamAssignmentsSchema.parse(requestBody);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowe dane przypisań drużyn",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Pobierz kontekst użytkownika z autoryzacji JWT
    // Na razie używamy tymczasowych danych dla testowania
    const actor = {
      userId: 1, // TODO: Pobierz z locals.session.user.id
      role: "admin" as const, // TODO: Pobierz z locals.session.user.role
      ipAddress: request.headers.get("x-forwarded-for") ||
                request.headers.get("x-real-ip") ||
                "127.0.0.1", // Fallback dla adresu IP
    };

    // 3. Wywołaj logikę biznesową
    const teamAssignmentsService = createTeamAssignmentsService(locals.supabase);
    const assignments = await teamAssignmentsService.setManualAssignments(
      validatedParams.eventId,
      validatedCommand,
      actor
    );

    // 4. Zwróć pomyślną odpowiedź z listą przypisań
    return new Response(JSON.stringify(assignments), {
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
            message: "Brak uprawnień do zarządzania przypisaniami drużyn",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Błędy związane z walidacją biznesową (np. signup nie należy do wydarzenia)
      if (error.message.includes("nie należą do wskazanego wydarzenia") ||
          error.message.includes("signup_id muszą być unikalne")) {
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

      // Błędy związane z nieznalezieniem wydarzenia
      if (error.message.includes("organizer")) {
        return new Response(
          JSON.stringify({
            error: "not_found",
            message: "Wydarzenie nie istnieje lub brak dostępu do niego",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Błędy bazy danych
      if (error.message.includes("Błąd podczas")) {
        console.error("Database error in team assignments:", error);
        return new Response(
          JSON.stringify({
            error: "database_error",
            message: "Wystąpił błąd podczas przetwarzania żądania",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Nieoczekiwany błąd
    console.error("Unexpected error in team assignments POST:", error);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd serwera",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/events/{eventId}/teams
 *
 * Zwraca listę przypisań drużyn dla wskazanego wydarzenia.
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

    // TODO: Pobierz kontekst użytkownika z autoryzacji JWT
    // Na razie używamy tymczasowych danych dla testowania
    const actor = {
      userId: 1, // TODO: Pobierz z locals.session.user.id
      role: "admin" as const, // TODO: Pobierz z locals.session.user.role
    };

    // TODO: Zaimplementuj metodę listTeamAssignments w serwisie
    // const teamAssignmentsService = createTeamAssignmentsService(locals.supabase);
    // const assignments = await teamAssignmentsService.listTeamAssignments(validatedParams.eventId, actor);

    // Tymczasowa odpowiedź dla GET - do zaimplementowania w następnych krokach
    const assignments = {
      data: [], // TODO: Zaimplementuj pobieranie przypisań
    };

    // 4. Zwróć pomyślną odpowiedź z listą przypisań
    return new Response(JSON.stringify(assignments), {
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
            message: "Brak uprawnień do przeglądania przypisań drużyn",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Nieoczekiwany błąd
    console.error("Unexpected error in team assignments GET:", error);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd serwera",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;
