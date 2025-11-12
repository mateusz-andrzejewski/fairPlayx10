import { AlertCircle } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

import { useDashboardData } from "../lib/hooks/useDashboardData";
import { Header } from "./dashboard/Header";
import { MainContent } from "./dashboard/MainContent";
import { Navigation } from "./dashboard/Navigation";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

/**
 * Główny komponent widoku Dashboard.
 * Ładuje dane i renderuje role-zależne sekcje zgodnie z planem implementacji.
 */
function Dashboard() {
  const { loading, error, dashboardData, refetch } = useDashboardData();

  // Obsługa błędów autoryzacji - przekieruj na login jeśli użytkownik nie ma dostępu (poza trybem dev)
  useEffect(() => {
    if (error) {
      const authErrors = [
        "User not authenticated",
        "User account is not active",
        "Failed to load user profile",
        "Brak sesji użytkownika",
      ];

      if (authErrors.some((authError) => error.includes(authError))) {
        toast.error("Brak dostępu do dashboardu", {
          description: "Zaloguj się ponownie lub skontaktuj się z administratorem.",
        });

        const timeout = setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

        return () => clearTimeout(timeout);
      }
    }
  }, [error]);

  const loadingUser = {
    id: 0,
    email: "",
    first_name: "Ładowanie...",
    last_name: "",
    role: "player" as const,
    status: "approved" as const,
    player_id: null,
    created_at: "",
    updated_at: "",
    deleted_at: null,
  };

  const errorUser = {
    ...loadingUser,
    first_name: "Błąd",
  };

  // Stan ładowania
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={loadingUser} />

        <Navigation userRole={loadingUser.role} />

        <main className="container mx-auto space-y-8 px-4 py-8">
          {/* Loading skeleton dla WelcomeSection */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-8 w-64" />
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>

          {/* Loading skeleton dla UpcomingEventsList */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-4 h-6 w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Stan błędu
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={errorUser} />

        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Błąd ładowania danych</h3>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Brak danych
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Brak danych dashboardu</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render pełnego dashboardu
  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={dashboardData.currentUser} />
      <Navigation userRole={dashboardData.currentUser?.role} />
      <MainContent dashboardData={dashboardData} onRefetch={refetch} />
    </div>
  );
}

export default Dashboard;
