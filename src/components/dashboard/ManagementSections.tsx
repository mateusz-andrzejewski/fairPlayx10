import React from "react";
import { UserManagementSection } from "./UserManagementSection";
import { EventManagementSection } from "./EventManagementSection";
import { PlayerManagementSection } from "./PlayerManagementSection";
import type { UserRole, UserDTO, EventDTO, PlayerDTO } from "../../types";

/**
 * Komponent ManagementSections - kontener dla sekcji zarządzania.
 * Renderuje warunkowo sekcje na podstawie roli użytkownika.
 */
interface ManagementSectionsProps {
  userRole: UserRole;
  managementData: { users: UserDTO[], events: EventDTO[], players: PlayerDTO[] } | null;
}

export function ManagementSections({ userRole, managementData }: ManagementSectionsProps) {
  // Nie renderuj nic jeśli użytkownik nie ma uprawnień do zarządzania
  if (userRole === 'player' || !managementData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Sekcja zarządzania użytkownikami (tylko admin) */}
      {userRole === 'admin' && (
        <UserManagementSection users={managementData.users} />
      )}

      {/* Sekcja zarządzania wydarzeniami (admin/organizer) */}
      {(userRole === 'admin' || userRole === 'organizer') && (
        <EventManagementSection events={managementData.events} />
      )}

      {/* Sekcja zarządzania graczami (admin/organizer) */}
      {(userRole === 'admin' || userRole === 'organizer') && (
        <PlayerManagementSection players={managementData.players} />
      )}
    </div>
  );
}
