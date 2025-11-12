import type { APIRoute } from "astro";

import { createTeamAssignmentsService } from "../../../../../lib/services/team-assignments.service";
import { eventIdParamSchema, teamDrawCommandSchema } from "../../../../../lib/validation/teamAssignments";
import { requireActor } from "../../../../../lib/auth/request-actor";

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    let validatedParams;
    try {
      validatedParams = eventIdParamSchema.parse(params);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowy identyfikator wydarzenia",
          details:
            validationError instanceof Error ? validationError.message : "Walidacja parametru eventId nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let requestBody: unknown;
    try {
      const rawBody = await request.text();
      requestBody = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return new Response(
        JSON.stringify({
          error: "invalid_json",
          message: "Nieprawidłowy format danych. Oczekiwano poprawnego JSON.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let validatedCommand;
    try {
      validatedCommand = teamDrawCommandSchema.parse(requestBody ?? {});
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Nieprawidłowe parametry losowania drużyn",
          details:
            validationError instanceof Error
              ? validationError.message
              : "Walidacja danych wejściowych nie powiodła się",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const actor = requireActor(locals);

    const command = {
      iterations: validatedCommand.iterations ?? 20,
      balance_threshold: validatedCommand.balance_threshold ?? 0.07,
    };

    const teamAssignmentsService = createTeamAssignmentsService(locals.supabase);
    const drawResult = await teamAssignmentsService.runDraw(validatedParams.eventId, command, {
      userId: actor.userId,
      role: actor.role,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
    });

    return new Response(JSON.stringify(drawResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Brak uprawnień")) {
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

      if (error.message.includes("Minimalna liczba graczy") || error.message.includes("losowania drużyn")) {
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

      if (error.message.includes("Wydarzenie") && error.message.includes("nie istnieje")) {
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

    console.error("Nieoczekiwany błąd w POST /api/events/[eventId]/teams/draw:", error);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Wystąpił nieoczekiwany błąd podczas uruchamiania losowania drużyn",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;
