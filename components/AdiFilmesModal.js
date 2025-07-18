import { useState, useEffect } from 'react';
import { useNotificacao } from './NotificacaoProvider';
import ServicoTMDB from '../services/tmdbServico';
import ServicoArmazenamentoLocal from '../services/ArmLocalServico';
import styles from '../styles/AdiFilmeModal.module.css';

export default function ModalAdicionarFilme({ estaAberto, aoFechar, aoFilmeAdicionado, categoriaSelecionada }) {
  const { mostrarErro } = useNotificacao();
  const [buscaTexto, setBuscaTexto] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [filmeSelecionado, setFilmeSelecionado] = useState(null);
  const [estaBuscando, setEstaBuscando] = useState(false);
  const [dadosFilme, setDadosFilme] = useState({
    nota: '',
    tags: '',
    comentario: ''
  });
  const [erro, setErro] = useState('');

  const buscarFilmes = async (consulta) => {
    if (consulta.length < 2) {
      setResultadosBusca([]);
      return;
    }

    setEstaBuscando(true);
    setErro('');
    
    try {
      const resultados = await ServicoTMDB.buscarFilmes(consulta);
      setResultadosBusca(resultados);
    } catch (error) {
      const mensagemErro = 'Erro ao buscar filmes. Tente novamente.';
      setErro(mensagemErro);
      mostrarErro(mensagemErro);
      console.error(error);
    } finally {
      setEstaBuscando(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (buscaTexto) {
        buscarFilmes(buscaTexto);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [buscaTexto]);

  const selecionarFilme = (filme) => {
    setFilmeSelecionado(filme);
    setResultadosBusca([]);
    setBuscaTexto(filme.title);
  };

  const salvarFilme = async () => {
    if (!filmeSelecionado) {
      const mensagemErro = 'Selecione um filme primeiro';
      setErro(mensagemErro);
      mostrarErro(mensagemErro);
      return;
    }

    if (!dadosFilme.nota) {
      const mensagemErro = 'Adicione uma nota para o filme';
      setErro(mensagemErro);
      mostrarErro(mensagemErro);
      return;
    }

    try {
      const filmeParaSalvar = {
        ...filmeSelecionado,
        notaUsuario: parseFloat(dadosFilme.nota),
        tagsUsuario: dadosFilme.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        comentarioUsuario: dadosFilme.comentario
      };

      await ServicoArmazenamentoLocal.adicionarFilmeACategoria(categoriaSelecionada, filmeParaSalvar);
      aoFilmeAdicionado(filmeParaSalvar);
      fecharModal();
    } catch (error) {
      setErro(error.message);
      mostrarErro(error.message);
    }
  };

  const fecharModal = () => {
    setBuscaTexto('');
    setResultadosBusca([]);
    setFilmeSelecionado(null);
    setDadosFilme({ nota: '', tags: '', comentario: '' });
    setErro('');
    aoFechar();
  };

  if (!estaAberto) return null;

  return (
    <div className={styles.modalOverlay} onClick={fecharModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Adicionar Filme - {categoriaSelecionada?.charAt(0).toUpperCase() + categoriaSelecionada?.slice(1)}</h2>
          <button className={styles.closeButton} onClick={fecharModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x-icon lucide-circle-x">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {erro && <div className={styles.error}>{erro}</div>}

          <div className={styles.searchSection}>
            <label htmlFor="busca-filme">Buscar Filme:</label>
            <input
              id="busca-filme"
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Digite o nome do filme..."
              className={styles.searchInput}
            />
            
            {estaBuscando && <div className={styles.loading}>Buscando...</div>}
            
            {resultadosBusca.length > 0 && (
              <div className={styles.searchResults}>
                {resultadosBusca.map((filme) => (
                  <div
                    key={filme.id}
                    className={styles.searchResult}
                    onClick={() => selecionarFilme(filme)}
                  >
                    <img
                      src={filme.posterPath || '/assets/no-image.png'}
                      alt={filme.title}
                      className={styles.resultPoster}
                    />
                    <div className={styles.resultInfo}>
                      <h4>{filme.title}</h4>
                      <p>{filme.releaseDate?.split('-')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filmeSelecionado && (
            <div className={styles.selectedMovie}>
              <div className={styles.movieInfo}>
                <img
                  src={filmeSelecionado.posterPath || '/assets/no-image.png'}
                  alt={filmeSelecionado.title}
                  className={styles.selectedPoster}
                />
                <div>
                  <h3>{filmeSelecionado.title}</h3>
                  <p>{filmeSelecionado.releaseDate?.split('-')[0]}</p>
                  <p className={styles.overview}>{filmeSelecionado.overview}</p>
                </div>
              </div>

              <div className={styles.userInputs}>
                <div className={styles.inputGroup}>
                  <label htmlFor="nota">Sua Nota (0-10):</label>
                  <input
                    id="nota"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={dadosFilme.nota}
                    onChange={(e) => setDadosFilme({...dadosFilme, nota: e.target.value})}
                    className={styles.ratingInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="tags">Tags (separadas por vírgula):</label>
                  <input
                    id="tags"
                    type="text"
                    value={dadosFilme.tags}
                    onChange={(e) => setDadosFilme({...dadosFilme, tags: e.target.value})}
                    placeholder="ex: família, cinema, comédia romântica"
                    className={styles.tagsInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="comentario">Sua Opinião:</label>
                  <textarea
                    id="comentario"
                    value={dadosFilme.comentario}
                    onChange={(e) => setDadosFilme({...dadosFilme, comentario: e.target.value})}
                    placeholder="O que você achou do filme?"
                    className={styles.reviewTextarea}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={fecharModal} className={styles.cancelButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban">
              <circle cx="12" cy="12" r="10"/>
              <path d="m4.9 4.9 14.2 14.2"/>
            </svg>
            Cancelar
          </button>
          <button 
            onClick={salvarFilme} 
            className={styles.saveButton}
            disabled={!filmeSelecionado}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Salvar Filme
          </button>
        </div>
      </div>
    </div>
  );
}
