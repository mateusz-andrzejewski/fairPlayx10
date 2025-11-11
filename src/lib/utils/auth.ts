import type { UserRole } from "../../types";

/**
 * Sprawdza czy użytkownik ma rolę administratora.
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Sprawdza czy użytkownik ma rolę organizatora.
 */
export function isOrganizer(role: UserRole): boolean {
  return role === "organizer";
}

/**
 * Sprawdza czy użytkownik ma rolę gracza.
 */
export function isPlayer(role: UserRole): boolean {
  return role === "player";
}

/**
 * Sprawdza czy użytkownik może zarządzać zapisami na wydarzenia.
 * Administratorzy i organizatorzy mają pełne uprawnienia.
 */
export function canManageEventSignups(role: UserRole): boolean {
  return isAdmin(role) || isOrganizer(role);
}

/**
 * Sprawdza czy użytkownik może zapisywać się na wydarzenia jako gracz.
 * Wszyscy użytkownicy z rolą player mogą się zapisywać.
 */
export function canSignUpForEvents(role: UserRole): boolean {
  return isPlayer(role);
}
