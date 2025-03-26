-- Criar o bucket para thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Criar política para permitir upload de imagens por usuários autenticados
CREATE POLICY "Allow authenticated users to upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
);

-- Criar política para permitir atualização de imagens por usuários autenticados
CREATE POLICY "Allow authenticated users to update thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

-- Criar política para permitir deleção de imagens por usuários autenticados
CREATE POLICY "Allow authenticated users to delete thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

-- Criar política para permitir visualização pública das imagens
CREATE POLICY "Allow public access to thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'thumbnails'); 