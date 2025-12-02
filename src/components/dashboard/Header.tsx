import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";
import type { UserDTO } from "../../types";
import { Button } from "../ui/button";

interface HeaderProps {
  currentUser?: UserDTO | null;
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

  const displayName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}`.trim() : "Gość";

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <a href="/dashboard" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold">Dashboard FairPlay</h1>
            </a>
            <p className="text-muted-foreground">Witaj, {displayName || "Gość"}</p>
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
