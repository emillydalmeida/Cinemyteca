import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotificacao } from '../../components/NotificacaoProvider';
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
  const { mostrarSucesso, mostrarErro } = useNotificacao();
  const [modalAberto, setModalAberto] = useState(false);
  const [filmesAssistidos, setFilmesAssistidos] = useState([]);
  const [filmesFiltrados, setFilmesFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    console.log('🔍 PouchDB disponível:', !!window.PouchDB);
    console.log('🔍 PouchDBFind disponível:', !!window.PouchDBFind);
  }, []);

  useEffect(() => {
    if (genero) {
      carregarFilmesAssistidos();
    }
  }, [genero]);

  const carregarFilmesAssistidos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      console.log('🔄 Carregando filmes para gênero:', genero);
      
      const filmes = await ServicoArmazenamentoLocal.obterFilmesPorCategoria(genero);
      console.log('✅ Filmes carregados:', filmes.length);
      
      setFilmesAssistidos(filmes);
      setFilmesFiltrados(filmes);
    } catch (error) {
      console.error('❌ Erro ao carregar filmes:', error);
      console.error('❌ Stack trace:', error.stack);
      setErro('Erro ao carregar filmes. Tente recarregar a página.');
      setFilmesAssistidos([]);
      setFilmesFiltrados([]);
    } finally {
      setCarregando(false);
    }
  };

  const aoFilmeAdicionado = async (filme) => {
    await carregarFilmesAssistidos(); 
    setModalAberto(false);
    mostrarSucesso(`${filme.title} foi adicionado à categoria ${obterNomeGenero(genero)}!`);
  };

  const removerFilme = async (idLocal) => {
    if (confirm('Tem certeza que deseja remover este filme?')) {
      try {
        await ServicoArmazenamentoLocal.removerFilmeDaCategoria(genero, idLocal);
        await carregarFilmesAssistidos();
        mostrarSucesso('Filme removido com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao remover filme:', error);
        mostrarErro('Erro ao remover filme. Tente novamente.');
      }
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

  if (carregando) {
    return (
      <div className={styles.container}>
        <div className={styles.carregando}>
          <p>Carregando filmes...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.container}>
        <Link href="/" className={`${styles.botaoPadrao} ${styles.botaoVoltar}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m12 8-4 4 4 4"/>
          <path d="M16 12H8"/>
          </svg>
          Voltar
        </Link>
        <div className={styles.erro}>
          <p>{erro}</p>
          <button 
            onClick={carregarFilmesAssistidos}
            className={styles.botaoPadrao}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={`${styles.botaoPadrao} ${styles.botaoVoltar}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="m12 8-4 4 4 4"/>
        <path d="M16 12H8"/>
        </svg>
        Voltar
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

      {filmesFiltrados.length === 0 ? (
        <div className={styles.secaoVazia}>
          <p className={styles.mensagemVazia}>
            Nenhum filme encontrado para {obterNomeGenero(genero)}.
          </p>
          <p className={styles.submensagemVazia}>
            Adicione seu primeiro filme clicando no botão acima!
          </p>
        </div>
      ) : (
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