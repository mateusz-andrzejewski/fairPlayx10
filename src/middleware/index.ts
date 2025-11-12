import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";
import { ensureDevDashboardData } from "../lib/dev/ensureDevDashboardData";
import { isDashboardAuthDisabled } from "../lib/utils/featureFlags";
import { mockDashboardUser } from "../lib/mocks/dashboardMock";
import { toRequestActor } from "../lib/auth/request-actor";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/session",
];

const PENDING_ALLOWED_PATHS = ["/pending-approval", "/api/auth/logout"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }
  if (pathname.startsWith("/assets/") || pathname === "/favicon.png") {
    return true;
  }
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const authDisabled = isDashboardAuthDisabled();
  context.locals.supabase = supabaseClient;
  context.locals.isDashboardAuthDisabled = authDisabled;

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

  const pathname = context.url.pathname;
  const publicPath = isPublicPath(pathname);

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
      context.locals.user = undefined;
    } else {
      const { data: userProfile, error: profileError } = await supabaseClient
        .from("users")
        .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
        .eq("email", session.user.email ?? "")
        .is("deleted_at", null)
        .single();

      if (!profileError && userProfile) {
        context.locals.user = userProfile;
        context.locals.actor = toRequestActor(userProfile);
      }
    }
  } catch (error) {
    console.error("[middleware] Auth guard error", error);
  }

  const user = context.locals.user;

  if (publicPath) {
    if (pathname === "/login" && user) {
      if (user.status === "pending") {
        return context.redirect("/pending-approval");
      }
      return context.redirect("/dashboard");
    }

    if (pathname === "/pending-approval" && user?.status !== "pending") {
      return context.redirect("/dashboard");
    }

    return next();
  }

  if (!user) {
    return context.redirect("/login");
  }

  if (user.status === "pending" && !PENDING_ALLOWED_PATHS.includes(pathname)) {
    return context.redirect("/pending-approval");
  }

  return next();
});
