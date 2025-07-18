import servicoHibrido from './ServicoHibrido.js';
import pouchDBServico from './PouchDBServico.js';

class AdaptadorPouchDB {
  constructor() {
    this.inicializado = false;
    this.inicializando = false;
    this.promessaInicializacao = null;
  }

  async inicializar() {
    if (this.inicializado || this.inicializando) {
      return this.promessaInicializacao;
    }

    this.inicializando = true;
    this.promessaInicializacao = this._inicializarInterno();
    return this.promessaInicializacao;
  }

  async _inicializarInterno() {
    try {
      console.log('🔄 Inicializando AdaptadorPouchDB híbrido...');
      await servicoHibrido.inicializar();
      
      this.inicializado = true;
      console.log('✅ AdaptadorPouchDB híbrido inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar AdaptadorPouchDB:', error);
      throw error;
    } finally {
      this.inicializando = false;
    }
  }

  async aguardarInicializacao() {
    if (!this.inicializado) {
      await this.inicializar();
    }
  }

  async obterFilmesPorGenero(genero) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando array vazio');
      return [];
    }

    try {
      await this.aguardarInicializacao();
      return await servicoHibrido.obterFilmesPorGenero(genero);
    } catch (error) {
      console.error('❌ Erro no AdaptadorPouchDB:', error);
      return [];
    }
  }

  async adicionarFilme(genero, filme) {
    await this.aguardarInicializacao();
    return await servicoHibrido.adicionarFilme(genero, filme);
  }

  async removerFilme(genero, filmeId) {
    await this.aguardarInicializacao();
    return await servicoHibrido.removerFilme(genero, filmeId);
  }

  async atualizarFilme(genero, filmeAtualizado) {
    await this.aguardarInicializacao();
    return await servicoHibrido.atualizarFilme(genero, filmeAtualizado);
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando false');
      return false;
    }

    try {
      await this.aguardarInicializacao();
      return await servicoHibrido.verificarSeFilmeExiste(genero, filmeId);
    } catch (error) {
      console.error('❌ Erro no AdaptadorPouchDB:', error);
      return false;
    }
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

  async buscarFilmes(termo, genero = null) {
    await this.aguardarInicializacao();
    return await pouchDBServico.buscarFilmes(termo, genero);
  }

  async obterTodosFilmes() {
    await this.aguardarInicializacao();
    return await pouchDBServico.obterTodosFilmes();
  }

  async obterEstatisticas() {
    await this.aguardarInicializacao();
    return await servicoHibrido.obterEstatisticas();
  }

  obterStatus() {
    return servicoHibrido.obterStatus();
  }

  async obterTodosDados() {
    await this.aguardarInicializacao();
    return await servicoHibrido.obterTodosDados ? 
      await servicoHibrido.obterTodosDados() : 
      await pouchDBServico.obterTodosDados();
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
