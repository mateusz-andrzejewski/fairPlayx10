import { forwardRef } from "react";
import { Checkbox } from "./checkbox";

interface RodoCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string[];
}

export const RodoCheckbox = forwardRef<HTMLButtonElement, RodoCheckboxProps>(
  ({ checked, onChange, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            id="consent"
            checked={checked}
            onCheckedChange={(checked) => onChange(checked as boolean)}
            aria-invalid={error && error.length > 0}
            {...props}
          />
          <label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Akceptuję{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              politykę prywatności
            </a>{" "}
            i wyrażam zgodę na przetwarzanie danych osobowych zgodnie z RODO *
          </label>
        </div>
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

RodoCheckbox.displayName = "RodoCheckbox";
