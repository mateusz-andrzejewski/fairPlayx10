import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserDTO } from "../../types";

/**
 * Komponent UserManagementSection - sekcja zarządzania użytkownikami (tylko admin).
 */
interface UserManagementSectionProps {
  users: UserDTO[];
  onRefetch?: () => void;
}

export function UserManagementSection({ users, onRefetch }: UserManagementSectionProps) {
  const pendingUsers = users.filter((user) => user.status === "pending");
  const approvedUsers = users.filter((user) => user.status === "approved");
  const [approvingUsers, setApprovingUsers] = useState<Set<number>>(new Set());

  const handleApproveUser = async (userId: number, userName: string) => {
    // Dodaj użytkownika do stanu ładowania
    setApprovingUsers((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas zatwierdzania użytkownika");
      }

      const result = await response.json();

      toast.success(`Użytkownik ${userName} został zatwierdzony`, {
        description: "Użytkownik może teraz korzystać z pełnej funkcjonalności aplikacji.",
      });

      // Odśwież dane
      onRefetch?.();
    } catch (error) {
      console.error("Błąd podczas zatwierdzania użytkownika:", error);
      toast.error("Błąd podczas zatwierdzania użytkownika", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie później.",
      });
    } finally {
      // Usuń użytkownika ze stanu ładowania
      setApprovingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Zarządzanie użytkownikami
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <p className="text-sm text-muted-foreground">Wszystkich użytkowników</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
            <p className="text-sm text-muted-foreground">Oczekujących</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
            <p className="text-sm text-muted-foreground">Zatwierdzonych</p>
          </div>
        </div>

        {/* Lista oczekujących użytkowników */}
        {pendingUsers.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Oczekujący na zatwierdzenie</h4>
            <div className="space-y-2">
              {pendingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {user.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={approvingUsers.has(user.id)}
                      onClick={() => handleApproveUser(user.id, `${user.first_name} ${user.last_name}`)}
                    >
                      {approvingUsers.has(user.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserCheck className="h-3 w-3" />
                      )}
                      {approvingUsers.has(user.id) ? "Zatwierdzanie..." : "Zatwierdź"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Przycisk do pełnej listy */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard/users")}>
            Zarządzaj wszystkimi użytkownikami
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
