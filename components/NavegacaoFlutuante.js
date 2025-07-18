import { useState, useEffect, useRef } from 'react';
import styles from '../styles/NavegacaoFlutuante.module.css';

export default function NavegacaoFlutuante({ 
  filmesAssistidos = [], 
  aoFiltrarFilmes, 
  textoPlaceholder = "Pesquisar filmes..." 
}) {
  const [textoPesquisa, setTextoPesquisa] = useState('');
  const [filtroNota, setFiltroNota] = useState('');
  const [tagSelecionada, setTagSelecionada] = useState('');
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [modalTagAberto, setModalTagAberto] = useState(false);
  const [modalNotaAberto, setModalNotaAberto] = useState(false);
  
  const containerTagRef = useRef(null);
  const containerNotaRef = useRef(null);

  useEffect(() => {
    const todasTags = new Set();
    if (filmesAssistidos && filmesAssistidos.length > 0) {
      filmesAssistidos.forEach(filme => {
        if (filme.tagsUsuario && filme.tagsUsuario.length > 0) {
          filme.tagsUsuario.forEach(tag => todasTags.add(tag));
        }
      });
    }
    setTagsDisponiveis(Array.from(todasTags).sort());
  }, [filmesAssistidos]);

  useEffect(() => {
    if (!filmesAssistidos || !Array.isArray(filmesAssistidos)) {
      aoFiltrarFilmes([]);
      return;
    }

    let filmesFiltrados = filmesAssistidos;

    if (textoPesquisa) {
      filmesFiltrados = filmesFiltrados.filter(filme =>
        filme.title.toLowerCase().includes(textoPesquisa.toLowerCase()) ||
        (filme.comentarioUsuario && filme.comentarioUsuario.toLowerCase().includes(textoPesquisa.toLowerCase()))
      );
    }

    if (tagSelecionada) {
      filmesFiltrados = filmesFiltrados.filter(filme =>
        filme.tagsUsuario && filme.tagsUsuario.includes(tagSelecionada)
      );
    }

    if (filtroNota) {
      filmesFiltrados = filmesFiltrados.filter(filme => {
        const nota = filme.notaUsuario || 0;
        switch (filtroNota) {
          case '9-10': return nota >= 9;
          case '7-8': return nota >= 7 && nota < 9;
          case '5-6': return nota >= 5 && nota < 7;
          case '3-4': return nota >= 3 && nota < 5;
          case '1-2': return nota >= 1 && nota < 3;
          default: return true;
        }
      });
    }

    aoFiltrarFilmes(filmesFiltrados);
  }, [textoPesquisa, tagSelecionada, filtroNota, filmesAssistidos, aoFiltrarFilmes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerTagRef.current && !containerTagRef.current.contains(event.target)) {
        setModalTagAberto(false);
      }
      if (containerNotaRef.current && !containerNotaRef.current.contains(event.target)) {
        setModalNotaAberto(false);
      }
    };

    if (modalTagAberto || modalNotaAberto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [modalTagAberto, modalNotaAberto]);

  const limparFiltros = () => {
    setTextoPesquisa('');
    setTagSelecionada('');
    setFiltroNota('');
    setModalTagAberto(false);
    setModalNotaAberto(false);
  };

  return (
    <div className={styles.navegacaoFlutuante}>
      <div className={styles.containerPesquisa}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconePesquisa}>
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={textoPesquisa}
          onChange={(e) => setTextoPesquisa(e.target.value)}
          placeholder={textoPlaceholder}
          className={styles.campoPesquisa}
        />
        {textoPesquisa && (
          <button
            onClick={() => setTextoPesquisa('')}
            className={styles.botaoLimparPesquisa}
            title="Limpar pesquisa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
      </div>

      <div className={styles.containerFiltro} ref={containerTagRef}>
        <button 
          className={`${styles.botaoFiltro} ${tagSelecionada ? styles.ativo : ''}`}
          onClick={() => setModalTagAberto(!modalTagAberto)}
          title="Filtrar por tag"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
            <line x1="12" x2="12" y1="7" y2="13"/>
            <line x1="15" x2="9" y1="10" y2="10"/>
          </svg>
        </button>
        
        {modalTagAberto && (
          <div className={styles.dropdownFiltro}>
            <div className={styles.dropdownCustomizado}>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setTagSelecionada('');
                  setModalTagAberto(false);
                }}
              >
                Todas as tags
              </div>
              {tagsDisponiveis.map((tag, index) => (
                <div 
                  key={index} 
                  className={styles.opcaoDropdown}
                  onClick={() => {
                    setTagSelecionada(tag);
                    setModalTagAberto(false);
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.containerFiltro} ref={containerNotaRef}>
        <button 
          className={`${styles.botaoFiltro} ${filtroNota ? styles.ativo : ''}`}
          onClick={() => setModalNotaAberto(!modalNotaAberto)}
          title="Filtrar por nota"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
          </svg>
        </button>
        
        {modalNotaAberto && (
          <div className={styles.dropdownFiltro}>
            <div className={styles.dropdownCustomizado}>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('');
                  setModalNotaAberto(false);
                }}
              >
                Todas as notas
              </div>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('9-10');
                  setModalNotaAberto(false);
                }}
              >
                ★★★★★ (9-10)
              </div>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('7-8');
                  setModalNotaAberto(false);
                }}
              >
                ★★★★☆ (7-8)
              </div>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('5-6');
                  setModalNotaAberto(false);
                }}
              >
                ★★★☆☆ (5-6)
              </div>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('3-4');
                  setModalNotaAberto(false);
                }}
              >
                ★★☆☆☆ (3-4)
              </div>
              <div 
                className={styles.opcaoDropdown}
                onClick={() => {
                  setFiltroNota('1-2');
                  setModalNotaAberto(false);
                }}
              >
                ★☆☆☆☆ (1-2)
              </div>
            </div>
          </div>
        )}
      </div>

      {(textoPesquisa || tagSelecionada || filtroNota) && (
        <button 
          onClick={limparFiltros}
          className={styles.botaoLimpar}
          title="Limpar todos os filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}
