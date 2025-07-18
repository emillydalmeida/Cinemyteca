-- Script SQL para criar a tabela de filmes no Supabase
-- Execute este script no editor SQL do Supabase

-- Criar a tabela de filmes
CREATE TABLE IF NOT EXISTS filmes (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    titulo_original TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    sinopse TEXT,
    data_lancamento DATE,
    nota_tmdb DECIMAL(3,1),
    genero TEXT NOT NULL,
    nota_usuario DECIMAL(3,1),
    comentario_usuario TEXT,
    tags_usuario TEXT[] DEFAULT '{}',
    data_adicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_filmes_genero ON filmes(genero);
CREATE INDEX IF NOT EXISTS idx_filmes_tmdb_id ON filmes(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_filmes_usuario_id ON filmes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_filmes_genero_tmdb_id ON filmes(genero, tmdb_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE filmes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam todos os filmes (app público)
CREATE POLICY "Todos podem ver filmes" ON filmes
    FOR SELECT USING (true);

-- Política para permitir que qualquer um adicione filmes
CREATE POLICY "Todos podem adicionar filmes" ON filmes
    FOR INSERT WITH CHECK (true);

-- Política para permitir que qualquer um remova filmes
CREATE POLICY "Todos podem remover filmes" ON filmes
    FOR DELETE USING (true);

-- Política para permitir que qualquer um atualize filmes
CREATE POLICY "Todos podem atualizar filmes" ON filmes
    FOR UPDATE USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_filmes_updated_at 
    BEFORE UPDATE ON filmes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo (opcional)
-- INSERT INTO filmes (tmdb_id, titulo, genero, nota_usuario, usuario_id) 
-- VALUES (550, 'Clube da Luta', 'acao', 9.0, 'demo_user');
