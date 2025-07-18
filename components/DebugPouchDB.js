import { useState, useEffect } from 'react';

export default function DebugPouchDB() {
  const [debug, setDebug] = useState({
    isClient: typeof window !== 'undefined',
    pouchDBLoaded: false,
    pouchDBFindLoaded: false,
    dbInitialized: false,
    error: null
  });

  useEffect(() => {
    const checkPouchDB = () => {
      setDebug(prev => ({
        ...prev,
        isClient: typeof window !== 'undefined',
        pouchDBLoaded: !!(typeof window !== 'undefined' && window.PouchDB),
        pouchDBFindLoaded: !!(typeof window !== 'undefined' && window.PouchDBFind),
        error: null
      }));
    };

    checkPouchDB();
    
    // Verifica novamente após um tempo para garantir que os scripts carregaram
    const timer = setTimeout(checkPouchDB, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Só renderiza no cliente
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <div><strong>Debug PouchDB:</strong></div>
      <div>Cliente: {debug.isClient ? '✅' : '❌'}</div>
      <div>PouchDB: {debug.pouchDBLoaded ? '✅' : '❌'}</div>
      <div>PouchDBFind: {debug.pouchDBFindLoaded ? '✅' : '❌'}</div>
      {debug.error && <div style={{color: 'red'}}>Erro: {debug.error}</div>}
    </div>
  );
}
