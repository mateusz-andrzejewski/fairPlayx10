import type { APIRoute } from "astro";

import { createUsersService } from "../../../lib/services/users.service";
import { userIdParamSchema, approveUserSchema, updateUserRoleSchema } from "../../../lib/validation/users";
import { requireAdmin } from "../../../lib/auth/request-actor";

/**
 * PATCH /api/users/{id}
 *
 * Dwa tryby działania:
 * 1. Zatwierdzanie użytkownika - zmiana statusu z 'pending' na 'approved'.
 *    Admin musi podać: role (wymagane) oraz opcjonalnie player_id lub create_player.
 * 2. Aktualizacja roli zatwierdzonego użytkownika - zmiana roli istniejącego użytkownika.
 *    Admin musi podać: role (wymagane).
 * 
 * Operacja wymaga roli admin.
 * Zgodnie z PRD US-003: Zatwierdzanie rejestracji przez Admina
 */

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // Sprawdź uprawnienia - tylko administratorzy mogą aktualizować użytkowników
    const adminActor = requireAdmin(locals);

    // Parsuj i zwaliduj parametr ścieżki
    const rawId = params.id;
    if (!rawId) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Brak wymaganego parametru id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedIdParams;
    try {
      validatedIdParams = userIdParamSchema.parse({ id: rawId });
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format parametru id",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsuj ciało żądania
    let body: unknown;
    try {
      body = await request.json();
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

    // Sprawdź typ operacji na podstawie zawartości body
    const bodyObj = body as Record<string, unknown>;
    const usersService = createUsersService(locals.supabase);
    
    // Przypadek 1: Aktualizacja roli zatwierdzonego użytkownika (tylko role + opcjonalnie status)
    // Sprawdzamy czy body zawiera tylko role (i ewentualnie status="approved")
    const hasOnlyRole = bodyObj.role && !bodyObj.player_id && !bodyObj.create_player;
    if (hasOnlyRole) {
      // Waliduj dane aktualizacji roli
      let validatedRoleParams;
      try {
        validatedRoleParams = updateUserRoleSchema.parse(body);
      } catch (validationError) {
        return new Response(
          JSON.stringify({
            error: "validation_error",
            message: "Nieprawidłowe dane aktualizacji roli",
            details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Wykonaj aktualizację roli
      try {
        const result = await usersService.updateUserRole(
          adminActor.userId,
          validatedIdParams.id,
          validatedRoleParams.role
        );

        return new Response(
          JSON.stringify({
            success: true,
            message: "Rola użytkownika została zaktualizowana",
            userId: result.userId,
            previousRole: result.previousRole,
            newRole: result.newRole,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        // Obsłuż błąd "Użytkownik nie został znaleziony"
        if (error instanceof Error && error.message.includes("nie został znaleziony")) {
          return new Response(
            JSON.stringify({
              error: "not_found",
              message: "Użytkownik nie został znaleziony",
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        throw error; // Rzuć dalej inne błędy
      }
    }

    // Przypadek 2: Nowe API - zatwierdzenie użytkownika z pełnymi danymi (role + player_id/create_player)
    let validatedApprovalParams;
    try {
      validatedApprovalParams = approveUserSchema.parse(body);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowe dane zatwierdzenia",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wykonaj zatwierdzenie użytkownika z nowymi danymi
    const result = await usersService.approveUser(adminActor.userId, validatedIdParams.id, validatedApprovalParams);

    // Zwróć odpowiedź w zależności od wyniku
    if (result.approved) {
      // Pomyślne zatwierdzenie
      return new Response(
        JSON.stringify({
          success: true,
          message: "Użytkownik został zatwierdzony",
          userId: result.userId,
          previousStatus: result.previousStatus,
          newStatus: result.newStatus,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Użytkownik nie istnieje
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Użytkownik nie został znaleziony",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Nieoczekiwany błąd w PATCH /api/users/[id]:", error);

    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/users/{id}
 *
 * Wykonuje soft delete użytkownika poprzez ustawienie znacznika deleted_at.
 * Operacja wymaga roli admin i nie pozwala na usunięcie własnego konta.
 * Jest idempotentna - ponowne wywołanie na już usuniętym użytkowniku zwraca sukces.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Sprawdź uprawnienia - tylko administratorzy mogą usuwać użytkowników
    const adminActor = requireAdmin(locals);

    // Parsuj i zwaliduj parametr ścieżki
    const rawId = params.id;
    if (!rawId) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Brak wymaganego parametru id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedParams;
    try {
      validatedParams = userIdParamSchema.parse({ id: rawId });
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy format parametru id",
          details: validationError instanceof Error ? validationError.message : "Walidacja nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź czy użytkownik próbuje usunąć samego siebie
    if (adminActor.userId === validatedParams.id) {
      return new Response(
        JSON.stringify({
          error: "conflict",
          message: "Nie można usunąć własnego konta",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wykonaj soft delete
    const usersService = createUsersService(locals.supabase);
    const result = await usersService.softDeleteUser(adminActor.userId, validatedParams.id);

    // Zwróć odpowiedź w zależności od wyniku
    if (result.deleted) {
      // Pomyślne usunięcie - 204 No Content
      return new Response(null, {
        status: 204,
        headers: {
          "Cache-Control": "private, no-store",
        },
      });
    } else {
      // Użytkownik nie istnieje lub już został usunięty
      return new Response(
        JSON.stringify({
          error: "not_found",
          message: "Użytkownik nie został znaleziony",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Nieoczekiwany błąd w DELETE /api/users/[id]:", error);

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
