import React, { useState, useMemo } from "react";
import { Search, X, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventFiltersViewModel } from "../../types";

interface LocationOption {
  value: string;
  label: string;
}

interface EventFiltersProps {
  filters: EventFiltersViewModel;
  availableLocations: LocationOption[];
  onFiltersChange: (filters: EventFiltersViewModel) => void;
  onReset: () => void;
  isLoading?: boolean;
}

/**
 * Komponent formularza z kontrolkami do filtrowania listy wydarzeń.
 * Pozwala na wyszukiwanie po lokalizacji, zakresie dat i innych kryteriach.
 */
export function EventFilters({
  filters,
  availableLocations,
  onFiltersChange,
  onReset,
  isLoading = false,
}: EventFiltersProps) {
  const [localFilters, setLocalFilters] = useState<EventFiltersViewModel>(filters);

  /**
   * Obsługa zmiany tekstu wyszukiwania
   */
  const handleSearchChange = (value: string) => {
    // Walidacja: maksymalnie 100 znaków
    if (value.length > 100) {
      return;
    }

    const newFilters = {
      ...localFilters,
      search: value,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Obsługa zmiany lokalizacji
   */
  const handleLocationChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      location: value === "all" ? undefined : value,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Obsługa zmiany daty "od"
   */
  const handleDateFromChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      date_from: value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Obsługa zmiany daty "do"
   */
  const handleDateToChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      date_to: value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Zastosowanie filtrów
   */
  const handleApplyFilters = () => {
    // Walidacja zakresu dat
    if (localFilters.date_from && localFilters.date_to) {
      const dateFrom = new Date(localFilters.date_from);
      const dateTo = new Date(localFilters.date_to);

      if (dateFrom > dateTo) {
        // TODO: Dodać obsługę błędów walidacji
        return;
      }
    }

    onFiltersChange(localFilters);
  };

  /**
   * Czyszczenie wszystkich filtrów
   */
  const handleClearFilters = () => {
    const resetFilters = {
      page: 1,
      limit: filters.limit || 20,
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  /**
   * Sprawdzenie czy jakieś filtry są aktywne
   */
  const hasActiveFilters = useMemo(() => {
    return !!(localFilters.search?.trim() || localFilters.location || localFilters.date_from || localFilters.date_to);
  }, [localFilters]);

  /**
   * Walidacja zakresu dat
   */
  const isDateRangeValid = useMemo(() => {
    if (!localFilters.date_from || !localFilters.date_to) return true;

    const dateFrom = new Date(localFilters.date_from);
    const dateTo = new Date(localFilters.date_to);

    return dateFrom <= dateTo;
  }, [localFilters.date_from, localFilters.date_to]);

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border">
      {/* Nagłówek */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Filtry wydarzeń</h3>
      </div>

      {/* Kontrolki filtrów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wyszukiwanie tekstowe */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Wyszukaj
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Nazwa lub lokalizacja..."
              value={localFilters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              maxLength={100}
              aria-label="Wyszukaj wydarzenia"
            />
          </div>
        </div>

        {/* Lokalizacja */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            <MapPin className="h-4 w-4 inline mr-1" />
            Lokalizacja
          </Label>
          <Select value={localFilters.location || "all"} onValueChange={handleLocationChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz lokalizację" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
              {availableLocations.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data od */}
        <div className="space-y-2">
          <Label htmlFor="date-from" className="text-sm font-medium">
            <Calendar className="h-4 w-4 inline mr-1" />
            Data od
          </Label>
          <Input
            id="date-from"
            type="date"
            value={localFilters.date_from || ""}
            onChange={(e) => handleDateFromChange(e.target.value)}
            disabled={isLoading}
            className={!isDateRangeValid ? "border-destructive" : ""}
            aria-label="Data rozpoczęcia"
          />
        </div>

        {/* Data do */}
        <div className="space-y-2">
          <Label htmlFor="date-to" className="text-sm font-medium">
            <Calendar className="h-4 w-4 inline mr-1" />
            Data do
          </Label>
          <Input
            id="date-to"
            type="date"
            value={localFilters.date_to || ""}
            onChange={(e) => handleDateToChange(e.target.value)}
            disabled={isLoading}
            className={!isDateRangeValid ? "border-destructive" : ""}
            aria-label="Data zakończenia"
          />
        </div>
      </div>

      {/* Komunikaty błędów */}
      {!isDateRangeValid && (
        <div className="text-sm text-destructive">Data &quot;od&quot; nie może być późniejsza niż data &quot;do&quot;</div>
      )}

      {/* Przyciski akcji */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleApplyFilters} disabled={isLoading || !isDateRangeValid} className="flex-1">
          Zastosuj filtry
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="shrink-0"
            aria-label="Wyczyść wszystkie filtry"
          >
            <X className="h-4 w-4 mr-2" />
            Wyczyść
          </Button>
        )}
      </div>
    </div>
  );
}
