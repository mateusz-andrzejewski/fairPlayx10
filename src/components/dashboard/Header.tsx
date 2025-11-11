import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import type { UserDTO } from "../../types";

/**
 * Komponent Header - wyświetla informacje o zalogowanym użytkowniku i przycisk wylogowania.
 */
interface HeaderProps {
  currentUser: UserDTO;
}

export function Header({ currentUser }: HeaderProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard FairPlay</h1>
            <p className="text-muted-foreground">
              Witaj, {currentUser.first_name} {currentUser.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  );
}
