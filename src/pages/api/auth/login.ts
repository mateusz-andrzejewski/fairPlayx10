import type { APIRoute } from "astro";

import { loginSchema } from "../../../lib/validation/auth";
import { AuthServiceError, createAuthService } from "../../../lib/services/auth/auth.service";
import { formatZodError, internalAuthError } from "../../../lib/utils/auth-errors";

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" } as const;

const COOKIE_PATH = "/";
const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 dni

function isSecureRequest(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "https:";
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals, cookies }) => {
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return formatZodError(parsed.error);
  }

  const authService = createAuthService(locals.supabase);

  try {
    const result = await authService.login(parsed.data);

    const secure = !import.meta.env.DEV && isSecureRequest(request.url);

    cookies.set(ACCESS_TOKEN_COOKIE, result.session.access_token, {
      path: COOKIE_PATH,
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: result.session.expires_in,
    });

    cookies.set(REFRESH_TOKEN_COOKIE, result.session.refresh_token, {
      path: COOKIE_PATH,
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
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
