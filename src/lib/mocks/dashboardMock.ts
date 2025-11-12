import type { UserDTO } from "../../types";

const now = new Date();

export const DEV_ADMIN_USER_ID = 9999;
export const DEV_ADMIN_PLAYER_ID = 555;
export const DEV_ADMIN_EMAIL = "dev.admin@fairplay.local";

export const mockDashboardUser: UserDTO = {
  id: DEV_ADMIN_USER_ID,
  email: DEV_ADMIN_EMAIL,
  first_name: "Dev",
  last_name: "Administrator",
  role: "admin",
  status: "approved",
  player_id: DEV_ADMIN_PLAYER_ID,
  created_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: now.toISOString(),
  deleted_at: null,
};
