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

  optional_fee: z
    .number()
    .min(0, "Opcjonalna opłata nie może być ujemna")
    .nullable()
    .optional(),
});

/**
 * Typ wywnioskowany z createEventBodySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a tworzeniem wydarzenia.
 */
export type CreateEventValidatedParams = z.infer<typeof createEventBodySchema>;
