import adaptadorPouchDB from './AdaptadorPouchDB.js';

class ServicoArmazenamentoLocal {
  static CHAVE_ARMAZENAMENTO = 'cinemyteca_filmes_por_categoria';

  static async obterFilmesPorCategoria(categoria) {
    try {
      return await adaptadorPouchDB.obterFilmesPorGenero(categoria);
    } catch (error) {
      console.error('❌ Erro ao carregar filmes:', error);
      return [];
    }
  }

  static async adicionarFilmeACategoria(categoria, dadosFilme) {
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
        console.log('✅ Filme removido do PouchDB');
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

  static async criarBackup() {
    try {
      const backup = await adaptadorPouchDB.obterTodosDados();
      
      const dataAtual = new Date().toISOString().split('T')[0];
      const nomeArquivo = `cinemyteca-backup-${dataAtual}.json`;
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('✅ Backup criado com sucesso:', nomeArquivo);
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Obter estatísticas dos filmes
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
      
      // Calcular nota média - verificar diferentes campos de nota
      const notasValidas = filmes.filter(f => {
        const nota = f.notaUsuario || f.nota || f.rating;
        return nota && nota > 0;
      }).map(f => f.notaUsuario || f.nota || f.rating);
      
      const notaMedia = notasValidas.length > 0 
        ? (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1)
        : 0;
      
      // Contar por gênero
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
