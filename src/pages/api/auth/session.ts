import type { APIRoute } from "astro";

import { ensureDevDashboardData } from "../../../lib/dev/ensureDevDashboardData";
import { isDashboardAuthDisabled } from "../../../lib/utils/featureFlags";
import { toRequestActor } from "../../../lib/auth/request-actor";

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.user) {
      const authDisabled = locals.isDashboardAuthDisabled ?? isDashboardAuthDisabled();
      if (authDisabled) {
        const devUser = await ensureDevDashboardData(locals.supabase);
        locals.user = devUser;
        locals.actor = toRequestActor(devUser, { isDevSession: true });
      }
    }

    if (!locals.user) {
      return new Response(
        JSON.stringify({
          user: null,
          error: "unauthorized",
          message: "Brak przypisanego użytkownika do żądania",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        user: locals.user,
        actor: locals.actor ?? null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to resolve auth session:", error);
    return new Response(
      JSON.stringify({
        user: null,
        error: "internal_server_error",
        message: "Nie udało się ustalić sesji użytkownika",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const prerender = false;

