import Link from "next/link"
import { useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import StatusSincronizacao from '../components/StatusSincronizacao';
import ModalConfirmacao from '../components/ModalConfirmacao';
import ServicoArmazenamentoLocal from '../services/ArmLocalServico';
import servicoSupabase from '../services/SupabaseServico';
import styles from "../styles/Home.module.css"

export default function Home() {
    const { mostrarSucesso, mostrarErro, mostrarInfo } = useNotificacao();
    const [modalLimparDuplicatas, setModalLimparDuplicatas] = useState(false);

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

    const debugBancoDados = async () => {
        try {
            console.log('🔍 Iniciando debug COMPLETO do banco de dados...');
            
            // 1. Verifica dados do ArmLocalServico
            console.log('📊 === DADOS DO ArmLocalServico ===');
            const filmesAdaptador = await ServicoArmazenamentoLocal.obterTodosFilmes();
            console.log('📊 Filmes do Adaptador:', filmesAdaptador);
            
            if (filmesAdaptador && Object.keys(filmesAdaptador).length > 0) {
                Object.entries(filmesAdaptador).forEach(([genero, filmes]) => {
                    console.log(`🎬 Gênero ${genero}:`, filmes.length, 'filmes');
                    filmes.forEach((filme, index) => {
                        console.log(`  ${index + 1}. ${filme.title} (ID: ${filme.id}, Local: ${filme.idLocal})`);
                    });
                });
            }
            
            // 2. Verifica dados diretos do AdaptadorPouchDB
            console.log('📊 === DADOS DO AdaptadorPouchDB ===');
            const { default: adaptadorPouchDB } = await import('../services/AdaptadorPouchDB.js');
            const filmesAdaptadorDireto = await adaptadorPouchDB.obterTodosFilmes();
            console.log('📊 Filmes do AdaptadorPouchDB:', filmesAdaptadorDireto);
            
            // 3. Verifica dados diretos do ServicoHibrido
            console.log('📊 === DADOS DO ServicoHibrido ===');
            const { default: servicoHibrido } = await import('../services/ServicoHibrido.js');
            
            // Testa cada gênero individualmente
            const generos = ['acao', 'animacao', 'comedia', 'drama', 'terror', 'suspense', 'romance', 'fantasia', 'ficcao', 'documentario'];
            for (const genero of generos) {
                const filmesGenero = await servicoHibrido.obterFilmesPorGenero(genero);
                if (filmesGenero && filmesGenero.length > 0) {
                    console.log(`🎭 ServicoHibrido - ${genero}:`, filmesGenero.length, 'filmes');
                    filmesGenero.forEach((filme, index) => {
                        console.log(`  ${index + 1}. ${filme.title} (ID: ${filme.id}, Local: ${filme.idLocal})`);
                    });
                }
            }
            
            // 4. Verifica estatísticas
            console.log('📊 === ESTATÍSTICAS ===');
            const stats = await ServicoArmazenamentoLocal.obterEstatisticas();
            console.log('📊 Estatísticas:', stats);
            
            mostrarInfo('Debug COMPLETO concluído! Verifique o console do navegador.');
        } catch (error) {
            console.error('❌ Erro ao fazer debug:', error);
            mostrarErro('Erro ao fazer debug. Tente novamente.');
        }
    };

    const limparTudoCompletamente = async () => {
        try {
            mostrarInfo('Limpando TUDO completamente... Isso pode levar alguns segundos.');
            console.log('🧹 Iniciando limpeza COMPLETA...');
            
            // 1. Limpa via ArmLocalServico
            console.log('🧹 Limpando via ArmLocalServico...');
            await ServicoArmazenamentoLocal.limparTudo();
            
            // 2. Limpa via AdaptadorPouchDB
            console.log('🧹 Limpando via AdaptadorPouchDB...');
            const { default: adaptadorPouchDB } = await import('../services/AdaptadorPouchDB.js');
            await adaptadorPouchDB.limparTudo();
            
            // 3. Limpa via PouchDBServico
            console.log('🧹 Limpando via PouchDBServico...');
            const { default: pouchDBServico } = await import('../services/PouchDBServico.js');
            await pouchDBServico.limparTudo();
            
            // 4. Limpa localStorage
            console.log('🧹 Limpando localStorage...');
            if (typeof window !== 'undefined') {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.includes('cinemyteca') || key.includes('pouchdb') || key.includes('filme')) {
                        localStorage.removeItem(key);
                        console.log(`  🗑️ Removida chave: ${key}`);
                    }
                });
            }
            
            // 5. Aguarda um pouco para tudo processar
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('🎉 Limpeza COMPLETA concluída!');
            mostrarSucesso('Limpeza COMPLETA concluída! Todos os dados foram removidos.');
            
        } catch (error) {
            console.error('❌ Erro ao limpar tudo:', error);
            mostrarErro('Erro ao limpar tudo. Tente novamente.');
        }
    };

    const limparDuplicatasLocais = async () => {
        try {
            mostrarInfo('Limpando duplicatas locais... Isso pode levar alguns segundos.');
            console.log('🧹 Iniciando limpeza de duplicatas locais...');
            
            // Busca todos os filmes
            const todosFilmes = await ServicoArmazenamentoLocal.obterTodosFilmes();
            
            if (!todosFilmes || Object.keys(todosFilmes).length === 0) {
                mostrarInfo('Nenhum filme encontrado para limpar.');
                return;
            }

            let totalRemovidos = 0;
            
            // Para cada gênero
            for (const [genero, filmes] of Object.entries(todosFilmes)) {
                console.log(`🎭 Processando gênero: ${genero} (${filmes.length} filmes)`);
                
                // Agrupa filmes por TMDB ID
                const filmesAgrupados = {};
                filmes.forEach(filme => {
                    const tmdbId = filme.id;
                    if (!filmesAgrupados[tmdbId]) {
                        filmesAgrupados[tmdbId] = [];
                    }
                    filmesAgrupados[tmdbId].push(filme);
                });
                
                // Para cada grupo de filmes com mesmo TMDB ID
                for (const [tmdbId, grupoFilmes] of Object.entries(filmesAgrupados)) {
                    if (grupoFilmes.length > 1) {
                        console.log(`🔄 Filme "${grupoFilmes[0].title}" tem ${grupoFilmes.length} duplicatas`);
                        
                        // Mantém apenas o primeiro filme (mais recente ou com mais dados)
                        const filmeParaManter = grupoFilmes.find(f => f.idLocal) || grupoFilmes[0];
                        
                        // Remove todas as outras cópias
                        for (const filme of grupoFilmes) {
                            if (filme !== filmeParaManter) {
                                try {
                                    await ServicoArmazenamentoLocal.removerFilmeDaCategoria(genero, filme.id);
                                    totalRemovidos++;
                                    console.log(`  ✅ Removida duplicata: ${filme.title} (Local: ${filme.idLocal})`);
                                } catch (error) {
                                    console.warn(`  ⚠️ Erro ao remover duplicata:`, error);
                                }
                            }
                        }
                    }
                }
            }
            
            console.log(`🎉 Limpeza concluída! ${totalRemovidos} duplicatas removidas.`);
            mostrarSucesso(`Limpeza concluída! ${totalRemovidos} duplicatas removidas.`);
            
        } catch (error) {
            console.error('❌ Erro ao limpar duplicatas locais:', error);
            mostrarErro('Erro ao limpar duplicatas locais. Tente novamente.');
        }
    };

    const abrirModalLimparDuplicatas = () => {
        setModalLimparDuplicatas(true);
    };

    const confirmarLimparDuplicatas = async () => {
        try {
            mostrarInfo('Limpando duplicatas... Isso pode levar alguns segundos.');
            const sucesso = await servicoSupabase.limparDuplicatas();
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

    return (
        <>
            <StatusSincronizacao />
            <div className={styles.botoesUtilidades}>
                
                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={debugBancoDados}
                    title="Debug completo do banco de dados"
                >
                    🔍 Debug
                </button>

                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={limparTudoCompletamente}
                    title="Limpar TUDO completamente"
                    style={{ backgroundColor: '#ff4757', color: 'white' }}
                >
                    🔥 Zerar Tudo
                </button>

                <button 
                    className={`${styles.botaoPadrao} ${styles.botaoUtilidade}`}
                    onClick={limparDuplicatasLocais}
                    title="Limpar duplicatas locais"
                >
                    🧹 Limpar Local
                </button>

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
        </>
    );
}