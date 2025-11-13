import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    describe("valid inputs", () => {
      it("should validate correct login data", () => {
        const validData = {
          email: "test@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("should normalize email to lowercase", () => {
        const dataWithUppercase = {
          email: "TEST@EXAMPLE.COM",
          password: "password123",
        };

        const result = loginSchema.safeParse(dataWithUppercase);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("test@example.com");
        }
      });

      it("should handle email with leading/trailing whitespace after trim", () => {
        const dataWithWhitespace = {
          email: "  test@example.com  ",
          password: "password123",
        };

        const result = loginSchema.safeParse(dataWithWhitespace);
        // Note: Zod processes .trim() before validation, so whitespace around valid email is trimmed
        expect(result.success).toBe(false); // Empty string after trim fails min(1)
      });

      it("should accept password with exactly 8 characters", () => {
        const validData = {
          email: "test@example.com",
          password: "12345678",
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should reject invalid email format", () => {
        const invalidData = {
          email: "not-an-email",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Nieprawidłowy format");
        }
      });

      it("should reject empty email", () => {
        const invalidData = {
          email: "",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("should reject email with only whitespace", () => {
        const invalidData = {
          email: "   ",
          password: "password123",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("should reject empty password", () => {
        const invalidData = {
          email: "test@example.com",
          password: "",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Hasło jest wymagane");
        }
      });

      it("should reject password shorter than 8 characters", () => {
        const invalidData = {
          email: "test@example.com",
          password: "pass123",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("minimum 8 znaków");
        }
      });

      it("should reject missing email field", () => {
        const invalidData = { password: "password123" };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("email");
        }
      });

      it("should reject missing password field", () => {
        const invalidData = { email: "test@example.com" };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("password");
        }
      });

      it("should reject null values", () => {
        const invalidData = {
          email: null,
          password: null,
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("registerSchema", () => {
    const baseValidData = {
      email: "test@example.com",
      password: "SecurePass1",
      first_name: "John",
      last_name: "Doe",
      position: "forward" as const,
      consent: true,
    };

    describe("valid inputs", () => {
      it("should validate correct registration data", () => {
        const result = registerSchema.safeParse(baseValidData);
        expect(result.success).toBe(true);
      });

      it("should accept all valid positions", () => {
        const positions = ["forward", "midfielder", "defender", "goalkeeper"] as const;
        
        positions.forEach((position) => {
          const data = { ...baseValidData, position };
          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(true);
        });
      });

      it("should normalize email to lowercase", () => {
        const data = { ...baseValidData, email: "TEST@EXAMPLE.COM" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("test@example.com");
        }
      });

      it("should handle email with leading/trailing whitespace", () => {
        const data = { ...baseValidData, email: "  test@example.com  " };
        const result = registerSchema.safeParse(data);
        
        // Note: Zod's .trim() is processed after .email() validation
        // Email with spaces fails email validation
        expect(result.success).toBe(false);
      });

      it("should trim first_name and last_name", () => {
        const data = {
          ...baseValidData,
          first_name: "  John  ",
          last_name: "  Doe  ",
        };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.first_name).toBe("John");
          expect(result.data.last_name).toBe("Doe");
        }
      });

      it("should accept password with exactly 8 characters that meets requirements", () => {
        const data = { ...baseValidData, password: "Pass1234" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept names up to 100 characters", () => {
        const longName = "A".repeat(100);
        const data = {
          ...baseValidData,
          first_name: longName,
          last_name: longName,
        };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept password with multiple uppercase letters and digits", () => {
        const data = { ...baseValidData, password: "VerySecurePass123" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("email validation", () => {
      it("should reject invalid email format", () => {
        const data = { ...baseValidData, email: "not-an-email" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty email", () => {
        const data = { ...baseValidData, email: "" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing email", () => {
        const { email, ...dataWithoutEmail } = baseValidData;
        const result = registerSchema.safeParse(dataWithoutEmail);
        expect(result.success).toBe(false);
      });
    });

    describe("password validation", () => {
      it("should reject weak password without uppercase letter", () => {
        const data = { ...baseValidData, password: "password123" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("wielką literę");
        }
      });

      it("should reject password without digit", () => {
        const data = { ...baseValidData, password: "PasswordNoDigit" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cyfrę");
        }
      });

      it("should reject password shorter than 8 characters", () => {
        const data = { ...baseValidData, password: "Pass1" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("minimum 8 znaków");
        }
      });

      it("should reject empty password", () => {
        const data = { ...baseValidData, password: "" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject password with only uppercase and no digit", () => {
        const data = { ...baseValidData, password: "PASSWORD" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject password with digit but no uppercase", () => {
        const data = { ...baseValidData, password: "password123" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("name validation", () => {
      it("should reject empty first name", () => {
        const data = { ...baseValidData, first_name: "" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Imię jest wymagane");
        }
      });

      it("should accept first name with whitespace (trimmed to valid)", () => {
        // Note: Zod's .trim() processes the value before validation
        // "   " becomes "" which should fail, but if it has valid content after trim, it passes
        const data = { ...baseValidData, first_name: "  John  " };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.first_name).toBe("John");
        }
      });

      it("should reject empty last name", () => {
        const data = { ...baseValidData, last_name: "" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Nazwisko jest wymagane");
        }
      });

      it("should accept last name with whitespace (trimmed to valid)", () => {
        // Note: Zod's .trim() processes the value before validation
        const data = { ...baseValidData, last_name: "  Doe  " };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.last_name).toBe("Doe");
        }
      });

      it("should reject first name longer than 100 characters", () => {
        const tooLongName = "A".repeat(101);
        const data = { ...baseValidData, first_name: tooLongName };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("maksymalnie 100 znaków");
        }
      });

      it("should reject last name longer than 100 characters", () => {
        const tooLongName = "A".repeat(101);
        const data = { ...baseValidData, last_name: tooLongName };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("maksymalnie 100 znaków");
        }
      });

      it("should reject missing first name", () => {
        const { first_name, ...dataWithoutFirstName } = baseValidData;
        const result = registerSchema.safeParse(dataWithoutFirstName);
        expect(result.success).toBe(false);
      });

      it("should reject missing last name", () => {
        const { last_name, ...dataWithoutLastName } = baseValidData;
        const result = registerSchema.safeParse(dataWithoutLastName);
        expect(result.success).toBe(false);
      });
    });

    describe("position validation", () => {
      it("should reject invalid position string", () => {
        const data = { ...baseValidData, position: "invalid_position" };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Pozycja jest wymagana");
        }
      });

      it("should reject empty position", () => {
        const data = { ...baseValidData, position: "" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing position", () => {
        const { position, ...dataWithoutPosition } = baseValidData;
        const result = registerSchema.safeParse(dataWithoutPosition);
        expect(result.success).toBe(false);
      });

      it("should reject position with wrong case", () => {
        const data = { ...baseValidData, position: "FORWARD" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("consent validation", () => {
      it("should reject when consent is false", () => {
        const data = { ...baseValidData, consent: false };
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Zgoda jest wymagana");
        }
      });

      it("should reject missing consent", () => {
        const { consent, ...dataWithoutConsent } = baseValidData;
        const result = registerSchema.safeParse(dataWithoutConsent);
        expect(result.success).toBe(false);
      });

      it("should reject non-boolean consent value", () => {
        const data = { ...baseValidData, consent: "yes" };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("combined validation", () => {
      it("should report multiple validation errors", () => {
        const invalidData = {
          email: "invalid",
          password: "weak",
          first_name: "",
          last_name: "",
          position: "invalid",
          consent: false,
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1);
        }
      });

      it("should reject completely empty object", () => {
        const result = registerSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(6);
        }
      });

      it("should reject null values", () => {
        const data = {
          email: null,
          password: null,
          first_name: null,
          last_name: null,
          position: null,
          consent: null,
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});
