import adaptadorPouchDB from './AdaptadorPouchDB.js';

class ServicoArmazenamentoLocal {
  static CHAVE_ARMAZENAMENTO = 'cinemyteca_filmes_por_categoria';

  static async obterFilmesPorCategoria(categoria) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando array vazio');
      return [];
    }

    try {
      console.log(`🔄 Buscando filmes para categoria: ${categoria}`);
      const filmes = await adaptadorPouchDB.obterFilmesPorGenero(categoria);
      console.log(`✅ Encontrados ${filmes.length} filmes para categoria ${categoria}`);
      return filmes;
    } catch (error) {
      console.error('❌ Erro ao carregar filmes:', error);
      return [];
    }
  }

  static async adicionarFilmeACategoria(categoria, dadosFilme) {
    if (typeof window === 'undefined') {
      throw new Error('Não é possível adicionar filmes no servidor');
    }

    try {
      const filmeComId = {
        ...dadosFilme,
        assistidoEm: new Date().toISOString(),
        idLocal: Date.now() 
      };

      const existe = await this.verificarSeFilmeExiste(categoria, dadosFilme.id);
      if (existe) {
        throw new Error('Filme já foi adicionado a esta categoria');
      }

      await adaptadorPouchDB.adicionarFilme(categoria, filmeComId);
      console.log('✅ Filme adicionado ao PouchDB:', dadosFilme.title);
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
    }
  }

  static async verificarSeFilmeExiste(categoria, filmeId) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando false');
      return false;
    }

    try {
      return await adaptadorPouchDB.verificarSeFilmeExiste(categoria, filmeId);
    } catch (error) {
      console.error('❌ Erro ao verificar filme:', error);
      return false;
    }
  }

  static async removerFilmeDaCategoria(categoria, filmeId) {
    try {
      const sucesso = await adaptadorPouchDB.removerFilme(categoria, filmeId);
      if (sucesso) {
        console.log('✅ Filme removido com sucesso');
      }
      return sucesso;
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      throw error;
    }
  }

  static async obterTodosFilmes() {
    try {
      return await adaptadorPouchDB.obterTodosFilmes();
    } catch (error) {
      console.error('❌ Erro ao obter todos os filmes:', error);
      return {};
    }
  }

  static async limparTudo() {
    try {
      await adaptadorPouchDB.limparTudo();
      console.log('✅ Dados limpos do PouchDB');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }

  static configurarSincronizacao(urlRemota) {
    try {
      adaptadorPouchDB.configurarSincronizacao(urlRemota);
      console.log('✅ Sincronização configurada:', urlRemota);
    } catch (error) {
      console.error('❌ Erro ao configurar sincronização:', error);
    }
  }

  static async obterEstatisticas() {
    try {
      const filmesAssistidos = await adaptadorPouchDB.obterTodosFilmes() || {};
      
      const filmes = Object.values(filmesAssistidos).flat();
      const totalFilmes = filmes.length;
      
      if (totalFilmes === 0) {
        return {
          totalFilmes: 0,
          notaMedia: 0,
          porGenero: {}
        };
      }
      
      const notasValidas = filmes.filter(f => {
        const nota = f.notaUsuario || f.nota || f.rating;
        return nota && nota > 0;
      }).map(f => f.notaUsuario || f.nota || f.rating);
      
      const notaMedia = notasValidas.length > 0 
        ? (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1)
        : 0;
      
      const porGenero = {};
      Object.entries(filmesAssistidos).forEach(([genero, filmes]) => {
        if (filmes.length > 0) {
          porGenero[genero] = filmes.length;
        }
      });
      
      return {
        totalFilmes,
        notaMedia,
        porGenero
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

export default ServicoArmazenamentoLocal;
