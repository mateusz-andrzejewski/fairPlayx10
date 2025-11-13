import { forwardRef } from "react";
import { Input } from "./input";

interface LastNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
}

export const LastNameInput = forwardRef<HTMLInputElement, LastNameInputProps>(
  ({ value, onChange, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor="last_name"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Nazwisko *
        </label>
        <Input
          ref={ref}
          id="last_name"
          type="text"
          placeholder="Kowalski"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error && error.length > 0}
          data-test-id="last-name-input"
          {...props}
        />
        {error && error.length > 0 && (
          <div className="text-sm text-destructive" data-test-id="last-name-error">
            {error.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

LastNameInput.displayName = "LastNameInput";
