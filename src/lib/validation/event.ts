import { z } from "zod";

/**
 * Schemat Zod do walidacji danych wejściowych dla tworzenia nowego wydarzenia.
 * Waliduje pola name, location, event_datetime, max_places i opcjonalne optional_fee.
 * Używa stripUnknown aby odrzucić nieznane pola.
 */
export const createEventBodySchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa wydarzenia nie może być pusta")
    .max(200, "Nazwa wydarzenia nie może być dłuższa niż 200 znaków")
    .trim(),

  location: z
    .string()
    .min(1, "Lokalizacja nie może być pusta")
    .max(200, "Lokalizacja nie może być dłuższa niż 200 znaków")
    .trim(),

  event_datetime: z
    .string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Data wydarzenia musi być prawidłową datą ISO")
    .refine((date) => {
      const parsedDate = new Date(date);
      return parsedDate > new Date();
    }, "Data wydarzenia musi być w przyszłości"),

  max_places: z
    .number()
    .int("Maksymalna liczba miejsc musi być liczbą całkowitą")
    .min(1, "Maksymalna liczba miejsc musi być większa od 0"),

  optional_fee: z.number().min(0, "Opcjonalna opłata nie może być ujemna").nullable().optional(),
});

/**
 * Typ wywnioskowany z createEventBodySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a tworzeniem wydarzenia.
 */
export type CreateEventValidatedParams = z.infer<typeof createEventBodySchema>;

/**
 * Schemat Zod do walidacji danych wejściowych dla aktualizacji wydarzenia.
 * Wszystkie pola są opcjonalne (partial), ale przynajmniej jedno pole musi być podane.
 * Waliduje pola name, location, event_datetime, max_places, optional_fee i status.
 * Używa stripUnknown aby odrzucić nieznane pola.
 */
export const updateEventBodySchema = createEventBodySchema
  .extend({
    status: z
      .enum(["draft", "active", "completed"], {
        errorMap: () => ({ message: "Status musi być jednym z: draft, active, completed" }),
      })
      .optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Przynajmniej jedno pole musi zostać podane do aktualizacji");

/**
 * Typ wywnioskowany z updateEventBodySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a aktualizacją wydarzenia.
 */
export type UpdateEventValidatedParams = z.infer<typeof updateEventBodySchema>;

/**
 * Schemat Zod do walidacji parametru ścieżki id wydarzenia.
 * Waliduje że id jest dodatnią liczbą całkowitą.
 */
export const eventIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID wydarzenia musi być dodatnią liczbą całkowitą"),
});

/**
 * Waliduje parametr ścieżki id wydarzenia.
 *
 * @param params - Parametry ścieżki zawierające id
 * @returns Zwalidowane parametry zawierające id jako liczbę
 * @throws ZodError jeśli walidacja nie powiedzie się
 */
export function validateEventIdParam(params: Record<string, unknown>): { id: number } {
  return eventIdParamSchema.parse(params);
}
