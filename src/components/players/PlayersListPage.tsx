import React from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchAndFilters } from "./SearchAndFilters";
import { PlayersTable } from "./PlayersTable";
import { PlayerForm } from "./PlayerForm";
import { PlayerDetailsModal } from "./PlayerDetailsModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { usePlayersManagement } from "../../lib/hooks/usePlayersManagement";
import { useAuth } from "../../lib/hooks/useAuth";
import type { PlayerFormData } from "../../lib/validation/playerForm";

export default function PlayersListPage() {
  // Hook autoryzacji do pobrania roli użytkownika
  const { user } = useAuth();

  // TODO: Pobrać prawdziwą rolę użytkownika z locals lub API
  // Na razie używamy mock roli dla testowania
  const userRole: "admin" | "organizer" | "player" = "admin";

  // Hook zarządzania graczami
  const { players, pagination, loading, error, filters, modalStates, isSubmitting, permissions, actions } =
    usePlayersManagement(userRole);

  /**
   * Obsługa dodania nowego gracza
   */
  const handleCreatePlayer = async (data: PlayerFormData) => {
    await actions.createPlayer(data);
  };

  /**
   * Obsługa edycji gracza
   */
  const handleEditPlayer = async (data: PlayerFormData) => {
    const player = modalStates.selectedPlayer;
    if (player) {
      await actions.updatePlayer(player.id, data);
    }
  };

  /**
   * Obsługa usunięcia gracza
   */
  const handleDeletePlayer = async () => {
    const player = modalStates.selectedPlayer;
    if (player) {
      await actions.deletePlayer(player.id);
    }
  };

  // Sprawdzenie uprawnień dostępu do strony
  // TODO: Zaimplementować prawdziwe sprawdzenie dostępu po naprawieniu useAuth
  // Na razie używamy mock roli dla testowania
  if (userRole !== "admin" && userRole !== "organizer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Brak dostępu</h1>
          <p className="text-muted-foreground">Nie masz uprawnień do przeglądania tej strony.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Przycisk powrotu do dashboard */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/dashboard"}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do dashboard
          </Button>
        </div>

        {/* Nagłówek */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Lista graczy</h1>
            <p className="text-muted-foreground mt-2">Zarządzaj bazą graczy w systemie FairPlay</p>
          </div>

          {permissions.canCreate && (
            <Button onClick={actions.openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj gracza
            </Button>
          )}
        </div>

        {/* Komunikaty błędów */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Filtry wyszukiwania */}
        <SearchAndFilters filters={filters} onFiltersChange={actions.setSearchFilters} isLoading={loading} />

        {/* Tabela graczy */}
        <div className="mt-6">
          <PlayersTable
            players={players}
            pagination={pagination}
            isLoading={loading}
            userRole={userRole}
            onPageChange={actions.goToPage}
            onEdit={actions.openEditModal}
            onDelete={actions.openDeleteDialog}
            onViewDetails={actions.openDetailsModal}
          />
        </div>

        {/* Modale */}
        <PlayerForm
          isOpen={modalStates.isCreateModalOpen}
          isSubmitting={isSubmitting}
          userRole={userRole}
          onSubmit={handleCreatePlayer}
          onCancel={actions.closeAllModals}
        />

        <PlayerForm
          player={modalStates.selectedPlayer || undefined}
          isOpen={modalStates.isEditModalOpen}
          isSubmitting={isSubmitting}
          userRole={userRole}
          onSubmit={handleEditPlayer}
          onCancel={actions.closeAllModals}
        />

        {modalStates.selectedPlayer && (
          <PlayerDetailsModal
            player={modalStates.selectedPlayer}
            isOpen={modalStates.isDetailsModalOpen}
            userRole={userRole}
            onClose={actions.closeAllModals}
            onEdit={actions.openEditModal}
          />
        )}

        {modalStates.selectedPlayer && (
          <ConfirmDeleteDialog
            player={modalStates.selectedPlayer}
            isOpen={modalStates.isDeleteDialogOpen}
            isDeleting={isSubmitting}
            onConfirm={handleDeletePlayer}
            onCancel={actions.closeAllModals}
          />
        )}
      </div>
    </div>
  );
}
