import React, { type ReactNode } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import { Header } from "../dashboard/Header";
import { Loader2 } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Allow rendering even if user is null (e.g. while redirecting) or let the page handle it.
  // However, Header needs a user or null. If null, it shows "Gość".
  // Ideally, authenticated layout should enforce authentication, but pages likely do that via redirects.

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={user} />
      {children}
    </div>
  );
}

