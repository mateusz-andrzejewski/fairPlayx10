-- Migration: Add 'team_draw' to audit_action enum
-- Purpose: Allow logging of team draw operations in audit_logs
-- Date: 2025-11-12

-- Add 'team_draw' to audit_action enum
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'team_draw';

-- Add comment
COMMENT ON TYPE audit_action IS 'Audit log action types including user management, player management, event management, signups, team assignments, and team draw operations';

