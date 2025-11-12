import type { APIRoute } from "astro";

import { registerSchema } from "../../../lib/validation/auth";
import { AuthServiceError, createAuthService } from "../../../lib/services/auth/auth.service";
import { formatZodError, internalAuthError } from "../../../lib/utils/auth-errors";

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" } as const;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.supabase) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_ERROR",
        message: "Brak skonfigurowanego klienta Supabase po stronie serwera",
      }),
      {
        status: 500,
        headers: JSON_HEADERS,
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Nieprawidłowy format JSON w ciele żądania",
      }),
      {
        status: 400,
        headers: JSON_HEADERS,
      }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return formatZodError(parsed.error);
  }

  const authService = createAuthService(locals.supabase);

  try {
    const result = await authService.register(parsed.data);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: JSON_HEADERS,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.code,
          message: error.message,
        }),
        {
          status: error.status,
          headers: JSON_HEADERS,
        }
      );
    }
    return internalAuthError(error);
  }
};

export const prerender = false;
