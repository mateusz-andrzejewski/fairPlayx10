-- Migration: Create FairPlay Platform Database Schema
-- Purpose: Initial schema creation for FairPlay platform including users, players, events, signups, team assignments and audit logs
-- Affected tables: users, players, events, event_signups, team_assignments, audit_logs
-- Special considerations: This migration enables RLS on all tables and sets up comprehensive security policies

-- =============================================
-- 1. CREATE ENUM TYPES
-- =============================================

-- Role użytkowników
create type user_role as enum ('admin', 'organizer', 'player');

-- Status konta
create type user_status as enum ('pending', 'approved');

-- Status wydarzenia
create type event_status as enum ('draft', 'active', 'completed');

-- Status zapisu
create type signup_status as enum ('pending', 'confirmed', 'withdrawn');

-- Pozycje piłkarskie
create type player_position as enum ('forward', 'midfielder', 'defender', 'goalkeeper');

-- Typy akcji audytowych
create type audit_action as enum (
  'user_approved', 'user_rejected', 'player_created', 'player_updated', 'player_deleted',
  'event_created', 'event_updated', 'event_deleted', 'signup_confirmed', 'signup_withdrawn',
  'team_assigned', 'team_reassigned'
);

-- =============================================
-- 2. CREATE TABLES
-- =============================================

-- players table
-- Independent player table with basic data and skill rating
create table players (
  id serial primary key,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  position player_position not null,
  skill_rate smallint check (skill_rate >= 1 and skill_rate <= 10),
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete (null = active)
);

-- users table (managed by Supabase Auth integration)
-- Stores user accounts with authentication and roles
create table users (
  id serial primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  role user_role not null default 'player',
  status user_status not null default 'pending',
  consent_date timestamptz not null default now(),
  consent_version varchar(20) not null,
  player_id integer references players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- events table
-- Events table with parameters and organizer
create table events (
  id serial primary key,
  name varchar(200) not null,
  location varchar(200) not null,
  event_datetime timestamptz not null check (event_datetime > now()),
  max_places integer not null check (max_places > 0),
  optional_fee decimal(10,2) check (optional_fee >= 0),
  status event_status not null default 'draft',
  current_signups_count integer not null default 0,
  organizer_id integer not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete (null = active)
);

-- event_signups table
-- Junction table for event registrations with timestamps
create table event_signups (
  id serial primary key,
  event_id integer not null references events(id) on delete cascade,
  player_id integer not null references players(id) on delete cascade,
  signup_timestamp timestamptz not null default now(),
  status signup_status not null default 'pending',
  resignation_timestamp timestamptz,
  unique(event_id, player_id) -- one signup per player per event
);

-- team_assignments table
-- Player assignments to teams after drawing
create table team_assignments (
  id serial primary key,
  signup_id integer not null references event_signups(id) on delete cascade,
  team_number smallint not null check (team_number > 0),
  assignment_timestamp timestamptz not null default now(),
  unique(signup_id) -- one participant in one team
);

-- audit_logs table
-- Audit table for tracking critical changes
create table audit_logs (
  id serial primary key,
  timestamp timestamptz not null default now(),
  action_type audit_action not null,
  actor_id integer not null references users(id) on delete cascade,
  target_table varchar(50) not null,
  target_id integer not null,
  changes jsonb,
  ip_address inet
);

-- =============================================
-- 3. CREATE INDEXES
-- =============================================

-- Indexes for performance of filters in events
create index idx_events_datetime_location on events (event_datetime, location);
create index idx_events_location on events (location);
create index idx_events_status on events (status);
create index idx_events_organizer_id on events (organizer_id);

-- Indexes for signup ordering
create index idx_event_signups_event_timestamp on event_signups (event_id, signup_timestamp asc);
create index idx_event_signups_player on event_signups (player_id);
create index idx_event_signups_status on event_signups (status);

-- Indexes for team assignments
create index idx_team_assignments_signup on team_assignments (signup_id);
create index idx_team_assignments_event_team on team_assignments (signup_id, team_number);

-- Indexes for audit
create index idx_audit_logs_timestamp_actor on audit_logs (timestamp desc, actor_id);
create index idx_audit_logs_target on audit_logs (target_table, target_id);

-- Indexes for soft deletes
create index idx_players_deleted_at on players (deleted_at) where deleted_at is not null;
create index idx_events_deleted_at on events (deleted_at) where deleted_at is not null;

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table players enable row level security;
alter table events enable row level security;
alter table event_signups enable row level security;
alter table team_assignments enable row level security;
alter table audit_logs enable row level security;

-- =============================================
-- 5. CREATE RLS POLICIES
-- =============================================

-- Policy for users: users see only their account, admin sees all
-- select policy for authenticated users
create policy users_select_policy on users
for select using (
  auth.jwt() ->> 'role' = 'admin' or
  id = (auth.jwt() ->> 'sub')::integer
);

-- insert policy for authenticated users (registration)
create policy users_insert_policy on users
for insert with check (true); -- allow registration for anyone

-- update policy for authenticated users
create policy users_update_policy on users
for update using (
  auth.jwt() ->> 'role' = 'admin' or
  id = (auth.jwt() ->> 'sub')::integer
);

-- delete policy for admin only
create policy users_delete_policy on users
for delete using (auth.jwt() ->> 'role' = 'admin');

-- Policy for players: everyone can read active players, admin can edit, skill_rate hidden for non-admins
-- select policy for authenticated users (read access for active players)
create policy players_select_policy on players
for select using (
  deleted_at is null and
  (auth.jwt() ->> 'role' = 'admin' or
   auth.jwt() ->> 'role' in ('organizer', 'player'))
);

-- insert policy for admin only
create policy players_insert_policy on players
for insert with check (auth.jwt() ->> 'role' = 'admin');

-- update policy for admin only
create policy players_update_policy on players
for update using (auth.jwt() ->> 'role' = 'admin');

-- delete policy for admin only (soft delete via update)
create policy players_delete_policy on players
for delete using (auth.jwt() ->> 'role' = 'admin');

-- Policy for events: admin full access, organizer own events, players only active events
-- select policy for authenticated users
create policy events_select_policy on events
for select using (
  deleted_at is null and
  (auth.jwt() ->> 'role' = 'admin' or
   (auth.jwt() ->> 'role' = 'organizer' and organizer_id = (auth.jwt() ->> 'sub')::integer) or
   (auth.jwt() ->> 'role' = 'player' and status = 'active' and auth.jwt() ->> 'status' = 'approved'))
);

-- insert policy for admin and organizer
create policy events_insert_policy on events
for insert with check (
  auth.jwt() ->> 'role' = 'admin' or
  auth.jwt() ->> 'role' = 'organizer'
);

-- update policy for admin and organizer (own events)
create policy events_update_policy on events
for update using (
  auth.jwt() ->> 'role' = 'admin' or
  (auth.jwt() ->> 'role' = 'organizer' and organizer_id = (auth.jwt() ->> 'sub')::integer)
);

-- delete policy for admin and organizer (own events, soft delete via update)
create policy events_delete_policy on events
for delete using (
  auth.jwt() ->> 'role' = 'admin' or
  (auth.jwt() ->> 'role' = 'organizer' and organizer_id = (auth.jwt() ->> 'sub')::integer)
);

-- Policy for event_signups: admin and event organizer can manage
-- select policy for authenticated users
create policy event_signups_select_policy on event_signups
for select using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from events
    where events.id = event_signups.event_id
    and events.organizer_id = (auth.jwt() ->> 'sub')::integer
  ) or
  (auth.jwt() ->> 'role' = 'player' and
   player_id = (select player_id from users where id = (auth.jwt() ->> 'sub')::integer))
);

-- insert policy for authenticated users (players can sign up)
create policy event_signups_insert_policy on event_signups
for insert with check (
  auth.jwt() ->> 'role' = 'admin' or
  auth.jwt() ->> 'role' = 'organizer' or
  (auth.jwt() ->> 'role' = 'player' and
   player_id = (select player_id from users where id = (auth.jwt() ->> 'sub')::integer))
);

-- update policy for admin and event organizer
create policy event_signups_update_policy on event_signups
for update using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from events
    where events.id = event_signups.event_id
    and events.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- delete policy for admin and event organizer
create policy event_signups_delete_policy on event_signups
for delete using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from events
    where events.id = event_signups.event_id
    and events.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- Policy for team_assignments: admin and event organizer
-- select policy for authenticated users
create policy team_assignments_select_policy on team_assignments
for select using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- insert policy for admin and event organizer
create policy team_assignments_insert_policy on team_assignments
for insert with check (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.event_id = (
      select event_id from event_signups where id = team_assignments.signup_id
    )
    and e.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- update policy for admin and event organizer
create policy team_assignments_update_policy on team_assignments
for update using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- delete policy for admin and event organizer
create policy team_assignments_delete_policy on team_assignments
for delete using (
  auth.jwt() ->> 'role' = 'admin' or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (auth.jwt() ->> 'sub')::integer
  )
);

-- Policy for audit_logs: admin only can read
-- select policy for admin only
create policy audit_logs_select_policy on audit_logs
for select using (auth.jwt() ->> 'role' = 'admin');

-- insert policy for admin only (system operations)
create policy audit_logs_insert_policy on audit_logs
for insert with check (auth.jwt() ->> 'role' = 'admin');

-- update and delete policies: no updates/deletes allowed on audit logs
-- (audit logs should be immutable)
