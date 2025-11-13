import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, UserCheck } from "lucide-react";
import ApproveUserModal from "../users/ApproveUserModal";
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
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const handleOpenApproveModal = (user: UserDTO) => {
    setSelectedUser(user);
    setIsApproveModalOpen(true);
  };

  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserApproved = () => {
    // Odśwież dane po zatwierdzeniu
    onRefetch?.();
  };

  return (
    <>
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
                        onClick={() => handleOpenApproveModal(user)}
                      >
                        <UserCheck className="h-3 w-3" />
                        Zatwierdź
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

      {/* Approve User Modal */}
      <ApproveUserModal
        user={selectedUser}
        isOpen={isApproveModalOpen}
        onClose={handleCloseApproveModal}
        onApprove={handleUserApproved}
      />
    </>
  );
}
