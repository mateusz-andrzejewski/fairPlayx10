import { z } from "zod";

/**
 * Schemat Zod do walidacji pojedynczego elementu przypisania drużyny.
 * Waliduje signup_id, team_number i team_color.
 */
export const manualTeamAssignmentEntrySchema = z.object({
  signup_id: z
    .number()
    .int("ID zapisu musi być liczbą całkowitą")
    .positive("ID zapisu musi być dodatnią liczbą całkowitą"),
  team_number: z
    .number()
    .int("Numer drużyny musi być liczbą całkowitą")
    .positive("Numer drużyny musi być dodatnią liczbą całkowitą"),
  team_color: z.enum(["black", "white", "red", "blue"], {
    message: "Kolor drużyny musi być jednym z: black, white, red, blue",
  }),
});

/**
 * Schemat Zod do walidacji danych wejściowych dla tworzenia przypisań drużyn.
 * Waliduje tablicę przypisań z dodatkowymi regułami biznesowymi:
 * - Minimalna długość tablicy (przynajmniej 1 przypisanie)
 * - Maksymalna długość tablicy (limit wydajnościowy)
 * - Unikalność signup_id w ramach jednego żądania
 */
export const createTeamAssignmentsSchema = z
  .object({
    assignments: z
      .array(manualTeamAssignmentEntrySchema, {
        message: "Przypisania muszą być tablicą obiektów z signup_id i team_number",
      })
      .min(1, "Przynajmniej jedno przypisanie jest wymagane")
      .max(100, "Maksymalnie 100 przypisań na jedno żądanie"),
  })
  .refine(
    (data) => {
      // Sprawdź unikalność signup_id w ramach tablicy
      const signupIds = data.assignments.map((assignment) => assignment.signup_id);
      const uniqueSignupIds = new Set(signupIds);
      return uniqueSignupIds.size === signupIds.length;
    },
    {
      message: "signup_id muszą być unikalne w ramach jednego żądania",
      path: ["assignments"], // Wskaż ścieżkę błędu
    }
  );

/**
 * Typ wywnioskowany z createTeamAssignmentsSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a tworzeniem przypisań drużyn.
 */
export type CreateTeamAssignmentsValidatedParams = z.infer<typeof createTeamAssignmentsSchema>;

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
 * Schemat Zod do walidacji komendy uruchomienia losowania drużyn.
 * Waliduje parametry algorytmu: iterations, balance_threshold i team_count z domyślnymi wartościami i zakresami.
 */
export const teamDrawCommandSchema = z.object({
  iterations: z
    .number()
    .int("Liczba iteracji musi być liczbą całkowitą")
    .min(1, "Minimalna liczba iteracji to 1")
    .max(200, "Maksymalna liczba iteracji to 200")
    .default(20)
    .optional(),
  balance_threshold: z
    .number()
    .min(0, "Próg balansu musi być większy lub równy 0")
    .max(1, "Próg balansu musi być mniejszy lub równy 1")
    .default(0.07)
    .optional(),
  team_count: z
    .number()
    .int("Liczba drużyn musi być liczbą całkowitą")
    .min(2, "Minimalna liczba drużyn to 2")
    .max(10, "Maksymalna liczba drużyn to 10")
    .optional(),
});

/**
 * Typ wywnioskowany z teamDrawCommandSchema.
 * Zapewnia bezpieczeństwo typów między walidacją a uruchomieniem algorytmu losowania.
 */
export type TeamDrawValidatedParams = z.infer<typeof teamDrawCommandSchema>;
