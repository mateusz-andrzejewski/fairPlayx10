import { describe, it, expect } from "vitest";
import { translateUserRole, translatePlayerPosition } from "./translations";

describe("translations", () => {
  describe("translateUserRole", () => {
    it("should translate admin to Administrator", () => {
      expect(translateUserRole("admin")).toBe("Administrator");
    });

    it("should translate organizer to Organizator", () => {
      expect(translateUserRole("organizer")).toBe("Organizator");
    });

    it("should translate player to Gracz", () => {
      expect(translateUserRole("player")).toBe("Gracz");
    });

    it("should return the original value for unknown roles", () => {
      expect(translateUserRole("unknown" as any)).toBe("unknown");
    });
  });

  describe("translatePlayerPosition", () => {
    it("should translate forward to Napastnik", () => {
      expect(translatePlayerPosition("forward")).toBe("Napastnik");
    });

    it("should translate midfielder to Pomocnik", () => {
      expect(translatePlayerPosition("midfielder")).toBe("Pomocnik");
    });

    it("should translate defender to Obrońca", () => {
      expect(translatePlayerPosition("defender")).toBe("Obrońca");
    });

    it("should translate goalkeeper to Bramkarz", () => {
      expect(translatePlayerPosition("goalkeeper")).toBe("Bramkarz");
    });

    it("should return the original value for unknown positions", () => {
      expect(translatePlayerPosition("unknown" as any)).toBe("unknown");
    });
  });
});
