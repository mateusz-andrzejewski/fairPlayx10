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

/**
 * Schemat walidacji danych rejestracji używany zarówno po stronie backendu,
 * jak i frontendowego formularza. Zapewnia spójną normalizację danych
 * (trimming, lowercasing) oraz komunikaty błędów w języku polskim.
 */
export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email jest wymagany",
    })
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email")
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Hasło jest wymagane",
    })
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, "Hasło musi zawierać wielką literę i cyfrę"),
  first_name: z
    .string({
      required_error: "Imię jest wymagane",
    })
    .min(1, "Imię jest wymagane")
    .max(100, "Imię może mieć maksymalnie 100 znaków")
    .trim(),
  last_name: z
    .string({
      required_error: "Nazwisko jest wymagane",
    })
    .min(1, "Nazwisko jest wymagane")
    .max(100, "Nazwisko może mieć maksymalnie 100 znaków")
    .trim(),
  position: z.enum(["forward", "midfielder", "defender", "goalkeeper"], {
    errorMap: () => ({ message: "Pozycja jest wymagana" }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Zgoda jest wymagana" }),
  }),
});

export type LoginSchema = typeof loginSchema;
export type LoginSchemaInput = z.input<LoginSchema>;
export type LoginSchemaOutput = z.output<LoginSchema>;

/**
 * Schemat walidacji danych resetowania hasła używany zarówno po stronie backendu,
 * jak i frontendowego formularza. Zapewnia spójną normalizację danych
 * (trimming, lowercasing) oraz komunikaty błędów w języku polskim.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Adres email jest wymagany",
    })
    .min(1, "Adres email jest wymagany")
    .email("Nieprawidłowy format adresu email")
    .trim()
    .toLowerCase(),
});

/**
 * Schemat walidacji danych zmiany hasła używany zarówno po stronie backendu,
 * jak i frontendowego formularza. Zapewnia spójną walidację siły hasła
 * oraz komunikaty błędów w języku polskim.
 */
export const resetPasswordSchema = z.object({
  password: z
    .string({
      required_error: "Hasło jest wymagane",
    })
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, "Hasło musi zawierać wielką literę i cyfrę"),
  confirmPassword: z
    .string({
      required_error: "Potwierdzenie hasła jest wymagane",
    })
    .min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type RegisterSchema = typeof registerSchema;
export type RegisterSchemaInput = z.input<RegisterSchema>;
export type RegisterSchemaOutput = z.output<RegisterSchema>;

export type ForgotPasswordSchema = typeof forgotPasswordSchema;
export type ForgotPasswordSchemaInput = z.input<ForgotPasswordSchema>;
export type ForgotPasswordSchemaOutput = z.output<ForgotPasswordSchema>;

export type ResetPasswordSchema = typeof resetPasswordSchema;
export type ResetPasswordSchemaInput = z.input<ResetPasswordSchema>;
export type ResetPasswordSchemaOutput = z.output<ResetPasswordSchema>;
