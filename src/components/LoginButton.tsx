import { SubmitButton } from "./ui/submit-button";

interface LoginButtonProps {
  disabled?: boolean;
}

function LoginButton({ disabled }: LoginButtonProps) {
  return (
    <SubmitButton disabled={disabled} isLoading={disabled}>
      Zaloguj się
    </SubmitButton>
  );
}

export { LoginButton };
