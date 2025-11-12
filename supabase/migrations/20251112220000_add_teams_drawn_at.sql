-- Migration: Add teams_drawn_at to events table
-- Purpose: Track when team assignments were confirmed for an event
-- Date: 2025-11-12

-- Add teams_drawn_at column to events table
ALTER TABLE events 
ADD COLUMN teams_drawn_at timestamptz;

-- Add comment
COMMENT ON COLUMN events.teams_drawn_at IS 'Timestamp when team assignments were confirmed and saved. NULL means teams have not been drawn yet.';

-- Create index for querying events with confirmed teams
CREATE INDEX idx_events_teams_drawn_at ON events(teams_drawn_at) WHERE teams_drawn_at IS NOT NULL;

COMMENT ON INDEX idx_events_teams_drawn_at IS 'Index for efficiently querying events with confirmed team assignments';

