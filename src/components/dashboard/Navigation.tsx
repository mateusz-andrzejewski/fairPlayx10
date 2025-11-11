import React from "react";
import { Button } from "../ui/button";
import { Users, Calendar, Trophy, Settings } from "lucide-react";
import type { UserRole } from "../../types";

/**
 * Komponent Navigation - responsywna nawigacja z linkami do sekcji dashboardu.
 */
interface NavigationProps {
  userRole: UserRole;
}

interface NavigationItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: UserRole[];
}

export function Navigation({ userRole }: NavigationProps) {
  const navigationItems: NavigationItem[] = [
    {
      title: "Gracze",
      description: "Zarządzaj bazą graczy w systemie",
      icon: Users,
      href: "/dashboard/players",
      roles: ["admin", "organizer"],
    },
    {
      title: "Wydarzenia",
      description: "Przeglądaj i zarządzaj wydarzeniami",
      icon: Calendar,
      href: "/dashboard/events",
      roles: ["admin", "organizer", "player"],
    },
    {
      title: "Turnieje",
      description: "Organizuj i śledź turnieje",
      icon: Trophy,
      href: "/dashboard/tournaments",
      roles: ["admin", "organizer"],
    },
    {
      title: "Ustawienia",
      description: "Zarządzaj ustawieniami konta",
      icon: Settings,
      href: "/dashboard/settings",
      roles: ["admin", "organizer", "player"],
    },
  ];

  // Filtrowanie elementów nawigacji na podstawie roli użytkownika
  const availableItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent transition-colors"
                onClick={() => (window.location.href = item.href)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {item.description}
                </p>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
