-- Migration: Update RLS policy for team_assignments to allow players to view their event teams
-- Purpose: Allow players to see team assignments for events they are signed up for
-- Affected tables: team_assignments
-- Special considerations: Players can only see assignments for events they participate in

-- =============================================
-- 1. DROP EXISTING SELECT POLICY
-- =============================================

DROP POLICY IF EXISTS team_assignments_select_policy ON team_assignments;

-- =============================================
-- 2. CREATE NEW SELECT POLICY WITH PLAYER ACCESS
-- =============================================

-- Policy for team_assignments: admin and event organizer can see all, players can see their event assignments
CREATE POLICY team_assignments_select_policy ON team_assignments
FOR SELECT USING (
  auth.jwt() ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM event_signups es
    JOIN events e ON es.event_id = e.id
    WHERE es.id = team_assignments.signup_id
    AND e.organizer_id = (auth.jwt() ->> 'sub')::integer
  ) OR
  -- Players can see team assignments for events they are signed up for
  (
    auth.jwt() ->> 'role' = 'player' AND
    EXISTS (
      SELECT 1 FROM event_signups es1
      JOIN event_signups es2 ON es1.event_id = es2.event_id
      JOIN users u ON u.player_id = es2.player_id
      WHERE es1.id = team_assignments.signup_id
      AND u.id = (auth.jwt() ->> 'sub')::integer
      AND es2.status = 'confirmed'
    )
  )
);

COMMENT ON POLICY team_assignments_select_policy ON team_assignments IS 
'Allows admins full access, organizers to see their event assignments, and players to see assignments for events they participate in';

