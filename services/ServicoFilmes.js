import servicoSupabase from './SupabaseServico.js';

class ServicoFilmes {
  constructor() {
    this.inicializado = false;
  }

  async inicializar() {
    if (this.inicializado) return true;
    
    try {
      const conexaoOk = await servicoSupabase.verificarConexao();
      if (!conexaoOk) {
        throw new Error('Não foi possível conectar ao Supabase');
      }
      
      this.inicializado = true;
      console.log('✅ ServicoFilmes inicializado com Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar ServicoFilmes:', error);
      return false;
    }
  }

  async obterFilmesPorGenero(genero) {
    await this.inicializar();
    
    try {
      console.log(`🔍 Buscando filmes do gênero: ${genero}`);
      const filmes = await servicoSupabase.obterFilmesPorGenero(genero);
      console.log(`✅ Encontrados ${filmes.length} filmes para ${genero}`);
      return filmes;
    } catch (error) {
      console.error(`❌ Erro ao buscar filmes do gênero ${genero}:`, error);
      return [];
    }
  }

  async adicionarFilme(genero, dadosFilme) {
    await this.inicializar();
    
    try { 
      const existe = await this.verificarSeFilmeExiste(genero, dadosFilme.id);
      if (existe) {
        throw new Error('Filme já foi adicionado a esta categoria');
      }
 
      const filmeCompleto = {
        ...dadosFilme,
        genero: genero,
        assistidoEm: new Date().toISOString(),
        criadoEm: new Date().toISOString()
      };

      const sucesso = await servicoSupabase.adicionarFilme(genero, filmeCompleto);
      if (sucesso) {
        console.log(`✅ Filme "${dadosFilme.title}" adicionado ao gênero ${genero}`);
        return true;
      }
      
      throw new Error('Falha ao adicionar filme no Supabase');
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
    }
  }

  async removerFilme(genero, filmeId) {
    await this.inicializar();
    
    try {
      console.log(`🗑️ Removendo filme ID ${filmeId} do gênero ${genero}`);
      const sucesso = await servicoSupabase.removerFilme(genero, filmeId);
      
      if (sucesso) {
        console.log(`✅ Filme ID ${filmeId} removido com sucesso`);
        return true;
      }
      
      throw new Error('Falha ao remover filme do Supabase');
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      throw error;
    }
  }

  async atualizarFilme(genero, filmeAtualizado) {
    await this.inicializar();
    
    try {
      const filmeComData = {
        ...filmeAtualizado,
        atualizadoEm: new Date().toISOString()
      };

      const sucesso = await servicoSupabase.atualizarFilme(genero, filmeComData);
      if (sucesso) {
        console.log(`✅ Filme ID ${filmeAtualizado.id} atualizado`);
        return true;
      }
      
      throw new Error('Falha ao atualizar filme no Supabase');
    } catch (error) {
      console.error('❌ Erro ao atualizar filme:', error);
      throw error;
    }
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    await this.inicializar();
    
    try {
      return await servicoSupabase.verificarSeFilmeExiste(genero, filmeId);
    } catch (error) {
      console.error('❌ Erro ao verificar existência do filme:', error);
      return false;
    }
  }

  async obterEstatisticas() {
    await this.inicializar();
    
    try {
      console.log('📊 Calculando estatísticas...');
      const stats = await servicoSupabase.obterEstatisticas();
      console.log('✅ Estatísticas calculadas');
      return stats;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        totalFilmes: 0,
        notaMedia: 0,
        porGenero: {}
      };
    }
  }

  async limparDuplicatas() {
    await this.inicializar();
    
    try {
      console.log('🧹 Limpando duplicatas...');
      const sucesso = await servicoSupabase.limparDuplicatas();
      console.log('✅ Limpeza de duplicatas concluída');
      return sucesso;
    } catch (error) {
      console.error('❌ Erro ao limpar duplicatas:', error);
      return false;
    }
  }

  obterStatus() {
    return {
      tipo: 'supabase-only',
      conexao: this.inicializado,
      descricao: 'Usando apenas Supabase (migração concluída)'
    };
  }
}
 
const servicoFilmes = new ServicoFilmes();

export default servicoFilmes;
