import { z } from "zod";

/**
 * Schemat walidacji danych logowania używany zarówno po stronie backendu,
 * jak i frontendowego formularza. Zapewnia spójną normalizację danych
 * (trimming, lowercasing) oraz komunikaty błędów w języku polskim.
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Adres email jest wymagany",
    })
    .min(1, "Adres email jest wymagany")
    .email("Nieprawidłowy format adresu email")
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Hasło jest wymagane",
    })
    .min(1, "Hasło jest wymagane")
    .min(8, "Hasło musi mieć minimum 8 znaków"),
});

export type LoginSchema = typeof loginSchema;
export type LoginSchemaInput = z.input<LoginSchema>;
export type LoginSchemaOutput = z.output<LoginSchema>;
