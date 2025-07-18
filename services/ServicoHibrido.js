import pouchDBServico from './PouchDBServico.js';
import servicoSupabase from './SupabaseServico.js';

class ServicoHibrido {
  constructor() {
    this.supabaseDisponivel = false;
    this.inicializando = false;
  }

  async inicializar() {
    if (this.inicializando) return;
    this.inicializando = true;

    try {
      // Inicializa PouchDB primeiro (sempre funciona)
      await pouchDBServico.aguardarInicializacao();
      
      // Tenta conectar com Supabase
      this.supabaseDisponivel = await servicoSupabase.verificarConexao();
      
      if (this.supabaseDisponivel) {
        console.log('🌐 Modo híbrido: Local + Supabase');
        // Sincroniza dados existentes locais com Supabase na primeira vez
        await this.sincronizarPrimeiraVez();
      } else {
        console.log('💾 Modo local: Apenas PouchDB');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço híbrido:', error);
      this.supabaseDisponivel = false;
    } finally {
      this.inicializando = false;
    }
  }

  async sincronizarPrimeiraVez() {
    try {
      console.log('🔄 Sincronizando dados locais com Supabase...');
      
      // Pega todos os filmes locais e envia para Supabase
      const filmesLocais = await pouchDBServico.obterTodosDados();
      
      for (const filme of filmesLocais.filmes) {
        if (filme.genero && filme.id) {
          try {
            const existe = await servicoSupabase.verificarSeFilmeExiste(filme.genero, filme.id);
            if (!existe) {
              await servicoSupabase.adicionarFilme(filme);
            }
          } catch (error) {
            console.log('⚠️ Erro ao sincronizar filme:', filme.title);
          }
        }
      }

      // Agora sincroniza do Supabase para local
      await servicoSupabase.sincronizarComLocal(pouchDBServico);
      
      console.log('✅ Sincronização inicial concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização inicial:', error);
    }
  }

  async obterFilmesPorGenero(genero) {
    await this.inicializar();

    if (this.supabaseDisponivel) {
      try {
        // Primeiro tenta buscar do Supabase (dados mais atuais)
        const filmesSupabase = await servicoSupabase.obterFilmesPorGenero(genero);
        
        // Sincroniza com local em background
        this.sincronizarGeneroComLocal(genero, filmesSupabase);
        
        return filmesSupabase;
      } catch (error) {
        console.error('❌ Erro ao buscar do Supabase, usando local:', error);
        return await pouchDBServico.obterFilmesPorGenero(genero);
      }
    } else {
      // Só local disponível
      return await pouchDBServico.obterFilmesPorGenero(genero);
    }
  }

  async sincronizarGeneroComLocal(genero, filmesSupabase) {
    try {
      // Adiciona filmes do Supabase que não existem localmente
      for (const filme of filmesSupabase) {
        try {
          await pouchDBServico.adicionarFilme(genero, filme);
        } catch (error) {
          // Filme já existe localmente, ok
        }
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar gênero com local:', error);
    }
  }

  async adicionarFilme(genero, filme) {
    await this.inicializar();

    try {
      // Adiciona local primeiro (sempre funciona)
      await pouchDBServico.adicionarFilme(genero, filme);
      
      // Se Supabase disponível, adiciona lá também
      if (this.supabaseDisponivel) {
        try {
          await servicoSupabase.adicionarFilme(filme);
          console.log('✅ Filme sincronizado com Supabase');
        } catch (error) {
          console.error('⚠️ Erro ao sincronizar com Supabase, mas salvo localmente:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
    }
  }

  async removerFilme(genero, filmeId) {
    await this.inicializar();

    try {
      // Remove local primeiro
      const sucessoLocal = await pouchDBServico.removerFilme(genero, filmeId);
      
      // Se Supabase disponível, remove lá também
      if (this.supabaseDisponivel && sucessoLocal) {
        try {
          await servicoSupabase.removerFilme(genero, filmeId);
          console.log('✅ Filme removido do Supabase');
        } catch (error) {
          console.error('⚠️ Erro ao remover do Supabase, mas removido localmente:', error);
        }
      }
      
      return sucessoLocal;
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      return false;
    }
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    await this.inicializar();

    if (this.supabaseDisponivel) {
      try {
        // Verifica no Supabase primeiro (dados mais atuais)
        return await servicoSupabase.verificarSeFilmeExiste(genero, filmeId);
      } catch (error) {
        console.error('❌ Erro ao verificar no Supabase, usando local:', error);
        return await pouchDBServico.verificarSeFilmeExiste(genero, filmeId);
      }
    } else {
      return await pouchDBServico.verificarSeFilmeExiste(genero, filmeId);
    }
  }

  async obterEstatisticas() {
    await this.inicializar();

    if (this.supabaseDisponivel) {
      try {
        return await servicoSupabase.obterEstatisticas();
      } catch (error) {
        console.error('❌ Erro ao obter estatísticas do Supabase, usando local:', error);
        return await pouchDBServico.obterEstatisticas();
      }
    } else {
      return await pouchDBServico.obterEstatisticas();
    }
  }

  async criarBackup() {
    await this.inicializar();
    
    if (this.supabaseDisponivel) {
      // Se Supabase disponível, cria backup dos dados mais atuais
      try {
        const { data: filmesSupabase, error } = await servicoSupabase.supabase
          .from('filmes')
          .select('*');

        if (!error && filmesSupabase) {
          const backup = {
            versao: '2.0',
            fonte: 'supabase',
            data: new Date().toISOString(),
            totalFilmes: filmesSupabase.length,
            filmes: filmesSupabase
          };

          const blob = new Blob([JSON.stringify(backup, null, 2)], 
            { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `cinemyteca_backup_supabase_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          
          URL.revokeObjectURL(url);
          return;
        }
      } catch (error) {
        console.error('❌ Erro ao criar backup do Supabase, usando local:', error);
      }
    }
    
    // Fallback para backup local
    await pouchDBServico.criarBackup();
  }

  obterStatus() {
    return {
      local: pouchDBServico.inicializado,
      supabase: this.supabaseDisponivel,
      modo: this.supabaseDisponivel ? 'híbrido' : 'local'
    };
  }
}

const servicoHibrido = new ServicoHibrido();

export default servicoHibrido;
