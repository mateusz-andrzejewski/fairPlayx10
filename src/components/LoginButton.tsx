import { SubmitButton } from "./ui/submit-button";

interface LoginButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

function LoginButton({ disabled, isLoading }: LoginButtonProps) {
  return (
    <SubmitButton disabled={disabled} isLoading={isLoading}>
      Zaloguj się
    </SubmitButton>
  );
}

export { LoginButton };
