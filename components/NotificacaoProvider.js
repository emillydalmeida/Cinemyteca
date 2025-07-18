import { createContext, useContext, useState, useRef } from 'react';
import Notificacao from './Notificacao';
import { useIsClient } from '../hooks/useIsClient';

const NotificacaoContext = createContext();

export const useNotificacao = () => {
  const context = useContext(NotificacaoContext);
  if (!context) {
    throw new Error('useNotificacao deve ser usado dentro de NotificacaoProvider');
  }
  return context;
};

export function NotificacaoProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const isClient = useIsClient();
  const contadorRef = useRef(0);

  const adicionarNotificacao = (mensagem, tipo = 'info', duracao = 4000) => {
    if (!isClient) return;
    
    const id = ++contadorRef.current;
    const novaNotificacao = {
      id,
      mensagem,
      tipo,
      duracao
    };

    setNotificacoes(previas => [...previas, novaNotificacao]);
  };

  const removerNotificacao = (id) => {
    setNotificacoes(previas => previas.filter(notif => notif.id !== id));
  };

  const mostrarSucesso = (mensagem, duracao) => {
    adicionarNotificacao(mensagem, 'sucesso', duracao);
  };

  const mostrarErro = (mensagem, duracao) => {
    adicionarNotificacao(mensagem, 'erro', duracao);
  };

  const mostrarInfo = (mensagem, duracao) => {
    adicionarNotificacao(mensagem, 'info', duracao);
  };

  return (
    <NotificacaoContext.Provider 
      value={{ 
        mostrarSucesso, 
        mostrarErro, 
        mostrarInfo,
        adicionarNotificacao 
      }}
    >
      {children}
      {notificacoes.map((notificacao, index) => (
        <div 
          key={notificacao.id} 
          style={{ 
            position: 'fixed',
            top: `${20 + (index * 90)}px`,
            right: '20px',
            zIndex: 9999
          }}
        >
          <Notificacao
            mensagem={notificacao.mensagem}
            tipo={notificacao.tipo}
            duracao={notificacao.duracao}
            onClose={() => removerNotificacao(notificacao.id)}
          />
        </div>
      ))}
    </NotificacaoContext.Provider>
  );
}
