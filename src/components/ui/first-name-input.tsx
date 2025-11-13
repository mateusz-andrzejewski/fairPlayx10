import { forwardRef } from "react";
import { Input } from "./input";

interface FirstNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
}

export const FirstNameInput = forwardRef<HTMLInputElement, FirstNameInputProps>(
  ({ value, onChange, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor="first_name"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Imię *
        </label>
        <Input
          ref={ref}
          id="first_name"
          type="text"
          placeholder="Jan"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error && error.length > 0}
          data-test-id="first-name-input"
          {...props}
        />
        {error && error.length > 0 && (
          <div className="text-sm text-destructive" data-test-id="first-name-error">
            {error.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FirstNameInput.displayName = "FirstNameInput";
