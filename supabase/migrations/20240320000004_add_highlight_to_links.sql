-- Adiciona a coluna is_highlighted à tabela links
ALTER TABLE links
ADD COLUMN is_highlighted BOOLEAN DEFAULT false;

-- Garante que apenas um link por usuário pode estar destacado
CREATE UNIQUE INDEX one_highlighted_link_per_user 
ON links (user_id) 
WHERE is_highlighted = true; 