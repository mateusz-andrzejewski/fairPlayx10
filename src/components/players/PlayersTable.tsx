import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlayerListItemVM, PaginationMetaDTO, UserRole, PlayerDTO } from "../../types";

interface PlayersTableProps {
  players: PlayerListItemVM[];
  pagination: PaginationMetaDTO;
  isLoading: boolean;
  userRole: UserRole;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onEdit: (player: PlayerDTO) => void;
  onDelete: (player: PlayerDTO) => void;
  onViewDetails: (player: PlayerDTO) => void;
}

export function PlayersTable({
  players,
  pagination,
  isLoading,
  userRole,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onViewDetails,
}: PlayersTableProps) {
  /**
   * Generowanie przycisków paginacji
   */
  const renderPaginationButtons = () => {
    const buttons = [];
    const { page, total_pages } = pagination;

    // Poprzednia strona
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Numery stron - prosty zakres
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(total_pages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          aria-label={`Strona ${i}`}
          aria-current={i === page ? "page" : undefined}
        >
          {i}
        </Button>
      );
    }

    // Następna strona
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= total_pages || isLoading}
        aria-label="Następna strona"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  /**
   * Tłumaczenie pozycji na polski
   */
  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      forward: "Napastnik",
      midfielder: "Pomocnik",
      defender: "Obrońca",
      goalkeeper: "Bramkarz",
    };
    return labels[position] || position;
  };

  if (isLoading && players.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Ładowanie graczy...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Pozycja</TableHead>
              {userRole === "admin" && <TableHead>Ocena umiejętności</TableHead>}
              <TableHead className="w-32">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userRole === "admin" ? 4 : 3} className="text-center py-8 text-muted-foreground">
                  {isLoading ? "Ładowanie..." : "Nie znaleziono graczy"}
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.fullName}</TableCell>
                  <TableCell>{getPositionLabel(player.position)}</TableCell>
                  {userRole === "admin" && (
                    <TableCell>{player.skill_rate ? `${player.skill_rate}/10` : "Brak oceny"}</TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(player)}
                        disabled={isLoading}
                        aria-label={`Zobacz szczegóły ${player.fullName}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(player)}
                        disabled={isLoading}
                        aria-label={`Edytuj ${player.fullName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {player.canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(player)}
                          disabled={isLoading}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Usuń ${player.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Kontrolki paginacji */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Pokazuje {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} do{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total} wyników
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wybór liczby elementów na stronie */}
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            {/* Przyciski paginacji */}
            <div className="flex items-center gap-1">{renderPaginationButtons()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
