import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PositionSelect } from "@/components/ui/position-select";
import type { SearchFiltersVM, PlayerPosition } from "../../types";

interface SearchAndFiltersProps {
  filters: SearchFiltersVM;
  onFiltersChange: (filters: SearchFiltersVM) => void;
  isLoading: boolean;
}

export function SearchAndFilters({ filters, onFiltersChange, isLoading }: SearchAndFiltersProps) {
  /**
   * Obsługa zmiany tekstu wyszukiwania
   */
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  /**
   * Obsługa zmiany filtra pozycji
   */
  const handlePositionChange = (value: PlayerPosition | "") => {
    onFiltersChange({
      ...filters,
      position: value === "" ? null : value,
    });
  };

  /**
   * Czyszczenie wszystkich filtrów
   */
  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      position: null,
      page: 1, // Reset do pierwszej strony
      limit: filters.limit,
    });
  };

  /**
   * Sprawdzenie czy jakieś filtry są aktywne
   */
  const hasActiveFilters = filters.search.trim() !== "" || filters.position !== null;

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="search-input"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Imię lub nazwisko
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-input"
              type="text"
              placeholder="Szukaj graczy (min. 2 znaki)..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
              aria-label="Wyszukaj graczy"
            />
          </div>
        </div>

        <div className="w-48">
          <PositionSelect value={filters.position || ""} onChange={handlePositionChange} disabled={isLoading} />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="shrink-0"
            aria-label="Wyczyść filtry"
          >
            <X className="h-4 w-4 mr-2" />
            Wyczyść
          </Button>
        )}
      </div>

      {filters.search && filters.search.length === 1 && (
        <p className="text-sm text-muted-foreground">Wpisz przynajmniej 2 znaki aby rozpocząć wyszukiwanie</p>
      )}
    </div>
  );
}
