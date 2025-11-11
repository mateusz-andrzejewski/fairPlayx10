import { z } from "zod";

/**
 * Schemat Zod do walidacji formularza gracza.
 * Używany zarówno dla tworzenia jak i edycji gracza.
 */
export const playerFormSchema = z.object({
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
    .optional()
    .nullable(),

  date_of_birth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true; // Opcjonalne pole
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, "Data urodzenia musi być prawidłową datą i nie może być w przyszłości"),
});

/**
 * Typ wywnioskowany ze schematu formularza gracza.
 */
export type PlayerFormData = z.infer<typeof playerFormSchema>;
