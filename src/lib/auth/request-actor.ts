import type { UserDTO } from "../../types";

export interface RequestActor {
  userId: UserDTO["id"];
  role: UserDTO["role"];
  playerId?: UserDTO["player_id"] | null;
  isDevSession?: boolean;
}

export class UnauthorizedError extends Error {
  constructor(message = "Brak autoryzacji użytkownika") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function toRequestActor(user: UserDTO, options?: { isDevSession?: boolean }): RequestActor {
  return {
    userId: user.id,
    role: user.role,
    playerId: user.player_id,
    isDevSession: options?.isDevSession ?? false,
  };
}

export function requireActor(locals: App.Locals): RequestActor {
  if (locals.actor) {
    return locals.actor;
  }
  throw new UnauthorizedError();
}

export function requireUser(locals: App.Locals): UserDTO {
  if (locals.user) {
    return locals.user;
  }
  throw new UnauthorizedError("Brak danych użytkownika w kontekście");
}

