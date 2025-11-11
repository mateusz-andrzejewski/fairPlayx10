import React from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Users, Calendar, Trophy, Settings, LogOut } from "lucide-react";

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  // Mock role - w rzeczywistości należy pobrać z user context
  const userRole = "admin";

  const navigationItems = [
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
  const availableItems = navigationItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard FairPlay</h1>
              <p className="text-muted-foreground">
                Witaj, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Panel zarządzania</h2>
          <p className="text-muted-foreground text-lg">
            Wybierz sekcję, którą chcesz zarządzać
          </p>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.href}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => window.location.href = item.href}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{item.description}</p>
                  <Button className="w-full mt-4" variant="outline">
                    Przejdź
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick stats */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Szybki przegląd</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nadchodzące wydarzenia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-muted-foreground">w najbliższym tygodniu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktywni gracze</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-muted-foreground">w systemie</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Twoje wydarzenia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-muted-foreground">jako organizator</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
