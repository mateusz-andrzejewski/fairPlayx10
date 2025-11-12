import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Users, Star, TrendingUp } from "lucide-react";
import type { PlayerDTO } from "../../types";

/**
 * Komponent PlayerManagementSection - sekcja zarządzania graczami (admin/organizer).
 */
interface PlayerManagementSectionProps {
  players: PlayerDTO[];
}

export function PlayerManagementSection({ players }: PlayerManagementSectionProps) {
  // Oblicz statystyki
  const totalPlayers = players.length;
  const avgSkillRate =
    players.length > 0
      ? Math.round(players.reduce((sum, player) => sum + (player.skill_rate || 0), 0) / players.length)
      : 0;

  // Grupuj graczy według pozycji
  const positionStats = players.reduce(
    (acc, player) => {
      const position = player.position || "unknown";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Zarządzanie graczami
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalPlayers}</div>
            <p className="text-sm text-muted-foreground">Wszystkich graczy</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{avgSkillRate}</span>
            </div>
            <p className="text-sm text-muted-foreground">Średnia ocena</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Object.keys(positionStats).length}</div>
            <p className="text-sm text-muted-foreground">Pozycji</p>
          </div>
        </div>

        {/* Statystyki pozycji */}
        {Object.keys(positionStats).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Rozkład pozycji</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(positionStats).map(([position, count]) => (
                <div key={position} className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold">{count}</div>
                  <p className="text-sm text-muted-foreground capitalize">{position}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista najlepszych graczy */}
        {players.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Najlepsi gracze</h4>
            <div className="space-y-2">
              {players
                .filter((player) => player.skill_rate && player.skill_rate > 0)
                .sort((a, b) => (b.skill_rate || 0) - (a.skill_rate || 0))
                .slice(0, 5)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {player.first_name} {player.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{player.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1">
                        <Star className="h-3 w-3" />
                        {player.skill_rate}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Przycisk do pełnej listy */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard/players")}>
            Zarządzaj wszystkimi graczami
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
