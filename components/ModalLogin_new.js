import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNotificacao } from './NotificacaoProvider';
import styles from '../styles/ModalLogin.module.css';

export default function ModalLogin({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const { mostrarSucesso, mostrarErro } = useNotificacao();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      mostrarErro('Preencha email e senha');
      return;
    }

    setCarregando(true);
    try {
      const resultado = await login(email, senha);
      
      if (resultado.sucesso) {
        mostrarSucesso('Login realizado com sucesso! 🎬');
        onClose();
        setEmail('');
        setSenha('');
      } else {
        mostrarErro(resultado.erro);
      }
    } catch (error) {
      mostrarErro('Erro inesperado no login');
    } finally {
      setCarregando(false);
    }
  };

  const fecharModal = () => {
    setEmail('');
    setSenha('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={fecharModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconHeader}>
            <circle cx="10" cy="7" r="4"/>
            <path d="M10.3 15H7a4 4 0 0 0-4 4v2"/>
            <path d="M15 15.5V14a2 2 0 0 1 4 0v1.5"/>
            <rect width="8" height="5" x="13" y="16" rx=".899"/>
          </svg>
          <h2>Acesso Admin</h2>
          <p>Entre para gerenciar a Cinemyteca</p>
          <button 
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.campo}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={carregando}
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              disabled={carregando}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.botaoLogin}
            disabled={carregando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
              <path d="m21 2-9.6 9.6"/>
              <circle cx="7.5" cy="15.5" r="5.5"/>
            </svg>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.nota}>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconNota}>
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <strong>Portfólio Público:</strong> Qualquer pessoa pode visualizar os filmes
          </p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconNota}>
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
            <strong>Visitantes:</strong> Podem navegar e ver todos os filmes
          </p>
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconNota}>
              <circle cx="10" cy="7" r="4"/>
              <path d="M10.3 15H7a4 4 0 0 0-4 4v2"/>
              <path d="M15 15.5V14a2 2 0 0 1 4 0v1.5"/>
              <rect width="8" height="5" x="13" y="16" rx=".899"/>
            </svg>
            <strong>Admin:</strong> Pode adicionar e remover filmes
          </p>
        </div>
      </div>
    </div>
  );
}
