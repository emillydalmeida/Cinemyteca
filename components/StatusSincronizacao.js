import { useState, useEffect } from 'react';
import adaptadorPouchDB from '../services/AdaptadorPouchDB';

export default function StatusSincronizacao() {
  const [status, setStatus] = useState({
    local: false,
    supabase: false,
    modo: 'carregando'
  });

  useEffect(() => {
    const verificarStatus = () => {
      try {
        const statusAtual = adaptadorPouchDB.obterStatus();
        setStatus(statusAtual);
      } catch (error) {
        console.error('Erro ao obter status:', error);
      }
    };

    // Verifica imediatamente
    verificarStatus();
    
    // Verifica a cada 5 segundos
    const interval = setInterval(verificarStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (typeof window === 'undefined') {
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
    if (status.modo === 'híbrido') return '#4ade80'; // Verde
    if (status.modo === 'local') return '#fbbf24'; // Amarelo
    return '#6b7280'; // Cinza
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: `1px solid ${getStatusColor()}`,
      backdropFilter: 'blur(10px)'
    }}>
      <span style={{ fontSize: '14px' }}>{getStatusIcon()}</span>
      <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
    </div>
  );
}
