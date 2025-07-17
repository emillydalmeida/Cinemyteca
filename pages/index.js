import Link from "next/link"
import styles from "../styles/Home.module.css"

export default function Home() {
    return (
        <>
            <header>
                <h1>Bem-vindo  à  Cin<span style="color: #F564A9;">emy</span>teca</h1>
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