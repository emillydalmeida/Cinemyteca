import Link from "next/link"
import { useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import { useAuth } from '../components/AuthProvider';
import ModalConfirmacao from '../components/ModalConfirmacao';
import ModalLogin from '../components/ModalLogin';
import servicoFilmes from '../services/ServicoFilmes';
import styles from "../styles/Home.module.css"

export default function Home() {
    const { mostrarSucesso, mostrarErro, mostrarInfo } = useNotificacao();
    const { usuario, isAdmin, logout } = useAuth();
    const [modalLimparDuplicatas, setModalLimparDuplicatas] = useState(false);
    const [modalLogin, setModalLogin] = useState(false);

    const mostrarEstatisticas = async () => {
        try {
            const stats = await servicoFilmes.obterEstatisticas();
            const mensagem = `Estatísticas da Cinemyteca:

            Total de filmes: ${stats.totalFilmes}
            Nota média: ${stats.notaMedia}

            Por gênero:
            ${Object.entries(stats.porGenero).map(([gen, count]) => `${gen}: ${count} filmes`).join('\n')}`;
            
            mostrarInfo(mensagem, 10000); 
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            mostrarErro('Erro ao obter estatísticas. Tente novamente.');
        }
    };

    const abrirModalLimparDuplicatas = () => {
        setModalLimparDuplicatas(true);
    };

    const confirmarLimparDuplicatas = async () => {
        try {
            mostrarInfo('Limpando duplicatas... Isso pode levar alguns segundos.');
            const sucesso = await servicoFilmes.limparDuplicatas();
            if (sucesso) {
                mostrarSucesso('Duplicatas removidas com sucesso!');
            } else {
                mostrarErro('Erro ao limpar duplicatas. Verifique a conexão.');
            }
        } catch (error) {
            console.error('❌ Erro ao limpar duplicatas:', error);
            mostrarErro('Erro ao limpar duplicatas. Tente novamente.');
        }
    };

    const handleLogout = async () => {
        const resultado = await logout();
        if (resultado.sucesso) {
            mostrarSucesso('Logout realizado com sucesso! 👋');
        } else {
            mostrarErro('Erro ao sair');
        }
    };

    return (
        <>
            <div className={styles.botoesUtilidades}>
                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={mostrarEstatisticas}
                    title="Ver estatísticas"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M18 17V9"/>
                        <path d="M13 17V5"/>
                        <path d="M8 17v-3"/>
                    </svg>
                    Estatísticas
                </button>

                {isAdmin && (
                    <button 
                        className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                        onClick={abrirModalLimparDuplicatas}
                        title="Limpar filmes duplicados"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Limpar Duplicatas
                    </button>
                )}

                {isAdmin ? (
                    <button 
                        className={`${styles.botaoPadrao} ${styles.botaoSair}`}
                        onClick={handleLogout}
                        title="Sair da conta admin"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16,17 21,12 16,7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sair
                    </button>
                ) : (
                    <button 
                        className={`${styles.botaoPadrao} ${styles.botaoLogin}`}
                        onClick={() => setModalLogin(true)}
                        title="Entrar como admin"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10,17 15,12 10,7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Admin
                    </button>
                )}
            </div>

            <header>
                <h1>Bem-vindo  à  Cin<a href="https://github.com/emillydalmeida" target="_blank" rel="noopener noreferrer"><span className={styles.destaque}>emy</span></a>teca</h1>
                {!isAdmin && (
                    <p className={styles.subtitulo}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-popcorn-icon lucide-popcorn">
                            <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4"/><path d="M10 22 9 8"/><path d="m14 22 1-14"/><path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z"/>
                        </svg> 
                        Portfólio público de filmes assistidos por Emilly
                    </p>
                )}
            </header>

            <main>
                <p>{isAdmin ? 'Escolha um gênero para gerenciar' : 'Explore os filmes por gênero'}</p>
                <nav className={styles.menuGeneros}>
                    <Link href="/categorias/acao" className={styles.generos}>
                        <img src="/assets/acao.webp" />
                        <span>Ação</span>
                    </Link>
                    <Link href="/categorias/animacao" className={styles.generos}>
                        <img src="/assets/animacao.jpg" />
                        <span>Animação</span>
                    </Link>
                    <Link href="/categorias/comedia" className={styles.generos}>
                        <img src="/assets/comedia.jpg" />
                        <span>Comédia</span>
                    </Link>
                    <Link href="/categorias/documentario" className={styles.generos}>
                        <img src="/assets/documentario.jpg" />
                        <span>Documentário</span>
                    </Link>
                    <Link href="/categorias/drama" className={styles.generos}>
                        <img src="/assets/drama.jpg" />
                        <span>Drama</span>
                    </Link>
                    <Link href="/categorias/fantasia" className={styles.generos}>
                        <img src="/assets/fantasia.webp" />
                        <span>Fantasia</span>
                    </Link>
                    <Link href="/categorias/ficcao" className={styles.generos}>
                        <img src="/assets/ficcao.webp" />
                        <span>Ficção Científica</span>
                    </Link>
                    <Link href="/categorias/romance" className={styles.generos}>
                        <img src="/assets/romance.webp" />
                        <span>Romance</span>
                    </Link>
                    <Link href="/categorias/suspense" className={styles.generos}>
                        <img src="/assets/suspense.jpg" />
                        <span>Suspense</span>
                    </Link>
                    <Link href="/categorias/terror" className={styles.generos}>
                        <img src="/assets/terror.jpg" />
                        <span>Terror</span>
                    </Link>
                </nav>
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2025 Cinemyteca. Desenvolvido por <a href="https://github.com/emillydalmeida" target="_blank" rel="noopener noreferrer"><span className={styles.destaque}>Emilly Efanny</span></a>.</p>
            </footer>

            <ModalConfirmacao
                isOpen={modalLimparDuplicatas}
                onClose={() => setModalLimparDuplicatas(false)}
                onConfirm={confirmarLimparDuplicatas}
                titulo="Limpar Duplicatas"
                mensagem="Tem certeza que deseja limpar todas as duplicatas? Esta ação irá remover filmes duplicados do banco de dados e não pode ser desfeita."
                textoConfirmar="Sim, Limpar"
                textoCancelar="Cancelar"
                tipo="perigoso"
            />

            <ModalLogin
                isOpen={modalLogin}
                onClose={() => setModalLogin(false)}
            />
        </>
    );
}