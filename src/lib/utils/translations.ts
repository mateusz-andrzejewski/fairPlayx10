import type { UserRole, PlayerPosition } from "../../types";

/**
 * Translates user role from English to Polish
 */
export function translateUserRole(role: UserRole): string {
  const translations: Record<UserRole, string> = {
    admin: "Administrator",
    organizer: "Organizator",
    player: "Gracz",
  };
  return translations[role] || role;
}

/**
 * Translates player position from English to Polish
 */
export function translatePlayerPosition(position: PlayerPosition): string {
  const translations: Record<PlayerPosition, string> = {
    forward: "Napastnik",
    midfielder: "Pomocnik",
    defender: "Obrońca",
    goalkeeper: "Bramkarz",
  };
  return translations[position] || position;
}
