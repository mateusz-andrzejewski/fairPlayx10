import React, { useState, useEffect } from "react";
import { ArrowLeft, UserCheck, UserX, Loader2, Edit } from "lucide-react";

import { useAuth } from "../../lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import ApproveUserModal from "./ApproveUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { EditUserRoleModal } from "./EditUserRoleModal";
import type { UserDTO, UserRole } from "../../types";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { translateUserRole } from "../../lib/utils/translations";

interface UsersManagementPageProps {
  initialUsers?: UserDTO[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export default function UsersManagementPage({ initialUsers = [], initialPagination }: UsersManagementPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState<UserDTO[]>(initialUsers);
  const [pagination, setPagination] = useState(initialPagination || { page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);

  // Ładowanie danych użytkowników
  const loadUsers = async (page = 1, status?: string) => {
    console.log("[UsersManagementPage] loadUsers called with page:", page, "status:", status);
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (status) params.append("status", status);

      console.log("[UsersManagementPage] Fetching /api/users with params:", params.toString());
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        throw new Error("Błąd podczas ładowania użytkowników");
      }

      const result = await response.json();
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Błąd podczas ładowania użytkowników:", error);
      toast.error("Błąd podczas ładowania użytkowników");
    } finally {
      setLoading(false);
    }
  };

  // Obsługa otwierania modalu zatwierdzania
  const handleOpenApproveModal = (user: UserDTO) => {
    setSelectedUser(user);
    setIsApproveModalOpen(true);
  };

  // Obsługa zamknięcia modalu
  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedUser(null);
  };

  // Callback po zatwierdzeniu użytkownika
  const handleUserApproved = async () => {
    // Odśwież listę użytkowników
    await loadUsers(pagination.page);
  };

  // Obsługa otwierania modalu usuwania
  const handleOpenDeleteModal = (user: UserDTO) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Obsługa zamknięcia modalu usuwania
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Obsługa usunięcia użytkownika
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Wystąpił błąd podczas usuwania użytkownika");
      }

      toast.success("Użytkownik został usunięty", {
        description: `Użytkownik ${selectedUser.first_name} ${selectedUser.last_name} został pomyślnie usunięty.`,
      });

      // Zamknij modal i odśwież listę
      handleCloseDeleteModal();
      await loadUsers(pagination.page);
    } catch (error) {
      console.error("Błąd podczas usuwania użytkownika:", error);
      toast.error("Błąd podczas usuwania użytkownika", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie później.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Obsługa otwierania modalu edycji roli
  const handleOpenEditRoleModal = (user: UserDTO) => {
    setSelectedUser(user);
    setIsEditRoleModalOpen(true);
  };

  // Obsługa zamknięcia modalu edycji roli
  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setSelectedUser(null);
  };

  // Obsługa zapisania zmian roli użytkownika
  const handleSaveUserRole = async (userId: number, newRole: UserRole) => {
    setIsEditingRole(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole, status: "approved" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Wystąpił błąd podczas aktualizacji roli użytkownika");
      }

      toast.success("Rola użytkownika została zaktualizowana", {
        description: `Nowa rola: ${newRole}`,
      });

      // Zamknij modal i odśwież listę
      handleCloseEditRoleModal();
      await loadUsers(pagination.page);
    } catch (error) {
      console.error("Błąd podczas aktualizacji roli użytkownika:", error);
      toast.error("Błąd podczas aktualizacji roli", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie później.",
      });
    } finally {
      setIsEditingRole(false);
    }
  };

  // Ładowanie danych przy montowaniu komponentu
  useEffect(() => {
    console.log("[UsersManagementPage] useEffect triggered, initialUsers.length:", initialUsers.length);
    if (!initialUsers.length) {
      console.log("[UsersManagementPage] Calling loadUsers()");
      loadUsers();
    }
  }, []);

  // Sprawdzanie uprawnień
  if (isAuthLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Ładowanie danych użytkownika...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <AuthenticatedLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Brak dostępu</h2>
              <p className="text-muted-foreground">
                {!user
                  ? "Musisz być zalogowany, aby zarządzać użytkownikami."
                  : "Nie masz uprawnień do zarządzania użytkownikami."}
              </p>
              {!user && (
                <Button onClick={() => (window.location.href = "/login")} className="mt-4">
                  Przejdź do logowania
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Tytuł */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Zarządzanie użytkownikami</h1>
              <p className="text-muted-foreground">Zarządzaj kontami użytkowników aplikacji</p>
            </div>

            {/* Przycisk powrotu */}
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do Dashboard
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Statystyki */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{pagination.total}</div>
                <p className="text-sm text-muted-foreground">Wszystkich użytkowników</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {users.filter((u) => u.status === "pending").length}
                </div>
                <p className="text-sm text-muted-foreground">Oczekujących</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.status === "approved").length}
                </div>
                <p className="text-sm text-muted-foreground">Zatwierdzonych</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{users.filter((u) => u.deleted_at).length}</div>
                <p className="text-sm text-muted-foreground">Usuniętych</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela użytkowników */}
          <Card>
            <CardHeader>
              <CardTitle>Lista użytkowników</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Ładowanie...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Użytkownik</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rola</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data rejestracji</TableHead>
                      <TableHead>Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{translateUserRole(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "approved" ? "default" : "secondary"}
                            className={
                              user.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {user.status === "approved" ? "Zatwierdzony" : "Oczekuje"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString("pl-PL")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleOpenApproveModal(user)}
                              >
                                <UserCheck className="h-3 w-3" />
                                Zatwierdź
                              </Button>
                            )}
                            {user.status === "approved" && !user.deleted_at && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  onClick={() => handleOpenEditRoleModal(user)}
                                >
                                  <Edit className="h-3 w-3" />
                                  Edytuj
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => handleOpenDeleteModal(user)}
                                >
                                  <UserX className="h-3 w-3" />
                                  Usuń
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Paginacja */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Strona {pagination.page} z {pagination.total_pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() => loadUsers(pagination.page - 1)}
                    >
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages || loading}
                      onClick={() => loadUsers(pagination.page + 1)}
                    >
                      Następna
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approve User Modal */}
        <ApproveUserModal
          user={selectedUser}
          isOpen={isApproveModalOpen}
          onClose={handleCloseApproveModal}
          onApprove={handleUserApproved}
        />

        {/* Delete User Modal */}
        <DeleteUserModal
          user={selectedUser}
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteUser}
          isDeleting={isDeleting}
        />

        {/* Edit User Role Modal */}
        <EditUserRoleModal
          user={selectedUser}
          isOpen={isEditRoleModalOpen}
          onClose={handleCloseEditRoleModal}
          onSave={handleSaveUserRole}
          isSubmitting={isEditingRole}
        />
      </div>
    </AuthenticatedLayout>
  );
}

