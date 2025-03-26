-- Adicionar campos de redes sociais à tabela profiles
ALTER TABLE profiles
ADD COLUMN instagram_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN facebook_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN youtube_url TEXT;

-- Adicionar campo de destaque à tabela links
ALTER TABLE links
ADD COLUMN is_highlighted BOOLEAN DEFAULT false; 