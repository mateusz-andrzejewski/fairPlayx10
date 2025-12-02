import type { APIRoute } from "astro";

import { resetPasswordSchema } from "../../../lib/validation/auth";
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

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return formatZodError(parsed.error);
  }

  try {
    // Zaktualizuj hasło dla aktualnie zalogowanego użytkownika
    // Supabase automatycznie zarządza sesją po kliknięciu linku resetowania
    const { error } = await locals.supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      console.error("Password update error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "INVALID_TOKEN",
          message: "Link resetowania wygasł lub jest nieprawidłowy. Poproś o nowy link.",
        }),
        {
          status: 400,
          headers: JSON_HEADERS,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Hasło zostało pomyślnie zmienione",
      }),
      {
        status: 200,
        headers: JSON_HEADERS,
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return internalAuthError(error);
  }
};

export const prerender = false;
