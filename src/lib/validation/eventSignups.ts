import { z } from "zod";

/**
 * Schemat Zod do walidacji danych wejściowych dla tworzenia nowego zapisu na wydarzenie.
 * Dla graczy pole player_id jest opcjonalne i będzie pobierane z kontekstu użytkownika.
 * Dla organizatorów/adminów pole player_id jest wymagane aby określić którego gracza chcą zapisać.
 */
export const createEventSignupSchema = z.object({
  player_id: z
    .number()
    .int("ID gracza musi być liczbą całkowitą")
    .positive("ID gracza musi być dodatnią liczbą całkowitą")
    .optional(),
});

/**
 * Typ wywnioskowany z createEventSignupSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a tworzeniem zapisu na wydarzenie.
 */
export type CreateEventSignupValidatedParams = z.infer<typeof createEventSignupSchema>;

/**
 * Schemat Zod do walidacji parametru ścieżki eventId.
 * Waliduje że eventId jest dodatnią liczbą całkowitą.
 */
export const eventIdParamSchema = z.object({
  eventId: z.coerce.number().int().positive("ID wydarzenia musi być dodatnią liczbą całkowitą"),
});

/**
 * Typ wywnioskowany z eventIdParamSchema.
 */
export type EventIdValidatedParams = z.infer<typeof eventIdParamSchema>;

/**
 * Schemat Zod do walidacji danych wejściowych dla aktualizacji statusu zapisu na wydarzenie.
 * Obsługuje przejścia między statusami: pending -> confirmed|withdrawn, confirmed -> withdrawn.
 */
export const updateEventSignupSchema = z.object({
  status: z.enum(["pending", "confirmed", "withdrawn"], {
    errorMap: () => ({ message: "Status może być tylko: pending, confirmed lub withdrawn" }),
  }),
});

/**
 * Typ wywnioskowany z updateEventSignupSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a aktualizacją statusu zapisu.
 */
export type UpdateEventSignupValidatedParams = z.infer<typeof updateEventSignupSchema>;

/**
 * Schemat Zod do walidacji parametrów ścieżki dla operacji na konkretnym zapisie.
 * Waliduje zarówno eventId jak i signupId jako dodatnie liczby całkowite.
 */
export const eventSignupIdParamsSchema = z.object({
  eventId: z.coerce.number().int().positive("ID wydarzenia musi być dodatnią liczbą całkowitą"),
  signupId: z.coerce.number().int().positive("ID zapisu musi być dodatnią liczbą całkowitą"),
});

/**
 * Typ wywnioskowany z eventSignupIdParamsSchema.
 */
export type EventSignupIdValidatedParams = z.infer<typeof eventSignupIdParamsSchema>;
