class PouchDBServico {
  constructor() {
    this.inicializado = false;
    this.bancoLocal = null;
    this.bancoRemoto = null;
    this.sincronizando = false;
    
    if (typeof window !== 'undefined') {
      this.promessaInicializacao = this.inicializar();
    }
  }

  async inicializar() {
    try {
      if (this.inicializado && this.bancoLocal) {
        console.log('✅ PouchDBServico já está inicializado');
        return;
      }
      
      let tentativas = 0;
      const maxTentativas = 100; 
      
      while (!window.PouchDB && tentativas < maxTentativas) {
        await new Promise(resolve => setTimeout(resolve, 100));
        tentativas++;
      }
      
      if (!window.PouchDB) {
        throw new Error('PouchDB não foi carregado após 10 segundos');
      }
      
      if (window.PouchDBFind) {
        window.PouchDB.plugin(window.PouchDBFind);
      }
      
      this.bancoLocal = new window.PouchDB('cinemyteca_filmes');
      
      if (!this.bancoLocal) {
        throw new Error('Falha ao criar instância do banco local');
      }
      
      this.bancoRemoto = null;
      this.sincronizando = false;
      
      await this.inicializarIndices();
      this.inicializado = true;
      
      console.log('✅ PouchDBServico inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar PouchDBServico:', error);
      this.inicializado = false;
      this.bancoLocal = null;
      throw error;
    }
  }

  async aguardarInicializacao() {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      if (this.promessaInicializacao) {
        await this.promessaInicializacao;
      }
      
      if (!this.inicializado) {
        await this.inicializar();
      }
      
      if (!this.bancoLocal) {
        throw new Error('bancoLocal não está disponível após inicialização');
      }
    } catch (error) {
      console.error('❌ Erro ao aguardar inicialização:', error);
      throw error;
    }
  }

  async inicializarIndices() {
    try {
      console.log('✅ Usando estrutura de dados baseada em chaves (sem índices)');
    } catch (error) {
      console.error('❌ Erro ao inicializar estrutura:', error);
    }
  }

  async configurarSincronizacao(urlRemota) {
    await this.aguardarInicializacao();
    try {
      this.bancoRemoto = new window.PouchDB(urlRemota);
      
      this.sincronizacao = this.bancoLocal.sync(this.bancoRemoto, {
        live: true,
        retry: true
      }).on('change', (info) => {
        console.log('🔄 Sincronização:', info);
      }).on('paused', () => {
        console.log('⏸️ Sincronização pausada');
      }).on('active', () => {
        console.log('▶️ Sincronização ativa');
      }).on('error', (err) => {
        console.error('❌ Erro na sincronização:', err);
      });
      
      console.log('✅ Sincronização configurada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao configurar sincronização:', error);
    }
  }

  async obterFilmesPorGenero(genero) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando array vazio');
      return [];
    }

    await this.aguardarInicializacao();
    try {
      if (!this.bancoLocal) {
        throw new Error('Banco local não está inicializado');
      }

      const resultado = await this.bancoLocal.allDocs({ 
        include_docs: true,
        startkey: `${genero}_`,
        endkey: `${genero}_\ufff0`
      });
      
      const filmes = resultado.rows
        .map(row => row.doc)
        .filter(doc => doc.genero === genero)
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      
      console.log(`✅ Encontrados ${filmes.length} filmes para gênero ${genero}`);
      return filmes;
    } catch (error) {
      console.error('❌ Erro ao obter filmes por gênero:', error);
      throw new Error('Erro ao buscar filmes');
    }
  }

  async adicionarFilme(genero, filme) {
    if (typeof window === 'undefined') {
      throw new Error('Não é possível adicionar filmes no servidor');
    }

    await this.aguardarInicializacao();
    try {
      if (!this.bancoLocal) {
        throw new Error('Banco local não está inicializado');
      }

      const documento = {
        _id: `${genero}_${filme.id}_${Date.now()}`,
        genero: genero,
        ...filme,
        dataAdicao: new Date().toISOString()
      };
      
      const resultado = await this.bancoLocal.put(documento);
      console.log('✅ Filme adicionado:', filme.title);
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao adicionar filme:', error);
      throw error;
    }
  }

  async removerFilme(genero, filmeId) {
    await this.aguardarInicializacao();
    try {
      const resultado = await this.bancoLocal.allDocs({ 
        include_docs: true,
        startkey: `${genero}_`,
        endkey: `${genero}_\ufff0`
      });
      
      const documentos = resultado.rows.map(row => row.doc);
      
      const filmeIdStr = String(filmeId);
      const filmeIdNum = Number(filmeId);
      
      const filmeDoc = documentos.find(doc => {
        // Verifica se é o gênero correto
        if (doc.genero !== genero) return false;
        
        // Compara com diferentes tipos e campos
        const matchId = doc.id === filmeId || String(doc.id) === filmeIdStr || Number(doc.id) === filmeIdNum;
        const matchIdLocal = doc.idLocal === filmeId || String(doc.idLocal) === filmeIdStr || Number(doc.idLocal) === filmeIdNum;
        
        return matchId || matchIdLocal;
      });
      
      if (filmeDoc) {
        await this.bancoLocal.remove(filmeDoc);
        console.log('✅ Filme removido com sucesso');
        return true;
      } else {
        console.log('❌ Filme não encontrado para remoção');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      return false;
    }
  }

  async atualizarFilme(genero, filmeAtualizado) {
    await this.aguardarInicializacao();
    try {
      const resultado = await this.bancoLocal.allDocs({ 
        include_docs: true,
        startkey: `${genero}_`,
        endkey: `${genero}_\ufff0`
      });
      
      const filmeDoc = resultado.rows
        .map(row => row.doc)
        .find(doc => doc.genero === genero && doc.id === filmeAtualizado.id);
      
      if (filmeDoc) {
        const documentoAtualizado = {
          ...filmeDoc,
          ...filmeAtualizado,
          dataAtualizacao: new Date().toISOString()
        };
        
        await this.bancoLocal.put(documentoAtualizado);
        console.log('✅ Filme atualizado:', filmeAtualizado.title);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar filme:', error);
      return false;
    }
  }

  async obterGenerosComFilmes() {
    try {
      const resultado = await this.bancoLocal.allDocs({ include_docs: true });
      const generos = new Set();
      
      resultado.rows.forEach(row => {
        if (row.doc.genero) {
          generos.add(row.doc.genero);
        }
      });
      
      return Array.from(generos).sort();
    } catch (error) {
      console.error('❌ Erro ao obter gêneros:', error);
      return [];
    }
  }

  async obterEstatisticas() {
    try {
      const resultado = await this.bancoLocal.allDocs({ include_docs: true });
      const filmes = resultado.rows.map(row => row.doc);
      
      const estatisticas = {
        totalFilmes: filmes.length,
        porGenero: {},
        notaMedia: 0
      };
      
      let somaNotas = 0;
      let filmesComNota = 0;
      
      filmes.forEach(filme => {
        if (filme.genero) {
          estatisticas.porGenero[filme.genero] = 
            (estatisticas.porGenero[filme.genero] || 0) + 1;
        }
        
        if (filme.notaUsuario && filme.notaUsuario > 0) {
          somaNotas += filme.notaUsuario;
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

  async buscarFilmes(termo, genero = null) {
    try {
      let resultado;
      if (genero) {
        resultado = await this.bancoLocal.allDocs({ 
          include_docs: true,
          startkey: `${genero}_`,
          endkey: `${genero}_\ufff0`
        });
      } else {
        resultado = await this.bancoLocal.allDocs({ include_docs: true });
      }
      
      let filmes = resultado.rows
        .map(row => row.doc)
        .filter(doc => !genero || doc.genero === genero);
      
      if (termo) {
        const termoLower = termo.toLowerCase();
        filmes = filmes.filter(filme => 
          filme.title?.toLowerCase().includes(termoLower) ||
          filme.comentarioUsuario?.toLowerCase().includes(termoLower) ||
          filme.tagsUsuario?.some(tag => tag.toLowerCase().includes(termoLower))
        );
      }
      
      return filmes;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return [];
    }
  }

  async migrarDoLocalStorage() {
    try {
      console.log('🔄 Iniciando migração do localStorage...');
      
      await this.aguardarInicializacao();
      
      if (!this.bancoLocal) {
        console.error('❌ Banco local não disponível para migração');
        return;
      }
      
      let filmesMigrados = 0;
      
      const migracaoInfo = await this.bancoLocal.get('migracao_localStorage_concluida').catch(() => null);
      if (migracaoInfo) {
        console.log('✅ Migração já foi realizada anteriormente');
        return;
      }
      
      const generos = [
        'acao', 'animacao', 'comedia', 'documentario', 'drama',
        'fantasia', 'ficcao', 'romance', 'suspense', 'terror'
      ];
      
      for (const genero of generos) {
        const chave = `cinemyteca_${genero}`;
        const dadosLS = localStorage.getItem(chave);
        
        if (dadosLS) {
          try {
            const filmes = JSON.parse(dadosLS);
            
            for (const filme of filmes) {
              await this.adicionarFilme(genero, filme);
              filmesMigrados++;
            }
            
            console.log(`✅ Migrados ${filmes.length} filmes de ${genero}`);
          } catch (error) {
            console.error(`❌ Erro ao migrar ${genero}:`, error);
          }
        }
      }
      
      await this.bancoLocal.put({
        _id: 'migracao_localStorage_concluida',
        concluida: true,
        data: new Date().toISOString(),
        filmesMigrados: filmesMigrados
      });
      
      console.log(`✅ Migração concluída! ${filmesMigrados} filmes migrados`);
    } catch (error) {
      console.error('❌ Erro na migração:', error);
    }
  }

  async obterTodosFilmes() {
    await this.aguardarInicializacao();
    try {
      const resultado = await this.bancoLocal.allDocs({ include_docs: true });
      const filmesPorGenero = {};
      
      resultado.rows.forEach(row => {
        const filme = row.doc;
        if (filme.genero) {
          if (!filmesPorGenero[filme.genero]) {
            filmesPorGenero[filme.genero] = [];
          }
          filmesPorGenero[filme.genero].push(filme);
        }
      });
      
      return filmesPorGenero;
    } catch (error) {
      console.error('❌ Erro ao obter todos os filmes:', error);
      return {};
    }
  }

  async obterTodosDados() {
    await this.aguardarInicializacao();
    try {
      const resultado = await this.bancoLocal.allDocs({ include_docs: true });
      return {
        versao: '1.0',
        data: new Date().toISOString(),
        totalFilmes: resultado.rows.length,
        filmes: resultado.rows.map(row => row.doc)
      };
    } catch (error) {
      console.error('❌ Erro ao obter todos os dados:', error);
      return { versao: '1.0', data: new Date().toISOString(), totalFilmes: 0, filmes: [] };
    }
  }

  async criarBackup() {
    try {
      const resultado = await this.bancoLocal.allDocs({ include_docs: true });
      const backup = {
        versao: '1.0',
        data: new Date().toISOString(),
        filmes: resultado.rows.map(row => row.doc)
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cinemyteca_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('✅ Backup criado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
    }
  }

  async verificarSeFilmeExiste(genero, filmeId) {
    if (typeof window === 'undefined') {
      console.log('🔍 Rodando no servidor, retornando false');
      return false;
    }

    await this.aguardarInicializacao();
    try {
      if (!this.bancoLocal) {
        throw new Error('Banco local não está inicializado');
      }

      const resultado = await this.bancoLocal.allDocs({ 
        include_docs: true,
        startkey: `${genero}_`,
        endkey: `${genero}_\ufff0`
      });
      
      const filmeExiste = resultado.rows
        .map(row => row.doc)
        .some(doc => doc.genero === genero && (doc.id === filmeId || doc.idLocal === filmeId));
      
      return filmeExiste;
    } catch (error) {
      console.error('❌ Erro ao verificar se filme existe:', error);
      return false;
    }
  }

  async limparTudo() {
    await this.aguardarInicializacao();
    try {
      await this.bancoLocal.destroy();
      this.bancoLocal = new window.PouchDB('cinemyteca_filmes');
      console.log('✅ Banco de dados limpo e recriado');
    } catch (error) {
      console.error('❌ Erro ao limpar banco:', error);
      throw error;
    }
  }
}

const pouchDBServico = new PouchDBServico();

export default pouchDBServico;
