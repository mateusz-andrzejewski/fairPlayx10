"use client";

import React, { useState, useEffect } from "react";
import { ShirtIcon, Users, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamViewModel, TeamColor, UserRole } from "@/types";
import { translatePlayerPosition } from "../../lib/utils/translations";

interface TeamAssignmentsViewProps {
  eventId: number;
  userRole: UserRole;
  currentPlayerId?: number;
}

/**
 * Komponent wyświetlający przypisania drużyn dla wydarzenia.
 * Widoczny dla wszystkich ról - gracze widzą z kim grają i jaki kolor koszulki.
 * Admini dodatkowo widzią skill_rate poszczególnych graczy.
 */
export function TeamAssignmentsView({ eventId, userRole, currentPlayerId }: TeamAssignmentsViewProps) {
  const [teams, setTeams] = useState<TeamViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerTeam, setPlayerTeam] = useState<{ teamNumber: number; teamColor: TeamColor } | null>(null);

  useEffect(() => {
    const fetchTeamAssignments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/events/${eventId}/teams`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Grupuj przypisania wg drużyn
        const teamsMap = new Map<number, TeamViewModel>();

        data.data.forEach((assignment: any) => {
          const teamNumber = assignment.team_number;

          if (!teamsMap.has(teamNumber)) {
            teamsMap.set(teamNumber, {
              teamNumber,
              teamColor: assignment.team_color,
              players: [],
              avgSkillRate: 0,
              positions: {},
            });
          }

          const team = teamsMap.get(teamNumber)!;
          const player = assignment.player;

          if (player) {
            team.players.push({
              signupId: assignment.signup_id,
              playerId: player.id,
              name: `${player.first_name} ${player.last_name}`,
              position: player.position,
              skillRate: player.skill_rate, // null dla non-admin
            });

            // Zliczaj pozycje
            team.positions[player.position] = (team.positions[player.position] || 0) + 1;
          }
        });

        // Oblicz średni skill rate dla każdej drużyny (tylko jeśli mamy dane)
        const teamsArray = Array.from(teamsMap.values()).map((team) => {
          const playersWithSkillRate = team.players.filter((p) => p.skillRate !== null);
          const avgSkillRate =
            playersWithSkillRate.length > 0
              ? playersWithSkillRate.reduce((sum, p) => sum + (p.skillRate || 0), 0) / playersWithSkillRate.length
              : 0;

          return { ...team, avgSkillRate };
        });

        // Sortuj drużyny po numerze
        teamsArray.sort((a, b) => a.teamNumber - b.teamNumber);

        setTeams(teamsArray);

        // Znajdź drużynę gracza jeśli currentPlayerId jest podane
        if (currentPlayerId) {
          for (const team of teamsArray) {
            const playerInTeam = team.players.find((p) => p.playerId === currentPlayerId);
            if (playerInTeam) {
              setPlayerTeam({ teamNumber: team.teamNumber, teamColor: team.teamColor });
              break;
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać składów drużyn";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamAssignments();
  }, [eventId, currentPlayerId]);

  // Helper do mapowania kolorów na wartości CSS
  const getColorStyles = (color: TeamColor) => {
    const colorMap = {
      black: { bg: "bg-gray-900", text: "text-white", border: "border-gray-900", badge: "bg-gray-900 text-white" },
      white: {
        bg: "bg-white",
        text: "text-gray-900",
        border: "border-gray-300",
        badge: "bg-white text-gray-900 border border-gray-300",
      },
      red: { bg: "bg-red-600", text: "text-white", border: "border-red-600", badge: "bg-red-600 text-white" },
      blue: { bg: "bg-blue-600", text: "text-white", border: "border-blue-600", badge: "bg-blue-600 text-white" },
    };
    return colorMap[color];
  };

  // Helper do tłumaczenia pozycji
  const translatePosition = (position: string) => {
    return translatePlayerPosition(position as any);
  };

  // Helper do tłumaczenia kolorów
  const translateColor = (color: TeamColor) => {
    const translations: Record<TeamColor, string> = {
      black: "Czarny",
      white: "Biały",
      red: "Czerwony",
      blue: "Niebieski",
    };
    return translations[color];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Składy drużyn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (teams.length === 0) {
    return (
      <Alert>
        <AlertDescription>Składy drużyn nie zostały jeszcze wylosowane.</AlertDescription>
      </Alert>
    );
  }

  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-6">
      {/* Banner z informacją dla gracza */}
      {playerTeam && (
        <Alert className={`border-2 ${getColorStyles(playerTeam.teamColor).border}`}>
          <ShirtIcon className="w-5 h-5" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <AlertDescription className="flex-1">
              <span className="font-semibold">Jesteś w Drużynie {playerTeam.teamNumber}</span>
              <span className="ml-2 text-muted-foreground">•</span>
              <span className="ml-2">
                Kolor koszulki: <strong>{translateColor(playerTeam.teamColor)}</strong>
              </span>
            </AlertDescription>
            <Badge className={`${getColorStyles(playerTeam.teamColor).badge} shrink-0`}>
              {translateColor(playerTeam.teamColor)}
            </Badge>
          </div>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Składy drużyn
        </h3>
        <Badge variant="outline">{teams.length} drużyn(y)</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const colorStyles = getColorStyles(team.teamColor);

          return (
            <Card key={team.teamNumber} className={`border-2 ${colorStyles.border}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <ShirtIcon className="w-5 h-5" />
                    Drużyna {team.teamNumber}
                  </span>
                  <Badge className={colorStyles.badge}>{translateColor(team.teamColor)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statystyki drużyny */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Średni skill rate</span>
                  </div>
                  <span className="text-sm font-bold">{team.avgSkillRate.toFixed(1)}</span>
                </div>

                {/* Liczba graczy */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Liczba graczy</span>
                  <span className="font-medium">{team.players.length}</span>
                </div>

                {/* Lista graczy */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skład</p>
                  <div className="space-y-2">
                    {team.players.map((player) => (
                      <div
                        key={player.signupId}
                        className="flex items-center justify-between p-2 bg-background border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{translatePosition(player.position)}</p>
                        </div>
                        {isAdmin && player.skillRate !== null && (
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            {player.skillRate}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rozkład pozycji */}
                {Object.keys(team.positions).length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Rozkład pozycji
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(team.positions).map(([position, count]) => (
                        <Badge key={position} variant="outline" className="text-xs px-2 py-0.5">
                          {translatePosition(position)}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
