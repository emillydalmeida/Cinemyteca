import pouchDBServico from './PouchDBServico.js';

class AdaptadorPouchDB {
  constructor() {
    this.inicializado = false;
    this.promessaInicializacao = this.inicializar();
  }

  async inicializar() {
    try {
      console.log('🔄 Inicializando AdaptadorPouchDB...');
      await pouchDBServico.aguardarInicializacao();
      console.log('✅ PouchDBServico aguardado com sucesso');
      
      await pouchDBServico.migrarDoLocalStorage();
      console.log('✅ Migração concluída com sucesso');
      
      this.inicializado = true;
      console.log('✅ AdaptadorPouchDB inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar AdaptadorPouchDB:', error);
      throw error;
    }
  }

  async aguardarInicializacao() {
    if (!this.inicializado) {
      await this.promessaInicializacao;
    }
  }

  async obterFilmesPorGenero(genero) {
    // Verifica se está no servidor (SSR)
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando array vazio');
      return [];
    }

    try {
      await this.aguardarInicializacao();
      return await pouchDBServico.obterFilmesPorGenero(genero);
    } catch (error) {
      console.error('❌ Erro no AdaptadorPouchDB:', error);
      return [];
    }
  }

  async adicionarFilme(genero, filme) {
    await this.aguardarInicializacao();
    return await pouchDBServico.adicionarFilme(genero, filme);
  }

  async removerFilme(genero, filmeId) {
    await this.aguardarInicializacao();
    return await pouchDBServico.removerFilme(genero, filmeId);
  }

  async atualizarFilme(genero, filmeAtualizado) {
    await this.aguardarInicializacao();
    return await pouchDBServico.atualizarFilme(genero, filmeAtualizado);
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    await this.aguardarInicializacao();
    return await pouchDBServico.verificarSeFilmeExiste(genero, filmeId);
  }

  
  async getItem(chave) {
    await this.aguardarInicializacao();
    
    const genero = chave.replace('cinemyteca_', '');
    const filmes = await pouchDBServico.obterFilmesPorGenero(genero);
    
    return filmes.length > 0 ? JSON.stringify(filmes) : null;
  }

  async setItem(chave, valor) {
    await this.aguardarInicializacao();
    
    try {
      const genero = chave.replace('cinemyteca_', '');
      const filmes = JSON.parse(valor);
      
      const filmesExistentes = await pouchDBServico.obterFilmesPorGenero(genero);
      for (const filme of filmesExistentes) {
        await pouchDBServico.removerFilme(genero, filme.id);
      }
      
      for (const filme of filmes) {
        await pouchDBServico.adicionarFilme(genero, filme);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro no setItem:', error);
      return false;
    }
  }

  configurarSincronizacao(urlRemota) {
    pouchDBServico.configurarSincronizacao(urlRemota);
  }

  async obterEstatisticas() {
    await this.aguardarInicializacao();
    return await pouchDBServico.obterEstatisticas();
  }

  async buscarFilmes(termo, genero = null) {
    await this.aguardarInicializacao();
    return await pouchDBServico.buscarFilmes(termo, genero);
  }

  async obterTodosFilmes() {
    await this.aguardarInicializacao();
    return await pouchDBServico.obterTodosFilmes();
  }

  async criarBackup() {
    await this.aguardarInicializacao();
    return await pouchDBServico.criarBackup();
  }

  async obterTodosDados() {
    await this.aguardarInicializacao();
    return await pouchDBServico.obterTodosDados();
  }

  async obterGeneros() {
    await this.aguardarInicializacao();
    return await pouchDBServico.obterGenerosComFilmes();
  }

  async limparTudo() {
    await this.aguardarInicializacao();
    return await pouchDBServico.limparTudo();
  }
}

const adaptadorPouchDB = new AdaptadorPouchDB();

export default adaptadorPouchDB;
