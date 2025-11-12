-- Migration: Add team colors to team assignments
-- Purpose: Add team_color column to team_assignments table for jersey color identification
-- Affected tables: team_assignments
-- Special considerations: Default colors assigned to existing assignments

-- =============================================
-- 1. CREATE ENUM TYPE FOR TEAM COLORS
-- =============================================

-- Kolory koszulek drużyn
CREATE TYPE team_color AS ENUM ('black', 'white', 'red', 'blue');

COMMENT ON TYPE team_color IS 'Available jersey colors for team assignments';

-- =============================================
-- 2. ADD COLUMN TO team_assignments
-- =============================================

-- Dodaj kolumnę team_color do tabeli team_assignments
ALTER TABLE team_assignments
ADD COLUMN team_color team_color NOT NULL DEFAULT 'black';

COMMENT ON COLUMN team_assignments.team_color IS 'Jersey color assigned to the team for easy identification during the match';

-- =============================================
-- 3. CREATE INDEX FOR FILTERING BY COLOR
-- =============================================

CREATE INDEX idx_team_assignments_team_color ON team_assignments(team_color);

COMMENT ON INDEX idx_team_assignments_team_color IS 'Index for filtering team assignments by jersey color';

-- =============================================
-- 4. UPDATE EXISTING DATA WITH ALTERNATING COLORS
-- =============================================

-- Przypisz kolory do istniejących przypisań na podstawie team_number
-- Team 1 -> black, Team 2 -> white, Team 3 -> red, Team 4 -> blue, potem cyklicznie
WITH color_mapping AS (
  SELECT 
    id,
    CASE 
      WHEN MOD(team_number - 1, 4) = 0 THEN 'black'::team_color
      WHEN MOD(team_number - 1, 4) = 1 THEN 'white'::team_color
      WHEN MOD(team_number - 1, 4) = 2 THEN 'red'::team_color
      ELSE 'blue'::team_color
    END AS color
  FROM team_assignments
)
UPDATE team_assignments
SET team_color = color_mapping.color
FROM color_mapping
WHERE team_assignments.id = color_mapping.id;

