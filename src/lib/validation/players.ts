import { z } from "zod";

/**
 * Schemat Zod do walidacji parametrów zapytania dla endpointa listy graczy.
 * Waliduje parametry paginacji, filtrowania i kontroli dostępu.
 */
export const listPlayersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  position: z.enum(["forward", "midfielder", "defender", "goalkeeper"]).optional(),
  search: z.string().max(255).trim().optional(),
  include_skill_rate: z.coerce.boolean().default(false),
});

/**
 * Schemat Zod do walidacji danych wejściowych dla tworzenia nowego gracza.
 * Waliduje pola first_name, last_name, position, skill_rate i opcjonalne date_of_birth.
 * Używa stripUnknown aby odrzucić nieznane pola.
 */
export const createPlayerSchema = z.object({
  first_name: z
    .string()
    .min(1, "Imię nie może być puste")
    .max(100, "Imię nie może być dłuższe niż 100 znaków")
    .trim()
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/, "Imię może zawierać tylko litery, spacje, myślniki i apostrofy"),

  last_name: z
    .string()
    .min(1, "Nazwisko nie może być puste")
    .max(100, "Nazwisko nie może być dłuższe niż 100 znaków")
    .trim()
    .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/, "Nazwisko może zawierać tylko litery, spacje, myślniki i apostrofy"),

  position: z.enum(["forward", "midfielder", "defender", "goalkeeper"], {
    errorMap: () => ({ message: "Pozycja musi być jedną z: forward, midfielder, defender, goalkeeper" }),
  }),

  skill_rate: z
    .number()
    .int("Ocena umiejętności musi być liczbą całkowitą")
    .min(1, "Ocena umiejętności musi być między 1 a 10")
    .max(10, "Ocena umiejętności musi być między 1 a 10")
    .optional(),

  date_of_birth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true; // Opcjonalne pole
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, "Data urodzenia musi być prawidłową datą ISO i nie może być w przyszłości"),
});

/**
 * Typ wywnioskowany z listPlayersQuerySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type ListPlayersValidatedParams = z.infer<typeof listPlayersQuerySchema>;

/**
 * Schemat Zod do walidacji parametru ścieżki id gracza.
 * Waliduje że id jest dodatnią liczbą całkowitą.
 */
export const playerIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID gracza musi być dodatnią liczbą całkowitą"),
});

/**
 * Typ wywnioskowany z createPlayerSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a tworzeniem gracza.
 */
export type CreatePlayerValidatedParams = z.infer<typeof createPlayerSchema>;

/**
 * Schemat Zod do walidacji danych wejściowych dla częściowej aktualizacji gracza.
 * Wszystkie pola są opcjonalne (partial), ale przynajmniej jedno pole musi być podane.
 * Waliduje pola first_name, last_name, position, skill_rate i opcjonalne date_of_birth.
 */
export const updatePlayerSchema = createPlayerSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Przynajmniej jedno pole musi zostać podane do aktualizacji");

/**
 * Sanitizuje zapytanie wyszukiwania poprzez escape znaków specjalnych używanych w wzorcach SQL LIKE.
 * Escapuje znaki % i _ aby zapobiec SQL injection i nieoczekiwanemu dopasowaniu wildcard.
 *
 * @param query - Surowe zapytanie wyszukiwania
 * @returns Zasanityzowane zapytanie bezpieczne do użycia w operacjach SQL LIKE/ILIKE
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== "string") {
    return "";
  }

  // Przytnij białe znaki i escapeuj specjalne znaki LIKE
  return query.trim().replace(/[%_]/g, "\\$&");
}

/**
 * Waliduje i sanitizuje parametry zapytania dla endpointa listy graczy.
 * Łączy walidację schematu z sanitizacją zapytania wyszukiwania.
 *
 * @param params - Surowe parametry z żądania
 * @returns Zwalidowane i zasanityzowane parametry
 * @throws ZodError jeśli walidacja nie powiedzie się
 */
export function validateListPlayersParams(params: Record<string, unknown>): ListPlayersValidatedParams {
  // Najpierw zwaliduj schematem Zod
  const validated = listPlayersQuerySchema.parse(params);

  // Zasanityzuj zapytanie wyszukiwania jeśli obecne
  if (validated.search) {
    validated.search = sanitizeSearchQuery(validated.search);
  }

  return validated;
}

/**
 * Waliduje parametr ścieżki id gracza.
 *
 * @param params - Parametry ścieżki zawierające id
 * @returns Zwalidowane parametry zawierające id jako liczbę
 * @throws ZodError jeśli walidacja nie powiedzie się
 */
export function validatePlayerIdParam(params: Record<string, unknown>): { id: number } {
  return playerIdParamSchema.parse(params);
}

/**
 * Typ wywnioskowany z updatePlayerSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a aktualizacją gracza.
 */
export type UpdatePlayerValidatedParams = z.infer<typeof updatePlayerSchema>;
