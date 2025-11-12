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
export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["pending", "approved"]).optional(),
    role: z.enum(["admin", "organizer", "player"]).optional(),
    search: z.string().max(255).trim().optional(),
  })
  .strict();

/**
 * Typ wywnioskowany z listUsersQuerySchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type ListUsersValidatedParams = z.infer<typeof listUsersQuerySchema>;

/**
 * Schemat Zod do walidacji danych aktualizacji statusu użytkownika przez admina.
 * Pozwala na zmianę statusu użytkownika z 'pending' na 'approved'.
 * @deprecated Użyj approveUserSchema zamiast tego
 */
export const updateUserStatusSchema = z.object({
  status: z.enum(["pending", "approved"], {
    errorMap: () => ({ message: "Status może być tylko 'pending' lub 'approved'" }),
  }),
});

/**
 * Typ wywnioskowany z updateUserStatusSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 * @deprecated Użyj ApproveUserValidatedParams zamiast tego
 */
export type UpdateUserStatusValidatedParams = z.infer<typeof updateUserStatusSchema>;

/**
 * Schemat Zod do walidacji danych zatwierdzania użytkownika przez admina.
 * Admin musi podać rolę i opcjonalnie powiązać użytkownika z profilem gracza.
 * Zgodnie z PRD US-003: Zatwierdzanie rejestracji przez Admina
 */
export const approveUserSchema = z
  .object({
    role: z.enum(["player", "organizer", "admin"], {
      errorMap: () => ({ message: "Rola musi być 'player', 'organizer' lub 'admin'" }),
    }),
    player_id: z.number().int().positive().nullable().optional(),
    create_player: z.boolean().optional().default(false),
  })
  .strict()
  .refine(
    (data) => {
      // Nie można jednocześnie podać player_id i create_player=true
      return !(data.player_id && data.create_player);
    },
    {
      message: "Nie można jednocześnie podać player_id i create_player. Wybierz jedno.",
    }
  );

/**
 * Typ wywnioskowany z approveUserSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type ApproveUserValidatedParams = z.infer<typeof approveUserSchema>;

/**
 * Schemat Zod do walidacji danych aktualizacji roli użytkownika.
 * Admin może zmienić rolę zatwierdzonego użytkownika.
 */
export const updateUserRoleSchema = z
  .object({
    role: z.enum(["player", "organizer", "admin"], {
      errorMap: () => ({ message: "Rola musi być 'player', 'organizer' lub 'admin'" }),
    }),
    status: z.literal("approved").optional(), // Akceptujemy status, ale go ignorujemy
  })
  .strict();

/**
 * Typ wywnioskowany z updateUserRoleSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a użyciem.
 */
export type UpdateUserRoleValidatedParams = z.infer<typeof updateUserRoleSchema>;

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
 * Waliduje i sanityzuje parametry zapytania dla endpointa listy użytkowników.
 * Łączy walidację schematu z sanitizacją zapytania wyszukiwania.
 *
 * @param params - Surowe parametry z żądania
 * @returns Zwalidowane i zasanityzowane parametry
 * @throws ZodError jeśli walidacja nie powiedzie się
 */
export function validateListUsersParams(params: Record<string, unknown>): ListUsersValidatedParams {
  // Loguj nieznane klucze
  const knownKeys = ["page", "limit", "status", "role", "search"];
  const unknownKeys = Object.keys(params).filter((key) => !knownKeys.includes(key));
  if (unknownKeys.length > 0) {
    console.log("[validateListUsersParams] Unknown parameters detected:", unknownKeys, "Full params:", params);
  }

  // Najpierw zwaliduj schematem Zod
  const validated = listUsersQuerySchema.parse(params);

  // Zasanityzuj zapytanie wyszukiwania jeśli obecne
  if (validated.search) {
    validated.search = escapeIlikePattern(validated.search);
  }

  return validated;
}
