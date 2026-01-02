/*
  # Add PDF Storage Support for Manuals

  1. Changes
    - Add `pdf_url` column to manuals table to store PDF file URLs
    - Create storage bucket for manual PDFs
    - Set up RLS policies for storage bucket access
  
  2. Security
    - Authenticated users can read PDFs
    - Only admins can upload/delete PDFs
*/

-- Add pdf_url column to manuals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manuals' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE manuals ADD COLUMN pdf_url text;
  END IF;
END $$;

-- Create storage bucket for manual PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('manual-pdfs', 'manual-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read PDFs
CREATE POLICY "Anyone authenticated can view PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'manual-pdfs');

-- Allow admins to upload PDFs
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'manual-pdfs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update PDFs
CREATE POLICY "Admins can update PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'manual-pdfs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'manual-pdfs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete PDFs
CREATE POLICY "Admins can delete PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'manual-pdfs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );