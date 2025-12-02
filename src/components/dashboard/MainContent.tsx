import React from "react";
import { WelcomeSection } from "./WelcomeSection";
import { UpcomingEventsList } from "./UpcomingEventsList";
import { ManagementSections } from "./ManagementSections";
import { NotificationsPanel } from "./NotificationsPanel";
import type { DashboardViewModel } from "../../types";

/**
 * Komponent MainContent - główna zawartość dashboardu.
 * Zawiera WelcomeSection, UpcomingEventsList, ManagementSections i NotificationsPanel.
 */
interface MainContentProps {
  dashboardData: DashboardViewModel;
  onRefetch?: () => void;
}

export function MainContent({ dashboardData, onRefetch }: MainContentProps) {
  const { currentUser, nearestEvent, upcomingEvents, notifications, managementData } = dashboardData;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Sekcja powitalna z najbliższym wydarzeniem */}
      <WelcomeSection nearestEvent={nearestEvent} />

      {/* Lista nadchodzących wydarzeń */}
      <UpcomingEventsList events={upcomingEvents} />

      {/* Sekcje zarządzania (rola-zależne) */}
      <ManagementSections userRole={currentUser.role} managementData={managementData} onRefetch={onRefetch} />

      {/* Panel powiadomień */}
      <NotificationsPanel notifications={notifications} />
    </main>
  );
}
