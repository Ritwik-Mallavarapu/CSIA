/*
  # Optimize Database Performance and Security

  1. Performance Improvements
    - Add indexes on all foreign key columns to improve query performance
    - Optimize RLS policies to use `(select auth.uid())` to prevent re-evaluation per row
    - Fix function search_path to be immutable
  
  2. Indexes Added
    - admin_comments: admin_id, feedback_id
    - attempt_answers: attempt_id, question_id, selected_option_id
    - feedback: user_id
    - manuals: created_by
    - question_options: question_id
    - questions: quiz_id
    - quiz_attempts: quiz_id, user_id
    - quizzes: created_by
  
  3. RLS Policy Optimizations
    - All auth.uid() calls wrapped with (select auth.uid()) for better performance
    - Prevents function re-evaluation for each row
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_admin_comments_admin_id ON admin_comments(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_feedback_id ON admin_comments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_selected_option_id ON attempt_answers(selected_option_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_manuals_created_by ON manuals(created_by);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- Drop existing RLS policies and recreate with optimized auth function calls
-- Profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Quizzes table
DROP POLICY IF EXISTS "Admins can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can update quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can delete quizzes" ON quizzes;

CREATE POLICY "Admins can create quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Questions table
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Question options table
DROP POLICY IF EXISTS "Admins can manage options" ON question_options;

CREATE POLICY "Admins can manage options"
  ON question_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Quiz attempts table
DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON quiz_attempts;

CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Attempt answers table
DROP POLICY IF EXISTS "Users can view own attempt answers" ON attempt_answers;
DROP POLICY IF EXISTS "Users can create own attempt answers" ON attempt_answers;

CREATE POLICY "Users can view own attempt answers"
  ON attempt_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = attempt_answers.attempt_id
      AND quiz_attempts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create own attempt answers"
  ON attempt_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = attempt_answers.attempt_id
      AND quiz_attempts.user_id = (select auth.uid())
    )
  );

-- Manuals table
DROP POLICY IF EXISTS "Admins can create manuals" ON manuals;
DROP POLICY IF EXISTS "Admins can update manuals" ON manuals;
DROP POLICY IF EXISTS "Admins can delete manuals" ON manuals;

CREATE POLICY "Admins can create manuals"
  ON manuals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update manuals"
  ON manuals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete manuals"
  ON manuals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Feedback table
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can create own feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Admin comments table
DROP POLICY IF EXISTS "Users can view comments on their feedback" ON admin_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON admin_comments;
DROP POLICY IF EXISTS "Admins can create comments" ON admin_comments;

CREATE POLICY "Users can view comments on their feedback"
  ON admin_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM feedback
      WHERE feedback.id = admin_comments.feedback_id
      AND feedback.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all comments"
  ON admin_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create comments"
  ON admin_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Fix function search_path to be immutable
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;