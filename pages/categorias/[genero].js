import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModalAdicionarFilme from '../../components/AdiFilmesModal';
import NavegacaoFlutuante from '../../components/NavegacaoFlutuante';
import ServicoArmazenamentoLocal from '../../services/ArmLocalServico';
import styles from '../../styles/Categoria.module.css';

const obterNomeGenero = (genero) => {
  const mapeamentoGeneros = {
    'acao': 'Ação',
    'animacao': 'Animação',
    'comedia': 'Comédia',
    'documentario': 'Documentário',
    'drama': 'Drama',
    'fantasia': 'Fantasia',
    'ficcao': 'Ficção Científica',
    'romance': 'Romance',
    'suspense': 'Suspense',
    'terror': 'Terror'
  };

  return mapeamentoGeneros[genero] || genero.charAt(0).toUpperCase() + genero.slice(1);
};

export default function PaginaGenero() {
  const router = useRouter();
  const { genero } = router.query;
  const [modalAberto, setModalAberto] = useState(false);
  const [filmesAssistidos, setFilmesAssistidos] = useState([]);
  const [filmesFiltrados, setFilmesFiltrados] = useState([]);

  useEffect(() => {
    if (genero) {
      carregarFilmesAssistidos();
    }
  }, [genero]);

  const carregarFilmesAssistidos = () => {
    const filmes = ServicoArmazenamentoLocal.obterFilmesPorCategoria(genero);
    setFilmesAssistidos(filmes);
    setFilmesFiltrados(filmes);
  };

  const aoFilmeAdicionado = (filme) => {
    carregarFilmesAssistidos(); 
    setModalAberto(false);
    alert(`${filme.title} foi adicionado à categoria ${obterNomeGenero(genero)}!`);
  };

  const removerFilme = (idLocal) => {
    if (confirm('Tem certeza que deseja remover este filme?')) {
      ServicoArmazenamentoLocal.removerFilmeDaCategoria(genero, idLocal);
      carregarFilmesAssistidos();
    }
  };

  const renderizarEstrelas = (nota) => {
    const estrelas = [];
    const estrelasCompletas = Math.floor(nota / 2);
    const temMeiaEstrela = nota % 2 >= 1;
    
    for (let i = 0; i < estrelasCompletas; i++) {
      estrelas.push(<span key={i} className={styles.estrela}>★</span>);
    }
    
    if (temMeiaEstrela) {
      estrelas.push(<span key="meia" className={styles.meiaEstrela}>☆</span>);
    }
    
    return estrelas;
  };

  if (!genero) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.botaoVoltar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-arrow-left-icon lucide-circle-arrow-left">
          <circle cx="12" cy="12" r="10"/>
          <path d="m12 8-4 4 4 4"/>
          <path d="M16 12H8"/>
        </svg>
        Voltar para o Início
      </Link>

      <p className={styles.titulo}>
        Filmes de {obterNomeGenero(genero)}
      </p>

      <button 
        className={styles.botaoFlutuante}
        onClick={() => setModalAberto(true)}
        title="Adicionar filme a esta categoria"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-filter-plus-icon lucide-list-filter-plus">
          <path d="M10 18h4"/>
          <path d="M11 6H3"/>
          <path d="M15 6h6"/>
          <path d="M18 9V3"/>
          <path d="M7 12h8"/>
        </svg>
        Adicionar Filme
      </button>

      {filmesFiltrados.length > 0 && (
        <div className={styles.secaoAssistidos}>
          <div className={styles.filmesAssistidos}>
            {filmesFiltrados.map((filme) => (
              <div key={filme.idLocal} className={styles.cardFilmeAssistido}>
                <img 
                  src={filme.posterPath || '/assets/no-image.png'} 
                  alt={filme.title}
                  className={styles.posterAssistido}
                />
                <div className={styles.infoAssistido}>
                  <h4>{filme.title}</h4>
                  <div className={styles.avaliacaoUsuario}>
                    <div className={styles.estrelas}>
                      {renderizarEstrelas(filme.notaUsuario)}
                    </div>
                    <span className={styles.numeroAvaliacao}>
                      {filme.notaUsuario}/10
                    </span>
                  </div>
                  {filme.tagsUsuario && filme.tagsUsuario.length > 0 && (
                    <div className={styles.tags}>
                      {filme.tagsUsuario.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {filme.comentarioUsuario && (
                    <p className={styles.resenha}>"{filme.comentarioUsuario}"</p>
                  )}
                </div>
                <button
                  onClick={() => removerFilme(filme.idLocal)}
                  className={styles.botaoRemover}
                  title="Remover filme"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2">
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ModalAdicionarFilme 
        estaAberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoFilmeAdicionado={aoFilmeAdicionado}
        categoriaSelecionada={genero}
      />

      <NavegacaoFlutuante 
        filmesAssistidos={filmesAssistidos}
        aoFiltrarFilmes={setFilmesFiltrados}
      />
    </div>
  );
}