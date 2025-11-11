import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  // Ochrona tras dashboard - wymagają autoryzacji
  if (context.url.pathname.startsWith('/dashboard')) {
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
