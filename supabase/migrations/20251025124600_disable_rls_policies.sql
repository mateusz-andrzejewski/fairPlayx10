-- Migration: Disable RLS Policies
-- Purpose: Remove all Row Level Security policies from FairPlay database tables
-- Affected tables: users, players, events, event_signups, team_assignments, audit_logs
-- Special considerations: This migration removes all security policies, making tables accessible based on database-level permissions only

-- =============================================
-- DROP ALL RLS POLICIES
-- =============================================

-- Drop policies for users table
drop policy if exists users_select_policy on users;
drop policy if exists users_insert_policy on users;
drop policy if exists users_update_policy on users;
drop policy if exists users_delete_policy on users;

-- Drop policies for players table
drop policy if exists players_select_policy on players;
drop policy if exists players_insert_policy on players;
drop policy if exists players_update_policy on players;
drop policy if exists players_delete_policy on players;

-- Drop policies for events table
drop policy if exists events_select_policy on events;
drop policy if exists events_insert_policy on events;
drop policy if exists events_update_policy on events;
drop policy if exists events_delete_policy on events;

-- Drop policies for event_signups table
drop policy if exists event_signups_select_policy on event_signups;
drop policy if exists event_signups_insert_policy on event_signups;
drop policy if exists event_signups_update_policy on event_signups;
drop policy if exists event_signups_delete_policy on event_signups;

-- Drop policies for team_assignments table
drop policy if exists team_assignments_select_policy on team_assignments;
drop policy if exists team_assignments_insert_policy on team_assignments;
drop policy if exists team_assignments_update_policy on team_assignments;
drop policy if exists team_assignments_delete_policy on team_assignments;

-- Drop policies for audit_logs table
drop policy if exists audit_logs_select_policy on audit_logs;
drop policy if exists audit_logs_insert_policy on audit_logs;

alter table users disable row level security;
alter table players disable row level security;
alter table events disable row level security;
alter table event_signups disable row level security;
alter table team_assignments disable row level security;
alter table audit_logs disable row level security;
