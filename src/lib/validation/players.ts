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
 * Typ wywnioskowany z listPlayersQuerySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type ListPlayersValidatedParams = z.infer<typeof listPlayersQuerySchema>;

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
