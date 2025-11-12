import type { SupabaseClient } from "../../db/supabase.client";
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PLAYER_ID, DEV_ADMIN_USER_ID, mockDashboardUser } from "../mocks/dashboardMock";
import type { UserDTO } from "../../types";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number, hours = 18): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

export async function ensureDevDashboardData(supabase: SupabaseClient): Promise<UserDTO> {
  const playersPayload = [
    {
      id: DEV_ADMIN_PLAYER_ID,
      first_name: "Dev",
      last_name: "Administrator",
      position: "midfielder",
      skill_rate: 8,
      date_of_birth: "1995-04-12",
      created_at: daysAgo(210),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 556,
      first_name: "Anna",
      last_name: "Striker",
      position: "forward",
      skill_rate: 9,
      date_of_birth: "1998-08-21",
      created_at: daysAgo(160),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 557,
      first_name: "Bartek",
      last_name: "Keeper",
      position: "goalkeeper",
      skill_rate: 8,
      date_of_birth: "1992-02-10",
      created_at: daysAgo(240),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 558,
      first_name: "Alicja",
      last_name: "Defender",
      position: "defender",
      skill_rate: 7,
      date_of_birth: "1996-06-18",
      created_at: daysAgo(190),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 559,
      first_name: "Michał",
      last_name: "Playmaker",
      position: "midfielder",
      skill_rate: 8,
      date_of_birth: "1994-11-05",
      created_at: daysAgo(175),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ];

  const playersResult = await supabase.from("players").upsert(playersPayload, { onConflict: "id" });
  if (playersResult.error) {
    throw new Error(`Failed to seed dev players: ${playersResult.error.message}`);
  }

  const userPayload = {
    id: DEV_ADMIN_USER_ID,
    email: DEV_ADMIN_EMAIL,
    password_hash: "dev-mode-password",
    first_name: mockDashboardUser.first_name,
    last_name: mockDashboardUser.last_name,
    role: "admin" as const,
    status: "approved" as const,
    player_id: DEV_ADMIN_PLAYER_ID,
    consent_date: daysAgo(45),
    consent_version: "1.0",
    created_at: daysAgo(45),
    updated_at: new Date().toISOString(),
  };

  const upsertUser = await supabase.from("users").upsert(userPayload, { onConflict: "id" });
  if (upsertUser.error) {
    throw new Error(`Failed to seed dev admin user: ${upsertUser.error.message}`);
  }

  try {
    await supabase.from("users").update({ deleted_at: null }).eq("id", DEV_ADMIN_USER_ID);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("deleted_at")) {
      throw new Error(
        `Failed to reset dev admin deletion flag: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const primarySelect = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at, deleted_at")
    .eq("id", DEV_ADMIN_USER_ID)
    .maybeSingle();

  let userData: Partial<UserDTO> | null = null;

  if (primarySelect.error && primarySelect.error.message.includes("deleted_at")) {
    const fallbackSelect = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, status, player_id, created_at, updated_at")
      .eq("id", DEV_ADMIN_USER_ID)
      .maybeSingle();

    if (fallbackSelect.error || !fallbackSelect.data) {
      throw new Error(
        `Failed to fetch dev admin user after seeding: ${fallbackSelect.error?.message ?? "unknown error"}`
      );
    }

    userData = {
      ...fallbackSelect.data,
      deleted_at: null,
    };
  } else if (primarySelect.error || !primarySelect.data) {
    throw new Error(
      `Failed to fetch dev admin user after seeding: ${primarySelect.error?.message ?? "unknown error"}`
    );
  } else {
    userData = {
      ...primarySelect.data,
      deleted_at: (primarySelect.data as Partial<UserDTO>).deleted_at ?? null,
    };
  }

  if (!userData) {
    throw new Error("Failed to resolve dev admin user data after seeding");
  }

  const eventsPayload = [
    {
      id: 301,
      name: "Trening Drużynowy",
      location: "Hala Sportowa",
      event_datetime: daysFromNow(2, 19),
      max_places: 20,
      optional_fee: 0,
      status: "active",
      current_signups_count: 3,
      organizer_id: DEV_ADMIN_USER_ID,
      created_at: daysAgo(14),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 302,
      name: "Sparing Weekendowy",
      location: "Stadion Miejski",
      event_datetime: daysFromNow(5, 11),
      max_places: 22,
      optional_fee: 15,
      status: "active",
      current_signups_count: 2,
      organizer_id: DEV_ADMIN_USER_ID,
      created_at: daysAgo(10),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: 303,
      name: "Turniej FairPlay",
      location: "Centrum Sportowe",
      event_datetime: daysFromNow(12, 10),
      max_places: 32,
      optional_fee: 25,
      status: "active",
      current_signups_count: 1,
      organizer_id: DEV_ADMIN_USER_ID,
      created_at: daysAgo(30),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ];

  const eventsResult = await supabase.from("events").upsert(eventsPayload, { onConflict: "id" });
  if (eventsResult.error) {
    throw new Error(`Failed to seed dev events: ${eventsResult.error.message}`);
  }

  const signupsPayload = [
    {
      id: 2001,
      event_id: 301,
      player_id: DEV_ADMIN_PLAYER_ID,
      signup_timestamp: daysAgo(3),
      status: "confirmed",
      resignation_timestamp: null,
    },
    {
      id: 2002,
      event_id: 301,
      player_id: 556,
      signup_timestamp: daysAgo(4),
      status: "confirmed",
      resignation_timestamp: null,
    },
    {
      id: 2003,
      event_id: 301,
      player_id: 557,
      signup_timestamp: daysAgo(5),
      status: "confirmed",
      resignation_timestamp: null,
    },
    {
      id: 2004,
      event_id: 302,
      player_id: 556,
      signup_timestamp: daysAgo(2),
      status: "confirmed",
      resignation_timestamp: null,
    },
    {
      id: 2005,
      event_id: 302,
      player_id: 558,
      signup_timestamp: daysAgo(2),
      status: "confirmed",
      resignation_timestamp: null,
    },
    {
      id: 2006,
      event_id: 303,
      player_id: 559,
      signup_timestamp: daysAgo(1),
      status: "confirmed",
      resignation_timestamp: null,
    },
  ];

  const signupsResult = await supabase.from("event_signups").upsert(signupsPayload, { onConflict: "id" });
  if (signupsResult.error) {
    throw new Error(`Failed to seed dev event signups: ${signupsResult.error.message}`);
  }

  return userData as UserDTO;
}

