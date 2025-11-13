import { forwardRef } from "react";
import { Input } from "./input";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(({ value, onChange, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Adres email *
      </label>
      <Input
        ref={ref}
        id="email"
        type="email"
        placeholder="twoj.email@przyklad.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error && error.length > 0}
        data-test-id="email-input"
        {...props}
      />
      {error && error.length > 0 && (
        <div className="text-sm text-destructive" data-test-id="email-error">
          {error.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      )}
    </div>
  );
});

EmailInput.displayName = "EmailInput";
