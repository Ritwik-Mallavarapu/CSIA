/*
  # Fix Profiles Insert Policy

  1. Changes
    - Add INSERT policy for profiles table to allow new users to create their profile
    - Policy ensures users can only insert their own profile (where id matches auth.uid())

  2. Security
    - Maintains security by only allowing authenticated users to insert their own profile
    - Prevents users from creating profiles for other users
*/

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);