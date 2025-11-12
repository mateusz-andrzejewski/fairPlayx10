import { AuthApiError, AuthError } from "@supabase/supabase-js";
import { z } from "zod";

import type { AuthErrorCode, AuthErrorResponse } from "../../types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function response(payload: AuthErrorResponse, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS,
  });
}

export function formatZodError(error: z.ZodError): Response {
  const fieldErrors = error.flatten().fieldErrors;
  return response(
    {
      success: false,
      error: "VALIDATION_ERROR",
      message: "Nieprawidłowe dane wejściowe",
      details: Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([field, messages]) => [field, messages ?? []])
      ),
    },
    400
  );
}

function supabaseErrorToCode(error: AuthError | AuthApiError): AuthErrorCode {
  if (error instanceof AuthApiError) {
    if (error.status === 400 || error.status === 401) {
      return "INVALID_CREDENTIALS";
    }
    if (error.status === 403) {
      return "ACCOUNT_DISABLED";
    }
  }
  if ("status" in error && error.status === 400) {
    return "INVALID_CREDENTIALS";
  }
  return "INTERNAL_ERROR";
}

export function formatSupabaseAuthError(error: AuthError | AuthApiError): Response {
  const code = supabaseErrorToCode(error);
  return response(
    {
      success: false,
      error: code,
      message: code === "INVALID_CREDENTIALS" ? "Nieprawidłowy email lub hasło" : "Wystąpił błąd podczas logowania",
    },
    code === "INVALID_CREDENTIALS" ? 401 : 500
  );
}

export function pendingApprovalError(): Response {
  return response(
    {
      success: false,
      error: "PENDING_APPROVAL",
      message: "Twoje konto oczekuje na zatwierdzenie przez administratora",
    },
    403
  );
}

export function accountDisabledError(): Response {
  return response(
    {
      success: false,
      error: "ACCOUNT_DISABLED",
      message: "Konto zostało dezaktywowane. Skontaktuj się z administratorem.",
    },
    403
  );
}

export function internalAuthError(error: unknown): Response {
  console.error("[Auth Error]", error);
  return response(
    {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Wystąpił błąd serwera. Spróbuj ponownie później.",
    },
    500
  );
}
