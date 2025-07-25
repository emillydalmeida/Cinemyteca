import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotificacao } from '../../components/NotificacaoProvider';
import { useAuth } from '../../components/AuthProvider';
import ModalAdicionarFilme from '../../components/AdiFilmesModal';
import ModalConfirmacao from '../../components/ModalConfirmacao';
import NavegacaoFlutuante from '../../components/NavegacaoFlutuante';
import servicoFilmes from '../../services/ServicoFilmes';
import { useIsClient } from '../../hooks/useIsClient';
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
  const { isAdmin } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRemover, setModalRemover] = useState({ isOpen: false, filme: null });
  const [filmesAssistidos, setFilmesAssistidos] = useState([]);
  const [filmesFiltrados, setFilmesFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (genero && isClient) {
      carregarFilmesAssistidos();
    }
  }, [genero, isClient]);

  const carregarFilmesAssistidos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const filmes = await servicoFilmes.obterFilmesPorGenero(genero);
      
      setFilmesAssistidos(filmes);
      setFilmesFiltrados(filmes);
    } catch (error) {
      console.error('❌ Erro ao carregar filmes:', error);
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

  const abrirModalRemover = (filme) => {
    setModalRemover({ isOpen: true, filme });
  };

  const confirmarRemocaoFilme = async () => {
    const { filme } = modalRemover;
    if (!filme) return;

    try {
      console.log(`🗑️ Removendo filme: ${filme.title} (TMDB ID: ${filme.id})`);
      
      const sucesso = await servicoFilmes.removerFilme(genero, filme.id);
      
      if (sucesso) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await carregarFilmesAssistidos();
        mostrarSucesso('Filme removido com sucesso!');
      } else {
        mostrarErro('Falha ao remover filme. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      mostrarErro('Erro ao remover filme. Tente novamente.');
    }
  };

  const removerFilme = async (id) => {
    const filme = filmesAssistidos.find(f => f.id === id);
    if (!filme) {
      mostrarErro('Filme não encontrado.');
      return;
    }
    abrirModalRemover(filme);
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

  if (!isClient || !genero) {
    return (
      <div className={styles.container}>
        <div className={styles.carregando}>
          <p>Carregando...</p>
        </div>
      </div>
    );
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

      {isAdmin && (
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
      )}

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
              <div key={filme.id} className={styles.cardFilmeAssistido}>
                <img 
                  src={filme.posterPath || '/assets/no-image.svg'} 
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
                {isAdmin && (
                  <button
                    onClick={() => removerFilme(filme.id)}
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
                )}
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

      <ModalConfirmacao
        isOpen={modalRemover.isOpen}
        onClose={() => setModalRemover({ isOpen: false, filme: null })}
        onConfirm={confirmarRemocaoFilme}
        titulo="Remover Filme"
        mensagem={`Tem certeza que deseja remover "${modalRemover.filme?.title}" da sua lista? Esta ação não pode ser desfeita.`}
        textoConfirmar="Sim, Remover"
        textoCancelar="Cancelar"
        tipo="perigoso"
      />
    </div>
  );
}