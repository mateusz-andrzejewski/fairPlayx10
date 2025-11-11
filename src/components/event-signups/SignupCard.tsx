"use client";

import React from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SignupCardViewModel, SignupAction, UserRole } from "@/types";

interface SignupCardProps {
  signup: SignupCardViewModel;
  userRole: UserRole;
  onAction: (action: SignupAction) => void;
}

/**
 * Komponent karty pojedynczego zapisu uczestnika.
 * Wyświetla informacje o graczu, status zapisu oraz przyciski akcji w zależności od roli użytkownika.
 */
export function SignupCard({ signup, userRole, onAction }: SignupCardProps) {
  // Mapowanie statusów na konfigurację wizualną
  const statusConfig = {
    pending: {
      label: "Oczekujący",
      variant: "secondary" as const,
      icon: ClockIcon,
      color: "text-yellow-600",
    },
    confirmed: {
      label: "Potwierdzony",
      variant: "default" as const,
      icon: CheckCircleIcon,
      color: "text-green-600",
    },
    withdrawn: {
      label: "Wycofany",
      variant: "destructive" as const,
      icon: XCircleIcon,
      color: "text-red-600",
    },
  };

  const config = statusConfig[signup.status];
  const StatusIcon = config.icon;

  // Formatowanie daty
  const formattedDate = format(new Date(signup.signupTimestamp), "dd MMM yyyy, HH:mm", {
    locale: pl,
  });

  // Sprawdzenie uprawnień do akcji
  const canConfirm = userRole === "admin" || userRole === "organizer";
  const canWithdraw = userRole === "admin" || userRole === "organizer";
  const canShowActions = canConfirm || canWithdraw;

  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Informacje o graczu */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{signup.player.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{signup.player.position}</p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          {/* Status i akcje */}
          <div className="flex flex-col items-end gap-2 min-w-0">
            <Badge variant={config.variant} className="flex items-center gap-1 shrink-0">
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>

            {/* Przyciski akcji - tylko dla organizatora/admina */}
            {canShowActions && (
              <div className="flex gap-1 flex-wrap justify-end">
                {signup.status === "pending" && canConfirm && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onAction({
                        type: "updateStatus",
                        signupId: signup.id,
                        newStatus: "confirmed",
                      })
                    }
                    className="text-xs px-2 py-1 h-7 shrink-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    Potwierdź
                  </Button>
                )}

                {(signup.status === "pending" || signup.status === "confirmed") && canWithdraw && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onAction({
                        type: "withdraw",
                        signupId: signup.id,
                      })
                    }
                    className="text-xs px-2 py-1 h-7 text-destructive hover:text-destructive shrink-0 focus-visible:ring-2 focus-visible:ring-destructive/20"
                  >
                    Wycofaj
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
