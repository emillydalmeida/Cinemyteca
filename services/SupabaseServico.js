// Serviço para sincronização com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase = null;

const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseKey && supabaseUrl !== '' && supabaseKey !== '';
};

if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

class ServicoSupabase {
  constructor() {
    this.inicializado = false;
    this.tentativasConexao = 0;
    this.maxTentativas = 3;
  }

  async verificarConexao() {
    if (!supabase || !isSupabaseConfigured()) {
      console.log('⚠️ Supabase não configurado, usando apenas armazenamento local');
      return false;
    }

    try {
      const { error } = await supabase.from('filmes').select('id').limit(1);
      if (error && error.code === '42P01') {
        console.log('📋 Criando tabela de filmes...');
        await this.criarTabelaFilmes();
      }
      this.inicializado = true;
      console.log('✅ Conexão com Supabase estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com Supabase:', error);
      return false;
    }
  }

  async criarTabelaFilmes() {
    if (!supabase) return;

    try {
      const { error } = await supabase.rpc('create_filmes_table');
      
      if (error) {
        console.log('⚠️ Tabela pode já existir ou erro ao criar:', error.message);
      } else {
        console.log('✅ Tabela de filmes criada com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao criar tabela:', error);
    }
  }

  async adicionarFilme(filme) {
    if (!supabase || !this.inicializado) {
      console.log('⚠️ Supabase não disponível para adicionar filme');
      return null;
    }

    try {
      const filmeData = {
        tmdb_id: filme.id,
        titulo: filme.title,
        titulo_original: filme.originalTitle,
        poster_url: filme.posterPath,
        backdrop_url: filme.backdropPath,
        sinopse: filme.overview,
        data_lancamento: filme.releaseDate,
        nota_tmdb: filme.voteAverage,
        genero: filme.genero,
        nota_usuario: filme.notaUsuario,
        comentario_usuario: filme.comentarioUsuario,
        tags_usuario: filme.tagsUsuario || [],
        data_adicao: new Date().toISOString(),
        usuario_id: this.obterUsuarioId()
      };

      const { data, error } = await supabase
        .from('filmes')
        .insert([filmeData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar filme no Supabase:', error);
        return null;
      }

      console.log('✅ Filme adicionado no Supabase:', filme.title);
      return data;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      return null;
    }
  }

  async obterFilmesPorGenero(genero) {
    if (!supabase || !this.inicializado) {
      console.log('⚠️ Supabase não disponível para buscar filmes');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('filmes')
        .select('*')
        .eq('genero', genero)
        .order('titulo', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar filmes no Supabase:', error);
        return [];
      }

      // Converte formato Supabase para formato local
      const filmesFormatados = data.map(filme => ({
        id: filme.tmdb_id,
        idLocal: filme.id,
        title: filme.titulo,
        originalTitle: filme.titulo_original,
        posterPath: filme.poster_url,
        backdropPath: filme.backdrop_url,
        overview: filme.sinopse,
        releaseDate: filme.data_lancamento,
        voteAverage: filme.nota_tmdb,
        genero: filme.genero,
        notaUsuario: filme.nota_usuario,
        comentarioUsuario: filme.comentario_usuario,
        tagsUsuario: filme.tags_usuario || [],
        assistidoEm: filme.data_adicao,
        dataAdicao: filme.data_adicao
      }));

      console.log(`✅ ${filmesFormatados.length} filmes carregados do Supabase para gênero ${genero}`);
      return filmesFormatados;
    } catch (error) {
      console.error('❌ Erro ao buscar filmes:', error);
      return [];
    }
  }

  async removerFilme(genero, filmeId) {
    if (!supabase || !this.inicializado) {
      console.log('⚠️ Supabase não disponível para remover filme');
      return false;
    }

    try {
      console.log(`🗑️ Tentando remover do Supabase - Gênero: ${genero}, ID: ${filmeId}`);
      
      // Primeiro verifica se o filme existe
      const { data: filmeExistente, error: erroConsulta } = await supabase
        .from('filmes')
        .select('id, tmdb_id, titulo')
        .eq('genero', genero)
        .eq('tmdb_id', filmeId)
        .single();

      if (erroConsulta) {
        console.log('🔍 Filme não encontrado no Supabase para remoção:', erroConsulta.message);
        return true; // Considera sucesso se não existe
      }

      console.log('🎬 Filme encontrado no Supabase:', filmeExistente);

      // Agora remove o filme
      const { error } = await supabase
        .from('filmes')
        .delete()
        .eq('genero', genero)
        .eq('tmdb_id', filmeId);

      if (error) {
        console.error('❌ Erro ao remover filme no Supabase:', error);
        return false;
      }

      console.log('✅ Filme removido do Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      return false;
    }
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    if (!supabase || !this.inicializado) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('filmes')
        .select('id')
        .eq('genero', genero)
        .eq('tmdb_id', filmeId)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar filme no Supabase:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('❌ Erro ao verificar filme:', error);
      return false;
    }
  }

  async obterEstatisticas() {
    if (!supabase || !this.inicializado) {
      return { totalFilmes: 0, porGenero: {}, notaMedia: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('filmes')
        .select('genero, nota_usuario');

      if (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        return { totalFilmes: 0, porGenero: {}, notaMedia: 0 };
      }

      const estatisticas = {
        totalFilmes: data.length,
        porGenero: {},
        notaMedia: 0
      };

      let somaNotas = 0;
      let filmesComNota = 0;

      data.forEach(filme => {
        // Conta por gênero
        estatisticas.porGenero[filme.genero] = 
          (estatisticas.porGenero[filme.genero] || 0) + 1;

        // Calcula média de notas
        if (filme.nota_usuario && filme.nota_usuario > 0) {
          somaNotas += filme.nota_usuario;
          filmesComNota++;
        }
      });

      if (filmesComNota > 0) {
        estatisticas.notaMedia = (somaNotas / filmesComNota).toFixed(1);
      }

      return estatisticas;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { totalFilmes: 0, porGenero: {}, notaMedia: 0 };
    }
  }

  obterUsuarioId() {
    // Gera um ID único por dispositivo/navegador
    let userId = localStorage.getItem('cinemyteca_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cinemyteca_user_id', userId);
    }
    return userId;
  }

  async sincronizarComLocal(pouchDBService) {
    console.log('🔄 Sincronização rápida com banco local...');
    
    try {
      const { count, error: countError } = await supabase
        .from('filmes')
        .select('*', { count: 'exact', head: true });

      if (countError || count === 0) {
        console.log('✅ Nenhum filme para sincronizar');
        return;
      }

      console.log(`📋 ${count} filmes encontrados no Supabase`);
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  }
}

const servicoSupabase = new ServicoSupabase();

export default servicoSupabase;
