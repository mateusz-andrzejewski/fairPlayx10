import type { EventSignupDTO, PaginationMetaDTO, SignupStatus, PlayerPosition } from "./types";

/**
 * EVENT SIGNUPS VIEW MODELS
 */

// Rozszerzenie istniejącego typu dla listy zapisów z paginacją
export interface EventSignupsListDTO {
  data: EventSignupDTO[];
  pagination: PaginationMetaDTO;
}

// Nowy typ dla karty zapisu, łączący dane zapisu z informacjami gracza
export interface SignupCardViewModel {
  id: number;
  player: {
    id: number;
    name: string;
    position: PlayerPosition;
  };
  status: SignupStatus;
  signupTimestamp: string;
  canEdit: boolean; // flaga uprawnień edycji, obliczana na podstawie roli
}

// Nowy typ dla danych formularza dodawania gracza
export interface AddPlayerFormData {
  playerIds: number[];
}

// Nowy typ dla danych akcji wymagających potwierdzenia
export interface ConfirmActionData {
  action: "withdraw" | "updateStatus";
  signupId: number;
  newStatus?: SignupStatus; // opcjonalne dla akcji updateStatus
}

// Nowy typ union dla akcji z kart
export type SignupAction =
  | { type: "updateStatus"; signupId: number; newStatus: SignupStatus }
  | { type: "withdraw"; signupId: number };

// Stan zarządzania zapisami na wydarzenie
export interface EventSignupsState {
  signups: SignupCardViewModel[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMetaDTO;
  modals: {
    addPlayerOpen: boolean;
    confirmOpen: boolean;
    confirmData: ConfirmActionData | null;
  };
}

// Dane graczy dostępne do dodania
export interface AvailablePlayerDTO {
  id: number;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
}
