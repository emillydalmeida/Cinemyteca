import { useState, useEffect } from 'react';
import styles from '../styles/Notificacao.module.css';

export default function Notificacao({ mensagem, tipo = 'info', duracao = 4000, onClose }) {
  const [visivel, setVisivel] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaindo(true);
      setTimeout(() => {
        setVisivel(false);
        onClose();
      }, 300); 
    }, duracao);

    return () => clearTimeout(timer);
  }, [duracao, onClose]);

  const fechar = () => {
    setSaindo(true);
    setTimeout(() => {
      setVisivel(false);
      onClose();
    }, 300);
  };

  if (!visivel) return null;

  const obterIcone = () => {
    switch (tipo) {
      case 'sucesso':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        );
      case 'erro':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
            <path d="M7 16h8"/>
            <path d="M7 11h12"/>
            <path d="M7 6h3"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.notificacao} ${styles[tipo]} ${saindo ? styles.saindo : ''}`}>
      <div className={styles.icone}>
        {obterIcone()}
      </div>
      <div className={styles.conteudo}>
        <p>{mensagem}</p>
      </div>
      <button onClick={fechar} className={styles.botaoFechar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  );
}
