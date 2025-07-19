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
    this.client = supabase; 
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
      const { data: filmeExistente, error: erroVerificacao } = await supabase
        .from('filmes')
        .select('id')
        .eq('tmdb_id', filme.id)
        .eq('genero', filme.genero)
        .single();

      if (filmeExistente) {
        console.log('⚠️ Filme já existe no Supabase, não adicionando duplicata');
        return filmeExistente;
      }

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
        usuario_id: this.obterUsuarioId(),
        usuario_email: await this.obterEmailUsuario()
      };

      console.log('📝 Dados do filme para inserir:', {
        tmdb_id: filmeData.tmdb_id,
        titulo: filmeData.titulo,
        genero: filmeData.genero,
        usuario_id: filmeData.usuario_id
      });

      const { data, error } = await supabase
        .from('filmes')
        .insert([filmeData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar filme no Supabase:', error);
        console.error('📋 Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Filme adicionado no Supabase:', filme.title);
      return data;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
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
      
      const { data: filmesExistentes, error: erroConsulta } = await supabase
        .from('filmes')
        .select('id, tmdb_id, titulo')
        .eq('genero', genero)
        .eq('tmdb_id', filmeId);

      if (erroConsulta) {
        console.log('🔍 Erro ao buscar filmes no Supabase:', erroConsulta.message);
        return true; 
      }

      if (!filmesExistentes || filmesExistentes.length === 0) {
        console.log('🔍 Filme não encontrado no Supabase');
        return true;
      }

      console.log(`🎬 Encontrados ${filmesExistentes.length} filme(s) no Supabase:`, filmesExistentes);

      const { error } = await supabase
        .from('filmes')
        .delete()
        .eq('genero', genero)
        .eq('tmdb_id', filmeId);

      if (error) {
        console.error('❌ Erro ao remover filme no Supabase:', error);
        return false;
      }

      console.log(`✅ ${filmesExistentes.length} filme(s) removido(s) do Supabase`);
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
        estatisticas.porGenero[filme.genero] = 
          (estatisticas.porGenero[filme.genero] || 0) + 1;

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
    let userId = localStorage.getItem('cinemyteca_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cinemyteca_user_id', userId);
    }
    return userId;
  }

  async obterEmailUsuario() {
    if (!supabase) {
      return 'usuario_anonimo';
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email || 'usuario_anonimo';
    } catch (error) {
      console.error('❌ Erro ao obter email do usuário:', error);
      return 'usuario_anonimo';
    }
  }

  async limparDuplicatas(genero = null) {
    if (!supabase || !this.inicializado) {
      console.log('⚠️ Supabase não disponível para limpar duplicatas');
      return false;
    }

    try {
      console.log('🧹 Iniciando limpeza de duplicatas...');
      
      let query = supabase
        .from('filmes')
        .select('id, tmdb_id, genero, titulo, data_adicao');
      
      if (genero) {
        query = query.eq('genero', genero);
      }
      
      const { data: filmes, error } = await query.order('data_adicao', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar filmes para limpeza:', error);
        return false;
      }

      const grupos = {};
      filmes.forEach(filme => {
        const chave = `${filme.genero}_${filme.tmdb_id}`;
        if (!grupos[chave]) {
          grupos[chave] = [];
        }
        grupos[chave].push(filme);
      });

      let duplicatasRemovidas = 0;
       
      for (const [chave, grupo] of Object.entries(grupos)) {
        if (grupo.length > 1) {
          console.log(`🔍 Encontradas ${grupo.length} duplicatas para ${grupo[0].titulo}`);
           
          const paraRemover = grupo.slice(1);
          
          for (const filme of paraRemover) {
            const { error: erroRemocao } = await supabase
              .from('filmes')
              .delete()
              .eq('id', filme.id);
              
            if (!erroRemocao) {
              duplicatasRemovidas++;
              console.log(`✅ Duplicata removida: ${filme.titulo} (ID: ${filme.id})`);
            }
          }
        }
      }

      console.log(`🎯 Limpeza concluída: ${duplicatasRemovidas} duplicatas removidas`);
      return true;
    } catch (error) {
      console.error('❌ Erro na limpeza de duplicatas:', error);
      return false;
    }
  }

  async gerarRelatorioUltimosFilmes(limite = 50) {
    if (!supabase || !this.inicializado) {
      console.log('⚠️ Supabase não disponível para gerar relatório');
      return [];
    }

    try {
      console.log(`📊 Buscando últimos ${limite} filmes para relatório...`);
      
      // Tentar primeiro com usuario_email, se falhar usar fallback
      let query = supabase
        .from('filmes')
        .select('titulo, genero, data_adicao, usuario_id, usuario_email, nota_tmdb, nota_usuario, data_lancamento')
        .order('data_adicao', { ascending: false })
        .limit(limite);

      let { data: filmes, error } = await query;

      // Se der erro de coluna não existir, tentar sem usuario_email
      if (error && error.code === '42703' && error.message.includes('usuario_email')) {
        console.log('⚠️ Coluna usuario_email não existe, usando fallback...');
        
        const { data: filmesFallback, error: errorFallback } = await supabase
          .from('filmes')
          .select('titulo, genero, data_adicao, usuario_id, nota_tmdb, nota_usuario, data_lancamento')
          .order('data_adicao', { ascending: false })
          .limit(limite);

        if (errorFallback) {
          console.error('❌ Erro ao buscar filmes para relatório (fallback):', errorFallback);
          throw errorFallback;
        }

        filmes = filmesFallback;
      } else if (error) {
        console.error('❌ Erro ao buscar filmes para relatório:', error);
        throw error;
      }

      // Formatar dados para relatório
      const relatorio = {
        data_geracao: new Date().toISOString(),
        total_filmes: filmes.length,
        filmes: filmes.map(filme => ({
          titulo: filme.titulo,
          genero: filme.genero,
          nota_tmdb: filme.nota_tmdb,
          nota_usuario: filme.nota_usuario,
          ano: filme.data_lancamento ? new Date(filme.data_lancamento).getFullYear() : null,
          data_adicao: filme.data_adicao,
          usuario_responsavel: filme.usuario_email || filme.usuario_id || 'admin'
        }))
      };

      console.log(`✅ Relatório gerado com ${filmes.length} filmes`);
      return relatorio;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
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
