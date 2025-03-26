-- Create a new storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Create a policy to allow authenticated users to upload thumbnails
CREATE POLICY "Allow authenticated users to upload thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.role() = 'authenticated'
);

-- Create a policy to allow public access to thumbnails
CREATE POLICY "Allow public access to thumbnails"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'thumbnails'); 