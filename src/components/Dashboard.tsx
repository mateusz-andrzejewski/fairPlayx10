import React, { useEffect } from "react";
import { useDashboardData } from "../lib/hooks/useDashboardData";
import { Header } from "./dashboard/Header";
import { Navigation } from "./dashboard/Navigation";
import { MainContent } from "./dashboard/MainContent";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Główny komponent widoku Dashboard.
 * Ładuje dane i renderuje role-zależne sekcje zgodnie z planem implementacji.
 */
function Dashboard() {
  const { loading, error, dashboardData } = useDashboardData();

  // Obsługa błędów autoryzacji - przekieruj na login jeśli użytkownik nie ma dostępu
  useEffect(() => {
    if (error) {
      const authErrors = [
        'User not authenticated',
        'User account is not active',
        'Failed to load user profile'
      ];

      if (authErrors.some(authError => error.includes(authError))) {
        toast.error('Brak dostępu do dashboardu', {
          description: 'Zaloguj się ponownie lub skontaktuj się z administratorem.'
        });
        // Przekieruj na login po krótkim opóźnieniu
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  }, [error]);

  // Stan ładowania
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={{
          id: 0,
          email: "",
          first_name: "Ładowanie...",
          last_name: "",
          role: "player",
          status: "active"
        }} />

        <Navigation userRole="player" />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Loading skeleton dla WelcomeSection */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>

          {/* Loading skeleton dla UpcomingEventsList */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
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
        <Header currentUser={{
          id: 0,
          email: "",
          first_name: "Błąd",
          last_name: "",
          role: "player",
          status: "active"
        }} />

        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Błąd ładowania danych</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
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
      <Navigation userRole={dashboardData.currentUser.role} />
      <MainContent dashboardData={dashboardData} />
    </div>
  );
}

export default Dashboard;
