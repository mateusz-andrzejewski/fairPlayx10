"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SignupCard } from "./SignupCard";
import type {
  SignupCardViewModel,
  PaginationMetaDTO,
  SignupAction,
  UserRole,
} from "@/types";

interface EventSignupsListProps {
  signups: SignupCardViewModel[];
  pagination: PaginationMetaDTO;
  userRole: UserRole;
  loading?: boolean;
  onAction: (action: SignupAction) => void;
  onPageChange: (page: number) => void;
}

/**
 * Komponent odpowiedzialny za wyświetlanie paginowanej listy zapisów.
 * Składa się z kart zapisów i kontrolek paginacji.
 */
export function EventSignupsList({
  signups,
  pagination,
  userRole,
  loading = false,
  onAction,
  onPageChange,
}: EventSignupsListProps) {
  // Stan ładowania
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loader dla kart */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Brak zapisów
  if (signups.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Brak zapisów
        </h3>
        <p className="text-sm text-muted-foreground">
          Na to wydarzenie nie ma jeszcze żadnych zapisów.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista kart zapisów */}
      <div className="space-y-3">
        {signups.map((signup) => (
          <SignupCard
            key={signup.id}
            signup={signup}
            userRole={userRole}
            onAction={onAction}
          />
        ))}
      </div>

      {/* Paginacja */}
      {pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Wyświetlanie {((pagination.page - 1) * pagination.limit) + 1} do{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z{" "}
            {pagination.total} zapisów
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Poprzednia</span>
            </Button>

            <div className="flex items-center gap-1 px-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Strona</span>
              <span className="font-medium">{pagination.page}</span>
              <span className="text-sm text-muted-foreground">z</span>
              <span className="font-medium">{pagination.total_pages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">Następna</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
