import React from "react";
import { Calendar, Settings, Trophy, Users } from "lucide-react";

import type { UserRole } from "../../types";
import { Button } from "../ui/button";

interface NavigationProps {
  userRole?: UserRole | null;
}

interface NavigationItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: UserRole[];
}

export function Navigation({ userRole }: NavigationProps) {
  const effectiveRole: UserRole = userRole ?? "player";

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

  const availableItems = navigationItems.filter((item) => item.roles.includes(effectiveRole));

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="outline"
                className="flex h-auto flex-col items-start gap-2 p-4 transition-colors hover:bg-accent"
                onClick={() => (window.location.href = item.href)}
              >
                <div className="flex w-full items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <p className="text-left text-sm text-muted-foreground">{item.description}</p>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
