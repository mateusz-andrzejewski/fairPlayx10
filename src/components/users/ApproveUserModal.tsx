import React, { useState, useEffect } from "react";
import { Search, UserPlus, Link as LinkIcon, Loader2 } from "lucide-react";

import type { UserDTO, PlayerDTO, UserRole } from "../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ApproveUserModalProps {
  user: UserDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

type ApprovalMode = "create" | "link" | "none";

export default function ApproveUserModal({ user, isOpen, onClose, onApprove }: ApproveUserModalProps) {
  const [role, setRole] = useState<UserRole>("player");
  const [mode, setMode] = useState<ApprovalMode>("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<PlayerDTO[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setRole("player");
      setMode("create");
      setSearchQuery("");
      setPlayers([]);
      setSelectedPlayer(null);
    }
  }, [isOpen, user]);

  // Search players
  const searchPlayers = async () => {
    if (!searchQuery.trim()) {
      toast.error("Wprowadź frazę wyszukiwania");
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        limit: "10",
      });

      const response = await fetch(`/api/players?${params}`);
      if (!response.ok) {
        throw new Error("Błąd podczas wyszukiwania graczy");
      }

      const result = await response.json();
      setPlayers(result.data);

      if (result.data.length === 0) {
        toast.info("Nie znaleziono graczy");
      }
    } catch (error) {
      console.error("Błąd podczas wyszukiwania graczy:", error);
      toast.error("Błąd podczas wyszukiwania graczy");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle approval
  const handleApprove = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Prepare approval data
      const approvalData: {
        role: UserRole;
        player_id?: number | null;
        create_player?: boolean;
      } = {
        role,
      };

      if (mode === "create") {
        approvalData.create_player = true;
      } else if (mode === "link" && selectedPlayer) {
        approvalData.player_id = selectedPlayer;
      }
      // mode === "none" - nie dodajemy nic

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas zatwierdzania użytkownika");
      }

      toast.success(`Użytkownik ${user.first_name} ${user.last_name} został zatwierdzony`, {
        description: `Nadano rolę: ${role === "player" ? "Gracz" : role === "organizer" ? "Organizator" : "Admin"}`,
      });

      onApprove();
      onClose();
    } catch (error) {
      console.error("Błąd podczas zatwierdzania użytkownika:", error);
      toast.error("Błąd podczas zatwierdzania użytkownika", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie później.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zatwierdzanie użytkownika</DialogTitle>
        </DialogHeader>

        {/* User info */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Imię i nazwisko:</span>
              <div className="text-muted-foreground">
                {user.first_name} {user.last_name}
              </div>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Role selection */}
        <div className="space-y-2">
          <Label htmlFor="role">Rola użytkownika *</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Wybierz rolę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Gracz</SelectItem>
              <SelectItem value="organizer">Organizator</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {role === "player" && "Użytkownik będzie mógł przeglądać wydarzenia i zapisywać się na nie"}
            {role === "organizer" && "Użytkownik będzie mógł tworzyć i zarządzać wydarzeniami"}
            {role === "admin" && "Użytkownik będzie miał pełny dostęp do systemu"}
          </p>
        </div>

        {/* Player linkage mode */}
        <div className="space-y-2">
          <Label>Powiązanie z profilem gracza</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="mode-create"
                name="mode"
                value="create"
                checked={mode === "create"}
                onChange={() => setMode("create")}
                className="h-4 w-4"
              />
              <label htmlFor="mode-create" className="text-sm font-medium leading-none cursor-pointer">
                <UserPlus className="inline h-4 w-4 mr-1" />
                Utwórz nowy profil gracza
              </label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Zostanie utworzony nowy profil gracza z domyślnymi wartościami (pozycja: pomocnik, skill rate: 5)
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="mode-link"
                name="mode"
                value="link"
                checked={mode === "link"}
                onChange={() => setMode("link")}
                className="h-4 w-4"
              />
              <label htmlFor="mode-link" className="text-sm font-medium leading-none cursor-pointer">
                <LinkIcon className="inline h-4 w-4 mr-1" />
                Powiąż z istniejącym graczem
              </label>
            </div>

            {mode === "link" && (
              <div className="ml-6 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Szukaj gracza po imieniu lub nazwisku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchPlayers();
                      }
                    }}
                  />
                  <Button onClick={searchPlayers} disabled={isSearching} variant="secondary">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {players.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`p-2 cursor-pointer hover:bg-muted ${
                          selectedPlayer === player.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedPlayer(player.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {player.first_name} {player.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Pozycja:{" "}
                              {player.position === "forward"
                                ? "Napastnik"
                                : player.position === "midfielder"
                                  ? "Pomocnik"
                                  : player.position === "defender"
                                    ? "Obrońca"
                                    : "Bramkarz"}
                            </div>
                          </div>
                          {selectedPlayer === player.id && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mode === "link" && !selectedPlayer && players.length > 0 && (
                  <p className="text-sm text-amber-600">Wybierz gracza z listy</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="mode-none"
                name="mode"
                value="none"
                checked={mode === "none"}
                onChange={() => setMode("none")}
                className="h-4 w-4"
              />
              <label htmlFor="mode-none" className="text-sm font-medium leading-none cursor-pointer">
                Bez profilu gracza
              </label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              Użytkownik będzie miał tylko konto w systemie bez profilu gracza (np. dla organizatorów)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting || (mode === "link" && !selectedPlayer)}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Zatwierdzanie...
              </>
            ) : (
              "Zatwierdź użytkownika"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
