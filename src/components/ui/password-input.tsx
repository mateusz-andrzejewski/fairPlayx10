import { forwardRef } from "react";
import { Input } from "./input";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Hasło *
        </label>
        <Input
          ref={ref}
          id="password"
          type="password"
          placeholder="Minimum 8 znaków, zawiera cyfrę i wielką literę"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error && error.length > 0}
          {...props}
        />
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

PasswordInput.displayName = "PasswordInput";

