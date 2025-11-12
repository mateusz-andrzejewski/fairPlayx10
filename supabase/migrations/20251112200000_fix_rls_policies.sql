-- Migration: Fix RLS policies
-- Problem: Original policies use auth.jwt() ->> 'role' which doesn't exist in JWT
-- Solution: Use subqueries to fetch user role and ID from users table based on email

-- =============================================
-- 1. DROP AND RECREATE USERS POLICIES
-- =============================================

drop policy if exists users_select_policy on users;
drop policy if exists users_update_policy on users;
drop policy if exists users_delete_policy on users;

-- Users can see their own profile or all profiles if admin
create policy users_select_policy on users
for select using (
  email = auth.jwt() ->> 'email'
  or
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- Users can update their own profile or any profile if admin
create policy users_update_policy on users
for update using (
  email = auth.jwt() ->> 'email'
  or
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- Only admins can delete users
create policy users_delete_policy on users
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- =============================================
-- 2. DROP AND RECREATE PLAYERS POLICIES
-- =============================================

drop policy if exists players_select_policy on players;
drop policy if exists players_insert_policy on players;
drop policy if exists players_update_policy on players;
drop policy if exists players_delete_policy on players;

-- Players visible to authenticated users
create policy players_select_policy on players
for select using (
  deleted_at is null
  and (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) in ('admin', 'organizer', 'player')
);

-- Only admins can insert players
create policy players_insert_policy on players
for insert with check (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- Only admins can update players
create policy players_update_policy on players
for update using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- Only admins can delete players
create policy players_delete_policy on players
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- =============================================
-- 3. DROP AND RECREATE EVENTS POLICIES
-- =============================================

drop policy if exists events_select_policy on events;
drop policy if exists events_insert_policy on events;
drop policy if exists events_update_policy on events;
drop policy if exists events_delete_policy on events;

-- Events visible based on role and status
create policy events_select_policy on events
for select using (
  deleted_at is null
  and (
    (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
    or
    (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'organizer'
    or
    (
      (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'player'
      and status = 'active'
      and (select status from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'approved'
    )
  )
);

-- Admins and organizers can create events
create policy events_insert_policy on events
for insert with check (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) in ('admin', 'organizer')
);

-- Admins can update any event, organizers can update their own
create policy events_update_policy on events
for update using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  (
    (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'organizer'
    and organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins can delete any event, organizers can delete their own
create policy events_delete_policy on events
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  (
    (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'organizer'
    and organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- =============================================
-- 4. DROP AND RECREATE EVENT_SIGNUPS POLICIES
-- =============================================

drop policy if exists event_signups_select_policy on event_signups;
drop policy if exists event_signups_insert_policy on event_signups;
drop policy if exists event_signups_update_policy on event_signups;
drop policy if exists event_signups_delete_policy on event_signups;

-- Signups visible to admins, event organizers, and the player who signed up
create policy event_signups_select_policy on event_signups
for select using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from events e
    where e.id = event_signups.event_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
  or
  (
    (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'player'
    and player_id = (select player_id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins, organizers, and players can create signups
create policy event_signups_insert_policy on event_signups
for insert with check (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) in ('admin', 'organizer', 'player')
);

-- Admins and event organizers can update signups
create policy event_signups_update_policy on event_signups
for update using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from events e
    where e.id = event_signups.event_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins and event organizers can delete signups
create policy event_signups_delete_policy on event_signups
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from events e
    where e.id = event_signups.event_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- =============================================
-- 5. DROP AND RECREATE TEAM_ASSIGNMENTS POLICIES
-- =============================================

drop policy if exists team_assignments_select_policy on team_assignments;
drop policy if exists team_assignments_insert_policy on team_assignments;
drop policy if exists team_assignments_update_policy on team_assignments;
drop policy if exists team_assignments_delete_policy on team_assignments;

-- Team assignments visible to admins and event organizers
create policy team_assignments_select_policy on team_assignments
for select using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins and event organizers can create team assignments
create policy team_assignments_insert_policy on team_assignments
for insert with check (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins and event organizers can update team assignments
create policy team_assignments_update_policy on team_assignments
for update using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- Admins and event organizers can delete team assignments
create policy team_assignments_delete_policy on team_assignments
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
  or
  exists (
    select 1 from event_signups es
    join events e on es.event_id = e.id
    where es.id = team_assignments.signup_id
    and e.organizer_id = (select id from users where email = auth.jwt() ->> 'email' and deleted_at is null)
  )
);

-- =============================================
-- 6. DROP AND RECREATE AUDIT_LOGS POLICIES
-- =============================================

drop policy if exists audit_logs_select_policy on audit_logs;
drop policy if exists audit_logs_insert_policy on audit_logs;

-- Only admins can view audit logs
create policy audit_logs_select_policy on audit_logs
for select using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- Only admins can insert audit logs
create policy audit_logs_insert_policy on audit_logs
for insert with check (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

