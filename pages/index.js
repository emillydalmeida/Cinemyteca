import Link from "next/link"
import { useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import StatusSincronizacao from '../components/StatusSincronizacao';
import ServicoArmazenamentoLocal from '../services/ArmLocalServico';
import styles from "../styles/Home.module.css"

export default function Home() {
    const { mostrarSucesso, mostrarErro, mostrarInfo } = useNotificacao();

    const criarBackup = async () => {
        try {
            await ServicoArmazenamentoLocal.criarBackup();
            mostrarSucesso('Backup criado com sucesso! Arquivo baixado.');
        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            mostrarErro('Erro ao criar backup. Tente novamente.');
        }
    };

    const mostrarEstatisticas = async () => {
        try {
            const stats = await ServicoArmazenamentoLocal.obterEstatisticas();
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
    return (
        <>
            <StatusSincronizacao />
            <div className={styles.botoesUtilidades}>
                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={criarBackup}
                    title="Criar backup dos filmes"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"/>
                        <path d="M3 12a9 3 0 0 0 5 2.69"/>
                        <path d="M21 9.3V5"/>
                        <path d="M3 5v14a9 3 0 0 0 6.47 2.88"/>
                        <path d="M12 12v4h4"/>
                        <path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"/>
                    </svg>
                    Backup
                </button>
                
                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={mostrarEstatisticas}
                    title="Ver estatísticas"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                        <path d="M7 16h8"/>
                        <path d="M7 11h12"/>
                        <path d="M7 6h3"/>
                    </svg>
                    Stats
                </button>
            </div>

            <header>
                <h1>Bem-vindo  à  Cin<span className={styles.destaque}>emy</span>teca</h1>
            </header>

            <main>
                <p> Escolha um gênero</p>
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

            <footer>
                <p>&copy; 2025 Cinemyteca. Desenvolvido por Emilly Efanny.</p>
            </footer>
        </>
    );
}