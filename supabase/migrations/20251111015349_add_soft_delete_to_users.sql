-- Migration: Add Soft Delete to Users Table
-- Purpose: Enable soft deletion of user accounts with audit logging
-- Affected tables: users, audit_logs (enum extension)
-- Special considerations: Updates RLS policies to hide deleted users, adds partial index for performance

-- =============================================
-- 1. EXTEND AUDIT_ACTION ENUM
-- =============================================

-- Add 'user_deleted' to audit_action enum for soft delete tracking
alter type audit_action add value 'user_deleted';

-- =============================================
-- 2. MODIFY USERS TABLE
-- =============================================

-- Add deleted_at column for soft delete functionality
alter table users add column deleted_at timestamptz;

-- =============================================
-- 3. CREATE INDEXES
-- =============================================

-- Partial index for soft delete queries (only indexes non-null deleted_at values)
create index idx_users_deleted_at on users (deleted_at) where deleted_at is not null;

-- =============================================
-- 4. UPDATE RLS POLICIES
-- =============================================

-- Drop existing policies to recreate with deleted_at filter
drop policy if exists users_select_policy on users;
drop policy if exists users_update_policy on users;
drop policy if exists users_delete_policy on users;

-- Recreate select policy with soft delete filter
create policy users_select_policy on users
for select using (
  deleted_at is null and
  (auth.jwt() ->> 'role' = 'admin' or
   id = (auth.jwt() ->> 'sub')::integer)
);

-- Recreate update policy with soft delete filter
create policy users_update_policy on users
for update using (
  deleted_at is null and
  (auth.jwt() ->> 'role' = 'admin' or
   id = (auth.jwt() ->> 'sub')::integer)
);

-- Recreate delete policy (hard delete) with soft delete filter - admin can only delete non-soft-deleted users
create policy users_delete_policy on users
for delete using (
  deleted_at is null and
  auth.jwt() ->> 'role' = 'admin'
);

-- =============================================
-- 5. UPDATE AUDIT LOGS POLICY
-- =============================================

-- Allow system operations to insert user_deleted audit entries
-- (existing insert policy already allows admin, which covers this case)
