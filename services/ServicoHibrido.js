import pouchDBServico from './PouchDBServico.js';
import servicoSupabase from './SupabaseServico.js';

class ServicoHibrido {
  constructor() {
    this.supabaseDisponivel = false;
    this.inicializando = false;
    this.sincronizacaoInicial = false; 
  }

  async inicializar() {
    if (this.inicializando) return;
    this.inicializando = true;

    try {
      await pouchDBServico.aguardarInicializacao();
      
      this.supabaseDisponivel = await servicoSupabase.verificarConexao();
      
      if (this.supabaseDisponivel) {
        console.log('🌐 Modo híbrido: Local + Supabase');
        if (!this.sincronizacaoInicial) {
          this.sincronizacaoInicial = true;
          await this.sincronizarPrimeiraVez();
        }
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
      console.log('🔄 Sincronização inicial com Supabase...');
      
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
        const filmesSupabase = await servicoSupabase.obterFilmesPorGenero(genero);
        return filmesSupabase;
      } catch (error) {
        console.error('❌ Erro ao buscar do Supabase, usando local:', error);
        return await pouchDBServico.obterFilmesPorGenero(genero);
      }
    } else {
      return await pouchDBServico.obterFilmesPorGenero(genero);
    }
  }

  async adicionarFilme(genero, filme) {
    await this.inicializar();

    try {
      if (this.supabaseDisponivel) {
        try {
          await servicoSupabase.adicionarFilme(filme);
          console.log('✅ Filme adicionado ao Supabase');
        } catch (error) {
          console.error('⚠️ Erro ao adicionar ao Supabase:', error);
        }
      }
      
      await pouchDBServico.adicionarFilme(genero, filme);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
    }
  }

  async removerFilme(genero, filmeId) {
    await this.inicializar();

    try {
      let sucessoSupabase = true;
      
      if (this.supabaseDisponivel) {
        try {
          await servicoSupabase.removerFilme(genero, filmeId);
          console.log('✅ Filme removido do Supabase');
        } catch (error) {
          console.error('⚠️ Erro ao remover do Supabase:', error);
          sucessoSupabase = false;
        }
      }
      
      const sucessoLocal = await pouchDBServico.removerFilme(genero, filmeId);
      
      return sucessoSupabase || sucessoLocal;
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      return false;
    }
  }

  async atualizarFilme(genero, filmeAtualizado) {
    await this.inicializar();

    try {
      const sucessoLocal = await pouchDBServico.atualizarFilme(genero, filmeAtualizado);
      
      if (this.supabaseDisponivel && sucessoLocal) {
        try {
          console.log('⚠️ Atualização no Supabase ainda não implementada');
        } catch (error) {
          console.error('⚠️ Erro ao atualizar no Supabase:', error);
        }
      }
      
      return sucessoLocal;
    } catch (error) {
      console.error('❌ Erro ao atualizar filme:', error);
      return false;
    }
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    await this.inicializar();

    if (this.supabaseDisponivel) {
      try {
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
      try { 
        const generos = ['acao', 'animacao', 'comedia', 'documentario', 'drama', 'fantasia', 'ficcao', 'romance', 'suspense', 'terror'];
        let todosFilmes = [];
        
        for (const genero of generos) {
          const filmes = await servicoSupabase.obterFilmesPorGenero(genero);
          todosFilmes = todosFilmes.concat(filmes);
        }

        const backup = {
          versao: '2.0',
          fonte: 'supabase',
          data: new Date().toISOString(),
          totalFilmes: todosFilmes.length,
          filmes: todosFilmes
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], 
          { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cinemyteca_backup_supabase_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Backup do Supabase criado com sucesso');
        return;
      } catch (error) {
        console.error('❌ Erro ao criar backup do Supabase, usando local:', error);
      }
    }
     
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
