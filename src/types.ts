import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

/**
 * Narrowed row helpers extracted from generated Supabase types.
 * They keep DTOs linked to the underlying database schema while
 * allowing us to reshape data for transport.
 */
type UserRow = Tables<"users">;
type PlayerRow = Tables<"players">;
type EventRow = Tables<"events">;
type EventSignupRow = Tables<"event_signups">;
type TeamAssignmentRow = Tables<"team_assignments">;

type UserInsert = TablesInsert<"users">;
type PlayerInsert = TablesInsert<"players">;
type PlayerUpdate = TablesUpdate<"players">;
type EventInsert = TablesInsert<"events">;
type EventUpdate = TablesUpdate<"events">;
type EventSignupInsert = TablesInsert<"event_signups">;
type EventSignupUpdate = TablesUpdate<"event_signups">;

export type UserRole = Enums<"user_role">;
export type UserStatus = Enums<"user_status">;
export type PlayerPosition = Enums<"player_position">;
export type SignupStatus = Enums<"signup_status">;
export type EventStatus = Enums<"event_status">;
export type TeamColor = Enums<"team_color">;

/**
 * Shared pagination envelope used by multiple list endpoints.
 */
export interface PaginationMetaDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedDataDTO<T> {
  data: T[];
  pagination: PaginationMetaDTO;
}

/**
 * USERS
 */
export type UserDTO = Pick<
  UserRow,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "role"
  | "status"
  | "player_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export interface ListUsersQueryParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
}

export type UsersListResponseDTO = PaginatedDataDTO<UserDTO>;

export interface SoftDeleteUserResult {
  deleted: boolean;
  userId: number;
}

export interface ApproveUserResult {
  approved: boolean;
  userId: number;
  previousStatus: UserStatus;
  newStatus: UserStatus;
}

export interface ApproveUserCommand {
  role: UserRole;
  /**
   * Optional player linkage:
   * - If provided (number): link to existing player
   * - If null/undefined with create_player: create new player
   * - If null/undefined without create_player: user without player profile
   */
  player_id?: number | null;
  /**
   * If true and no player_id provided, create a new player profile
   */
  create_player?: boolean;
}

export interface CreateUserCommand {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  consent_date: Date;
  consent_version: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition | "";
  consent: boolean;
}

export interface RegisterFormErrors {
  email: string[];
  password: string[];
  first_name: string[];
  last_name: string[];
  position: string[];
  consent: string[];
}

/**
 * PLAYERS
 */
export type PlayerDTO = Pick<
  PlayerRow,
  "id" | "first_name" | "last_name" | "position" | "skill_rate" | "date_of_birth" | "created_at" | "updated_at"
>;

export interface ListPlayersQueryParams {
  page?: number;
  limit?: number;
  position?: PlayerPosition;
  search?: string;
  include_skill_rate?: boolean;
}

export type PlayersListResponseDTO = PaginatedDataDTO<PlayerDTO>;

export type CreatePlayerCommand = Pick<
  PlayerInsert,
  "first_name" | "last_name" | "position" | "skill_rate" | "date_of_birth"
>;

export type UpdatePlayerCommand = Partial<
  Pick<PlayerUpdate, "first_name" | "last_name" | "position" | "skill_rate" | "date_of_birth">
>;

/**
 * EVENTS
 */
export type EventDTO = Pick<
  EventRow,
  | "id"
  | "name"
  | "location"
  | "event_datetime"
  | "max_places"
  | "optional_fee"
  | "status"
  | "current_signups_count"
  | "organizer_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "teams_drawn_at"
  | "preferred_team_count"
>;

export interface EventSignupExtendedDTO extends EventSignupDTO {
  player?: Pick<PlayerDTO, "id" | "first_name" | "last_name" | "position" | "skill_rate"> | null;
}

export type EventDetailDTO = EventDTO & {
  signups: EventSignupExtendedDTO[];
};

export interface ListEventsQueryParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  location?: string;
  date_from?: string;
  date_to?: string;
  organizer_id?: EventRow["organizer_id"];
}

export type EventsListResponseDTO = PaginatedDataDTO<EventDTO>;

export type CreateEventCommand = Pick<
  EventInsert,
  "name" | "location" | "event_datetime" | "max_places" | "optional_fee" | "preferred_team_count"
>;

export type UpdateEventCommand = Partial<
  Pick<EventUpdate, "name" | "location" | "event_datetime" | "max_places" | "optional_fee" | "status" | "deleted_at" | "preferred_team_count">
>;

/**
 * EVENT SIGNUPS
 */
export type EventSignupDTO = Pick<
  EventSignupRow,
  "id" | "event_id" | "player_id" | "signup_timestamp" | "status" | "resignation_timestamp"
>;

export interface ListEventSignupsQueryParams {
  page?: number;
  limit?: number;
  status?: SignupStatus;
}

export type EventSignupsListResponseDTO = PaginatedDataDTO<EventSignupDTO>;

export type CreateEventSignupCommand = Pick<EventSignupInsert, "player_id">;

export type UpdateEventSignupCommand = Pick<EventSignupUpdate, "status">;

/**
 * TEAM ASSIGNMENTS & DRAWS
 */
export interface TeamAssignmentDTO {
  id: TeamAssignmentRow["id"];
  signup_id: TeamAssignmentRow["signup_id"];
  team_number: TeamAssignmentRow["team_number"];
  team_color: TeamColor;
  assignment_timestamp: TeamAssignmentRow["assignment_timestamp"];
  player_id: PlayerRow["id"] | null;
  player: {
    id: PlayerRow["id"];
    first_name: PlayerRow["first_name"];
    last_name: PlayerRow["last_name"];
    position: PlayerRow["position"];
    skill_rate: PlayerRow["skill_rate"] | null; // Can be null for non-admin viewers
  } | null;
}

export interface TeamAssignmentsListResponseDTO {
  data: TeamAssignmentDTO[];
}

export type ManualTeamAssignmentEntry = {
  signup_id: TeamAssignmentRow["signup_id"];
  team_number: TeamAssignmentRow["team_number"];
  team_color: TeamColor;
};

export interface CreateTeamAssignmentsCommand {
  assignments: ManualTeamAssignmentEntry[];
}

export interface RunTeamDrawCommand {
  iterations?: number;
  balance_threshold?: number;
  team_count?: number; // Docelowa liczba drużyn do utworzenia (opcjonalna, domyślnie z wydarzenia)
}

/**
 * Representation of draw output players. The derived name is built
 * from player entity fields at runtime, hence the standalone string.
 */
export interface TeamDrawPlayerDTO {
  signup_id?: EventSignupRow["id"];
  player_id: PlayerRow["id"];
  player_name: string;
  position: PlayerRow["position"];
  skill_rate: PlayerRow["skill_rate"];
}

export interface TeamDrawStatsDTO {
  avg_skill_rate: number;
  positions: Partial<Record<PlayerPosition, number>>;
}

export interface TeamDrawTeamDTO {
  team_number: TeamAssignmentRow["team_number"];
  team_color: TeamColor;
  players: TeamDrawPlayerDTO[];
  stats: TeamDrawStatsDTO;
}

export interface TeamDrawResultDTO {
  success: boolean;
  teams: TeamDrawTeamDTO[];
  balance_achieved: boolean;
}

/**
 * DASHBOARD
 */
export interface DashboardDTO {
  user: UserDTO;
  upcoming_events: EventDTO[];
  my_signups: EventSignupDTO[];
  organized_events: EventDTO[];
  pending_users?: number;
}

export interface NotificationDTO {
  id: number;
  type: string;
  message: string;
  actionUrl: string;
}

export interface DashboardViewModel {
  currentUser: UserDTO;
  nearestEvent: EventDTO | null;
  upcomingEvents: EventDTO[];
  notifications: NotificationDTO[];
  managementData: { users: UserDTO[]; events: EventDTO[]; players: PlayerDTO[] } | null;
}

/**
 * AUTHENTICATION
 */
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
  expiresIn: number;
}

export type AuthErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "PENDING_APPROVAL"
  | "ACCOUNT_DISABLED"
  | "INVALID_TOKEN"
  | "PASSWORD_MISMATCH"
  | "INTERNAL_ERROR";

export interface AuthErrorResponse {
  success: false;
  error: AuthErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface LoginSuccessResponse {
  success: true;
  message: string;
  user: UserDTO;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSessionDTO {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type?: string;
}

export interface LoginViewModel {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    status: UserStatus;
  };
}

/**
 * PLAYERS VIEW MODELS
 */

// Rozszerzony DTO gracza dla widoku listy
export interface PlayerListItemVM extends PlayerDTO {
  fullName: string; // Obliczone: `${first_name} ${last_name}`
  canEditSkillRate: boolean; // Na podstawie roli użytkownika
  canDelete: boolean; // Na podstawie roli użytkownika
}

// Model formularza gracza
export interface PlayerFormVM {
  id?: number; // null dla tworzenia, number dla edycji
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  skill_rate: number | null; // null jeśli nie admin
  date_of_birth: string | null;
  isEditing: boolean;
  canEditSkillRate: boolean;
}

// Stan filtrów wyszukiwania
export interface SearchFiltersVM {
  search: string;
  position: PlayerPosition | null;
  page: number;
  limit: number;
}

/**
 * EVENTS VIEW MODELS
 */

// Rozszerzony DTO wydarzenia dla karty na liście
export interface EventCardViewModel extends EventDTO {
  isFull: boolean; // czy wszystkie miejsca zajęte
  canSignup: boolean; // czy użytkownik może się zapisać
  daysUntilEvent: number; // dni do wydarzenia
  formattedDate: string; // sformatowana data
  formattedTime: string; // sformatowany czas
}

// Rozszerzony DTO szczegółów wydarzenia
export interface EventDetailsViewModel extends EventDetailDTO {
  isOrganizer: boolean; // czy użytkownik jest organizatorem
  isSignedUp: boolean; // czy użytkownik jest zapisany
  canManageSignups: boolean; // czy użytkownik może zarządzać zapisami
  signupsWithNames: EventSignupWithNameViewModel[]; // zapisy z nazwami graczy
}

// Rozszerzony DTO zapisu z nazwą gracza
export interface EventSignupWithNameViewModel extends EventSignupDTO {
  playerName: string; // imię i nazwisko gracza
  position?: PlayerPosition; // pozycja gracza
  skillRate?: number; // skill rate - tylko dla organizatora/admina
}

// Parametry filtrów wydarzeń
export interface EventFiltersViewModel {
  page?: number;
  limit?: number;
  status?: EventStatus;
  location?: string;
  date_from?: string;
  date_to?: string;
  organizer_id?: number;
  search?: string;
}

// Stan formularza wydarzenia
export interface EventFormViewModel {
  id?: number; // null dla tworzenia, number dla edycji
  name: string;
  location: string;
  event_datetime: string;
  max_places: number;
  optional_fee?: number;
  isSubmitting: boolean;
  errors: EventFormErrors;
}

// Błędy formularza wydarzenia
export interface EventFormErrors {
  name: string[];
  location: string[];
  event_datetime: string[];
  max_places: string[];
  optional_fee: string[];
}

/**
 * TEAM DRAW VIEW MODELS
 */

// Model widoku losowania drużyn
export interface DrawTeamsViewModel {
  eventId: number;
  teams: TeamViewModel[];
  isLoading: boolean;
  error: string | null;
  balanceAchieved: boolean;
}

// Model drużyny w widoku losowania
export interface TeamViewModel {
  teamNumber: number;
  teamColor: TeamColor;
  players: PlayerViewModel[];
  avgSkillRate: number; // średnia ocena umiejętności
  positions: Record<string, number>; // obiekt z kluczami pozycji (np. "forward": 5)
}

// Model gracza w widoku losowania drużyn
export interface PlayerViewModel {
  signupId: number;
  playerId: number | null;
  name: string;
  position: string;
  skillRate: number | null; // widoczny tylko dla admina (null dla innych)
}
