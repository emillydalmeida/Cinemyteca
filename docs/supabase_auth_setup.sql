
DROP POLICY IF EXISTS "Todos podem ver filmes" ON filmes;
DROP POLICY IF EXISTS "Todos podem adicionar filmes" ON filmes;
DROP POLICY IF EXISTS "Todos podem remover filmes" ON filmes;
DROP POLICY IF EXISTS "Todos podem atualizar filmes" ON filmes;

CREATE POLICY "Leitura pública de filmes" ON filmes
    FOR SELECT USING (true);

CREATE POLICY "Apenas autenticados podem adicionar filmes" ON filmes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas autenticados podem atualizar filmes" ON filmes
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas autenticados podem remover filmes" ON filmes
    FOR DELETE USING (auth.uid() IS NOT NULL);

ALTER TABLE filmes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_filmes_user_id ON filmes(user_id);

CREATE OR REPLACE FUNCTION handle_new_filme()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_filme_created ON filmes;
CREATE TRIGGER on_filme_created
  BEFORE INSERT ON filmes
  FOR EACH ROW EXECUTE FUNCTION handle_new_filme();

UPDATE filmes 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = '...@gmail.com'
  LIMIT 1
)
WHERE user_id IS NULL;

SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'filmes';

