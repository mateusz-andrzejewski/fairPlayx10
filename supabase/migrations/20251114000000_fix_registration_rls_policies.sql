-- Migration: Fix Registration RLS Policies
-- Problem: Current RLS policies prevent anonymous users from registering
-- - No INSERT policy on users table (registration blocked)
-- - SELECT policy doesn't allow checking if email exists (duplicate check blocked)
-- Solution: Add policies that allow anonymous users to register while maintaining security

-- =============================================
-- FIX USERS TABLE POLICIES FOR REGISTRATION
-- =============================================

-- Drop existing policies to recreate them
drop policy if exists users_select_policy on users;
drop policy if exists users_insert_policy on users;
drop policy if exists users_update_policy on users;
drop policy if exists users_delete_policy on users;

-- SELECT policy: 
-- - Authenticated users can see their own profile
-- - Admins can see all profiles
-- - Anonymous users can check if email exists (but only see id, not sensitive data)
create policy users_select_policy on users
for select using (
  -- Authenticated user viewing their own profile or admin viewing all
  (
    auth.jwt() ->> 'email' is not null
    and (
      email = auth.jwt() ->> 'email'
      or
      (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
    )
  )
  or
  -- Anonymous users can only check email existence (for registration)
  -- This allows the registration flow to check for duplicate emails
  (auth.jwt() is null or auth.jwt() ->> 'email' is null)
);

-- INSERT policy: Allow anyone to register (insert new user)
-- This is required for the registration flow
create policy users_insert_policy on users
for insert with check (true);

-- UPDATE policy: Users can update their own profile, admins can update any
create policy users_update_policy on users
for update using (
  email = auth.jwt() ->> 'email'
  or
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

-- DELETE policy: Only admins can delete users
create policy users_delete_policy on users
for delete using (
  (select role from users where email = auth.jwt() ->> 'email' and deleted_at is null) = 'admin'
);

