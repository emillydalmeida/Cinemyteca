ALTER TABLE filmes 
ADD COLUMN IF NOT EXISTS usuario_email TEXT DEFAULT 'usuario_anonimo';
 
CREATE INDEX IF NOT EXISTS idx_filmes_usuario_email ON filmes(usuario_email);
 
UPDATE filmes 
SET usuario_email = 'usuario_anonimo' 
WHERE usuario_email IS NULL;
 
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'filmes' 
  AND column_name = 'usuario_email';
 
SELECT id, titulo, usuario_id, usuario_email 
FROM filmes 
LIMIT 5;
