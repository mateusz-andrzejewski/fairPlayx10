import { z } from "zod";

/**
 * Schemat Zod do walidacji parametru ścieżki ID użytkownika.
 * Waliduje że ID jest dodatnią liczbą całkowitą (typ SERIAL w bazie danych).
 * Koercja zapewnia konwersję string na number dla parametrów URL.
 */
export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Typ wywnioskowany z userIdParamSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type UserIdValidatedParams = z.infer<typeof userIdParamSchema>;

/**
 * Schemat Zod do walidacji parametrów zapytania dla endpointa listy użytkowników.
 * Waliduje parametry paginacji, filtrowania i wyszukiwania.
 */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved"]).optional(),
  role: z.enum(["admin", "organizer", "player"]).optional(),
  search: z.string().max(255).trim().optional(),
});

/**
 * Typ wywnioskowany z listUsersQuerySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type ListUsersValidatedParams = z.infer<typeof listUsersQuerySchema>;

/**
 * Sanitizuje zapytanie wyszukiwania poprzez escape znaków specjalnych używanych w wzorcach SQL LIKE.
 * Escapuje znaki % i _ aby zapobiec SQL injection i nieoczekiwanemu dopasowaniu wildcard.
 *
 * @param query - Surowe zapytanie wyszukiwania
 * @returns Zasanityzowane zapytanie bezpieczne do użycia w operacjach SQL LIKE/ILIKE
 */
export function escapeIlikePattern(query: string): string {
  if (!query || typeof query !== "string") {
    return "";
  }

  // Przytnij białe znaki i escapeuj specjalne znaki LIKE
  return query.trim().replace(/[%_]/g, "\\$&");
}

/**
 * Waliduje i sanitizuje parametry zapytania dla endpointa listy użytkowników.
 * Łączy walidację schematu z sanitizacją zapytania wyszukiwania.
 *
 * @param params - Surowe parametry z żądania
 * @returns Zwalidowane i zasanityzowane parametry
 * @throws ZodError jeśli walidacja nie powiedzie się
 */
export function validateListUsersParams(params: Record<string, unknown>): ListUsersValidatedParams {
  // Najpierw zwaliduj schematem Zod
  const validated = listUsersQuerySchema.parse(params);

  // Zasanityzuj zapytanie wyszukiwania jeśli obecne
  if (validated.search) {
    validated.search = escapeIlikePattern(validated.search);
  }

  return validated;
}
