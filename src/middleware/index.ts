import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";

const disableAuthFlag = import.meta.env.DISABLE_DASHBOARD_AUTH;
const shouldBypassDashboardAuth =
  import.meta.env.DEV &&
  typeof disableAuthFlag === "string" &&
  ["true", "1", "yes", "on"].includes(disableAuthFlag.trim().toLowerCase());

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  // Ochrona tras dashboard - wymagają autoryzacji
  if (context.url.pathname.startsWith("/dashboard")) {
    if (import.meta.env.DEV) {
      console.info(
        "[middleware] Dashboard guard",
        JSON.stringify({
          disableAuthFlag,
          shouldBypassDashboardAuth,
          pathname: context.url.pathname,
        })
      );
    }

    if (shouldBypassDashboardAuth) {
      return next();
    }

    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error || !session) {
        // Przekieruj na login jeśli nie ma sesji
        return context.redirect('/login');
      }

      // Sprawdź status użytkownika w bazie danych
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('users')
        .select('status')
        .eq('id', session.user.id)
        .is('deleted_at', null)
        .single();

      if (profileError || !userProfile || userProfile.status !== 'active') {
        // Przekieruj na login jeśli użytkownik nie jest aktywny
        return context.redirect('/login');
      }
    } catch (err) {
      console.error('Auth middleware error:', err);
      return context.redirect('/login');
    }
  }

  return next();
});
