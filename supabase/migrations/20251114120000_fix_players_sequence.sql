-- Migration: Fix players table sequence after manual inserts
-- Problem: When seed data inserts players with explicit IDs, the sequence is not updated
-- This causes duplicate key violations when trying to insert new players
-- Solution: Reset the sequence to the maximum ID + 1

-- Reset the sequence for players table to avoid duplicate key violations
SELECT setval('players_id_seq', COALESCE((SELECT MAX(id) FROM players), 0) + 1, false);

