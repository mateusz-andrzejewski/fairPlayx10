import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
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
    });

    it("should reject missing fields", () => {
      const invalidData = { email: "test@example.com" };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "SecurePass1",
        first_name: "John",
        last_name: "Doe",
        position: "forward",
        consent: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject weak password without uppercase", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        first_name: "John",
        last_name: "Doe",
        position: "forward",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without digit", () => {
      const invalidData = {
        email: "test@example.com",
        password: "PasswordNoDigit",
        first_name: "John",
        last_name: "Doe",
        position: "forward",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty first name", () => {
      const invalidData = {
        email: "test@example.com",
        password: "SecurePass1",
        first_name: "",
        last_name: "Doe",
        position: "forward",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid position", () => {
      const invalidData = {
        email: "test@example.com",
        password: "SecurePass1",
        first_name: "John",
        last_name: "Doe",
        position: "invalid_position",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject when consent is false", () => {
      const invalidData = {
        email: "test@example.com",
        password: "SecurePass1",
        first_name: "John",
        last_name: "Doe",
        position: "forward",
        consent: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
