import type { APIRoute } from "astro";

import { forgotPasswordSchema } from "../../../lib/validation/auth";
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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return formatZodError(parsed.error);
  }

  try {
    // Sprawdź czy użytkownik istnieje w bazie danych
    const { data: user, error: userError } = await locals.supabase
      .from("users")
      .select("id, email, status")
      .eq("email", parsed.data.email)
      .is("deleted_at", null)
      .single();

    if (userError || !user) {
      // Dla bezpieczeństwa zawsze zwracamy sukces, nawet jeśli email nie istnieje
      // Zapobiega to enumeracji użytkowników
      return new Response(
        JSON.stringify({
          success: true,
          message: "Jeśli podany adres email jest powiązany z kontem, otrzymasz wiadomość z instrukcjami resetu hasła.",
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        }
      );
    }

    // Sprawdź czy użytkownik jest zatwierdzony
    if (user.status !== "approved") {
      // Dla bezpieczeństwa zawsze zwracamy sukces
      return new Response(
        JSON.stringify({
          success: true,
          message: "Jeśli podany adres email jest powiązany z kontem, otrzymasz wiadomość z instrukcjami resetu hasła.",
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        }
      );
    }

    // Wyślij email z resetowaniem hasła
    // Dla chmurowej wersji Supabase użyj URL z requestu
    const baseUrl = import.meta.env.PUBLIC_BASE_URL || new URL(request.url).origin || "http://localhost:3000";

    const { error: resetError } = await locals.supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (resetError) {
      console.error("Password reset error:", resetError);
      // Dla bezpieczeństwa zawsze zwracamy sukces
      return new Response(
        JSON.stringify({
          success: true,
          message: "Jeśli podany adres email jest powiązany z kontem, otrzymasz wiadomość z instrukcjami resetu hasła.",
        }),
        {
          status: 200,
          headers: JSON_HEADERS,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Jeśli podany adres email jest powiązany z kontem, otrzymasz wiadomość z instrukcjami resetu hasła.",
      }),
      {
        status: 200,
        headers: JSON_HEADERS,
      }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    // Dla bezpieczeństwa zawsze zwracamy sukces w przypadku błędów
    return new Response(
      JSON.stringify({
        success: true,
        message: "Jeśli podany adres email jest powiązany z kontem, otrzymasz wiadomość z instrukcjami resetu hasła.",
      }),
      {
        status: 200,
        headers: JSON_HEADERS,
      }
    );
  }
};

export const prerender = false;
