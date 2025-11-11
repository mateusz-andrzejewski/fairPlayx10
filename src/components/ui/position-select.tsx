import { forwardRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import type { PlayerPosition } from "../../types";

interface PositionSelectProps {
  value: PlayerPosition | "";
  onChange: (value: PlayerPosition | "") => void;
  error?: string[];
}

const positionOptions: { value: PlayerPosition; label: string }[] = [
  { value: "forward", label: "Napastnik" },
  { value: "midfielder", label: "Pomocnik" },
  { value: "defender", label: "Obrońca" },
  { value: "goalkeeper", label: "Bramkarz" },
];

export const PositionSelect = forwardRef<HTMLButtonElement, PositionSelectProps>(
  ({ value, onChange, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor="position"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Pozycja piłkarska *
        </label>
        <Select value={value} onValueChange={(val) => onChange(val as PlayerPosition)}>
          <SelectTrigger ref={ref} id="position" aria-invalid={error && error.length > 0} {...props}>
            <SelectValue placeholder="Wybierz pozycję" />
          </SelectTrigger>
          <SelectContent>
            {positionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && error.length > 0 && (
          <div className="text-sm text-destructive">
            {error.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PositionSelect.displayName = "PositionSelect";

