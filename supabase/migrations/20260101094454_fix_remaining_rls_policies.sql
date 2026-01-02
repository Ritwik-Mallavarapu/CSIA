/*
  # Fix Remaining RLS Policy Optimizations

  1. Changes
    - Fix the "Users can insert own profile" policy that was missed in the previous migration
    - This policy still uses auth.uid() directly instead of (select auth.uid())
    - Ensures all RLS policies use optimized auth function calls for better performance
  
  2. Security
    - Maintains existing security rules while improving performance
    - No changes to access control logic
*/

-- Fix the profiles insert policy that was missed
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);