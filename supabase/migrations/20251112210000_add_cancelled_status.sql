-- Migration: Add 'cancelled' status to event_status enum
-- Purpose: Allow admins and organizers to cancel events before they occur
-- Date: 2025-11-12

-- Add 'cancelled' to event_status enum
-- Note: PostgreSQL doesn't support direct ALTER TYPE ... ADD VALUE in transactions,
-- but it works outside transactions. Supabase migrations handle this automatically.

ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Update the comment on events table to reflect the new status
COMMENT ON COLUMN events.status IS 'Event status: draft (being prepared), active (open for signups), completed (past event date), cancelled (manually cancelled by admin/organizer)';

-- Note: Existing RLS policies remain unchanged. They already support the new status:
-- - Admins and organizers: can see events in ALL statuses (including cancelled)
-- - Players: can see only 'active' events (cancelled and completed events are hidden)
-- This is the desired behavior - cancelled events should be visible only to admins and organizers.

