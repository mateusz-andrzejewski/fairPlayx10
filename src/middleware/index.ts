import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";
import { ensureDevDashboardData } from "../lib/dev/ensureDevDashboardData";
import { isDashboardAuthDisabled } from "../lib/utils/featureFlags";
import { mockDashboardUser } from "../lib/mocks/dashboardMock";
import { toRequestActor } from "../lib/auth/request-actor";

function requiresUserContext(pathname: string): boolean {
  if (pathname.startsWith("/dashboard")) {
    return true;
  }
  if (pathname.startsWith("/api")) {
    return true;
  }
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const authDisabled = isDashboardAuthDisabled();
  context.locals.supabase = supabaseClient;
  context.locals.isDashboardAuthDisabled = authDisabled;

  if (!requiresUserContext(context.url.pathname)) {
    return next();
  }

  if (authDisabled) {
    try {
      const devUser = await ensureDevDashboardData(supabaseClient);
      context.locals.user = devUser;
      context.locals.actor = toRequestActor(devUser, { isDevSession: true });
    } catch (error) {
      console.warn("[middleware] Failed to ensure dev dashboard data, falling back to mock user", error);
      context.locals.user = mockDashboardUser;
      context.locals.actor = toRequestActor(mockDashboardUser, { isDevSession: true });
    }
    return next();
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
      return context.redirect("/login");
    }

    const { data: userProfile, error: profileError } = await supabaseClient
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
      .eq("id", session.user.id)
      .is("deleted_at", null)
      .single();

    if (profileError || !userProfile) {
      return context.redirect("/login");
    }

    if (userProfile.status !== "approved") {
      return context.redirect("/login");
    }

    context.locals.user = userProfile;
    context.locals.actor = toRequestActor(userProfile);
  } catch (error) {
    console.error("[middleware] Auth guard error", error);
    return context.redirect("/login");
  }

  return next();
});
