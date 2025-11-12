-- Migration: Add preferred_team_count to events table
-- Description: Adds a column to store the preferred number of teams for team draw

-- Add preferred_team_count column to events table
ALTER TABLE events
ADD COLUMN preferred_team_count INTEGER;

-- Add check constraint: preferred_team_count must be between 2 and 10
ALTER TABLE events
ADD CONSTRAINT events_preferred_team_count_check 
CHECK (preferred_team_count IS NULL OR (preferred_team_count >= 2 AND preferred_team_count <= 10));

-- Add comment to document the column
COMMENT ON COLUMN events.preferred_team_count IS 
'Preferowana liczba drużyn do losowania. Pole obowiązkowe przy tworzeniu wydarzenia. Wartość 2-10.';

