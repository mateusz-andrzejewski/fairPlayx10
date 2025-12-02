import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";
import { toRequestActor } from "../lib/auth/request-actor";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/session",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
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
  context.locals.supabase = supabaseClient;

  const accessToken = context.cookies.get("sb-access-token")?.value;

  if (accessToken) {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseClient.auth.getUser(accessToken);

      if (!authError && authUser?.email) {
        const { data: userProfile, error: profileError } = await supabaseClient
          .from("users")
          .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
          .eq("email", authUser.email.toLowerCase())
          .is("deleted_at", null)
          .single();

        if (!profileError && userProfile) {
          context.locals.user = userProfile;
          context.locals.actor = toRequestActor(userProfile);
        }
      }
    } catch (error) {
      console.error("[middleware] Failed to resolve user from access token", error);
    }
  }

  const pathname = context.url.pathname;
  const publicPath = isPublicPath(pathname);

  const user = context.locals.user;

  // Handle root path - redirect based on auth status
  if (pathname === "/") {
    if (user) {
      if (user.status === "pending") {
        return context.redirect("/pending-approval");
      }
      return context.redirect("/dashboard");
    }
    return context.redirect("/login");
  }

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
