import type { APIRoute } from "astro";

const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
  cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });

  return new Response(null, {
    status: 204,
  });
};

export const prerender = false;
