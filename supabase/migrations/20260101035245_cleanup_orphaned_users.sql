/*
  # Clean Up Orphaned Auth Users

  1. Purpose
    - Remove auth users who don't have corresponding profiles
    - This fixes the "user already registered" error when profile creation failed

  2. Changes
    - Creates a function to identify and clean up orphaned users
    - This is a one-time cleanup operation

  3. Security
    - Only affects users without profiles
    - Safe to run multiple times
*/

DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  FOR auth_user_id IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT id FROM profiles)
  LOOP
    DELETE FROM auth.users WHERE id = auth_user_id;
  END LOOP;
END $$;