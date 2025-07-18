import { useState, useEffect } from 'react';
import adaptadorPouchDB from '../services/AdaptadorPouchDB';
import { useIsClient } from '../hooks/useIsClient';

export default function StatusSincronizacao() {
  const [status, setStatus] = useState({
    local: false,
    supabase: false,
    modo: 'carregando'
  });
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    const verificarStatus = () => {
      try {
        const statusAtual = adaptadorPouchDB.obterStatus();
        setStatus(statusAtual);
      } catch (error) {
        console.error('Erro ao obter status:', error);
      }
    };

    verificarStatus();
    
    const interval = setInterval(verificarStatus, 5000);
    
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  const getStatusIcon = () => {
    if (status.modo === 'híbrido') return '🌐';
    if (status.modo === 'local') return '💾';
    return '⏳';
  };

  const getStatusText = () => {
    if (status.modo === 'híbrido') return 'Sincronizado';
    if (status.modo === 'local') return 'Apenas Local';
    return 'Carregando...';
  };

  const getStatusColor = () => {
    if (status.modo === 'híbrido') return '#ffffffff';
    if (status.modo === 'local') return '#ffffffff';
    return '#6b7280'; 
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: `1px dashed white`,
      backdropFilter: 'blur(10px)'
    }}>
      <span style={{ fontSize: '14px' }}>{getStatusIcon()}</span>
      <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
    </div>
  );
}
