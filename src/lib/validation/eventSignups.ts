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
