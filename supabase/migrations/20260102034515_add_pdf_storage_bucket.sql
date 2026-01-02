/*
  # Add PDF Storage Bucket

  1. Storage Setup
    - Create 'manuals' storage bucket for PDF files
    - Set public access for reading PDFs
    - Configure allowed MIME types for PDFs
  
  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated admins to upload PDFs
    - Allow all authenticated users to view PDFs
*/

-- Create storage bucket for manual PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuals',
  'manuals',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload PDFs
CREATE POLICY "Admins can upload manual PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'manuals' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update PDFs
CREATE POLICY "Admins can update manual PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'manuals' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete PDFs
CREATE POLICY "Admins can delete manual PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'manuals' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow authenticated users to view PDFs
CREATE POLICY "Authenticated users can view manual PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'manuals');