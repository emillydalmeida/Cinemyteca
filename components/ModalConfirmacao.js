import { useEffect } from 'react';
import styles from '../styles/ModalConfirmacao.module.css';

const ModalConfirmacao = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensagem, 
  textoConfirmar = "Confirmar", 
  textoCancelar = "Cancelar",
  tipo = "padrao" // "padrao", "perigoso"
}) => {
  
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.titulo}>{titulo}</h3>
          <button 
            className={styles.botaoFechar}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.conteudo}>
          <p className={styles.mensagem}>{mensagem}</p>
        </div>
        
        <div className={styles.acoes}>
          <button 
            className={styles.botaoCancelar}
            onClick={onClose}
          >
            {textoCancelar}
          </button>
          <button 
            className={`${styles.botaoConfirmar} ${tipo === 'perigoso' ? styles.perigoso : ''}`}
            onClick={handleConfirm}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;
