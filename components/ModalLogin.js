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
          <h2>🎬 Acesso Admin</h2>
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
            {carregando ? '🔄 Entrando...' : '🔑 Entrar'}
          </button>
        </form>

        <div className={styles.nota}>
          <p>💡 <strong>Visitantes:</strong> Podem navegar e ver todos os filmes</p>
          <p>� <strong>Admin:</strong> Pode adicionar e remover filmes</p>
          <p>� <strong>Primeiro acesso:</strong> Crie sua conta com email e senha</p>
        </div>
      </div>
    </div>
  );
}
