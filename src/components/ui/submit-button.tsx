import { forwardRef } from "react";
import { Button } from "./button";

interface SubmitButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ disabled = false, isLoading = false, children, ...props }, ref) => {
    return (
      <Button ref={ref} type="submit" disabled={disabled || isLoading} className="w-full" {...props}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Wysyłanie...
          </div>
        ) : (
          children
        )}
      </Button>
    );
  }
);

SubmitButton.displayName = "SubmitButton";


