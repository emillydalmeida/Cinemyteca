class ServicoArmazenamentoLocal {
  static CHAVE_ARMAZENAMENTO = 'cinemyteca_filmes_por_categoria';

  static obterFilmesPorCategoria(categoria) {
    try {
      const todosFilmes = localStorage.getItem(this.CHAVE_ARMAZENAMENTO);
      const filmesPorCategoria = todosFilmes ? JSON.parse(todosFilmes) : {};
      return filmesPorCategoria[categoria] || [];
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
      return [];
    }
  }

  static adicionarFilmeACategoria(categoria, dadosFilme) {
    try {
      const todosFilmes = localStorage.getItem(this.CHAVE_ARMAZENAMENTO);
      const filmesPorCategoria = todosFilmes ? JSON.parse(todosFilmes) : {};
      
      if (!filmesPorCategoria[categoria]) {
        filmesPorCategoria[categoria] = [];
      }
      
      const filmeComId = {
        ...dadosFilme,
        assistidoEm: new Date().toISOString(),
        idLocal: Date.now() 
      };

      const existe = filmesPorCategoria[categoria].find(filme => filme.id === dadosFilme.id);
      if (existe) {
        throw new Error('Este filme já foi adicionado a esta categoria!');
      }
      
      filmesPorCategoria[categoria].push(filmeComId);
      localStorage.setItem(this.CHAVE_ARMAZENAMENTO, JSON.stringify(filmesPorCategoria));
      return filmeComId;
    } catch (error) {
      console.error('Erro ao adicionar filme:', error);
      throw error;
    }
  }

  static removerFilmeDaCategoria(categoria, idLocal) {
    try {
      const todosFilmes = localStorage.getItem(this.CHAVE_ARMAZENAMENTO);
      const filmesPorCategoria = todosFilmes ? JSON.parse(todosFilmes) : {};
      
      if (filmesPorCategoria[categoria]) {
        filmesPorCategoria[categoria] = filmesPorCategoria[categoria].filter(
          filme => filme.idLocal !== idLocal
        );
        localStorage.setItem(this.CHAVE_ARMAZENAMENTO, JSON.stringify(filmesPorCategoria));
      }
      
      return filmesPorCategoria[categoria] || [];
    } catch (error) {
      console.error('Erro ao remover filme:', error);
      throw error;
    }
  }
}

export default ServicoArmazenamentoLocal;
