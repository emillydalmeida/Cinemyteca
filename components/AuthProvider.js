import { createContext, useContext, useState, useEffect } from 'react';
import { useIsClient } from '../hooks/useIsClient';
import servicoSupabase from '../services/SupabaseServico';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const isClient = useIsClient();

  // Sistema simplificado: qualquer usuário logado é admin
  // const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'emillydalmeida@gmail.com')
  //   .split(',')
  //   .map(email => email.trim());

  useEffect(() => {
    if (!isClient) return;

    const verificarUsuario = async () => {
      try {
        if (!servicoSupabase.client) {
          console.log('⚠️ Supabase não configurado');
          setCarregando(false);
          return;
        }

        // FORÇAR LOGOUT NA INICIALIZAÇÃO
        console.log('🔄 Forçando logout na inicialização...');
        try {
          await servicoSupabase.client.auth.signOut({ scope: 'local' });
        } catch (logoutError) {
          console.log('⚠️ Logout forçado completado (sessão já limpa)');
        }

        // Limpar estado local
        setUsuario(null);
        setIsAdmin(false);
        setCarregando(false);
        
        console.log('✅ Aplicação iniciada sem login');
      } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
        setCarregando(false);
      }
    };

    verificarUsuario();

    if (!servicoSupabase.client) {
      return;
    }

    const { data: { subscription } } = servicoSupabase.client.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (session?.user) {
          setUsuario(session.user);
          setIsAdmin(true); 
        } else {
          setUsuario(null);
          setIsAdmin(false);
        }
        setCarregando(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isClient]);

  const login = async (email, senha) => {
    try {
      const { data, error } = await servicoSupabase.client.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) throw error;

      return { sucesso: true, usuario: data.user };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { 
        sucesso: false, 
        erro: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : 'Erro no login. Tente novamente.'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Tentando logout...');
      
      // Tentar logout normal primeiro
      const { error } = await servicoSupabase.client.auth.signOut({ scope: 'local' });
      
      // Mesmo com erro, limpar estado local
      setUsuario(null);
      setIsAdmin(false);
      
      if (error && !error.message.includes('session missing')) {
        console.warn('⚠️ Aviso no logout:', error);
      }
      
      console.log('✅ Logout realizado com sucesso');
      return { sucesso: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Forçar limpeza mesmo com erro
      setUsuario(null);
      setIsAdmin(false);
      
      // Tentar limpeza forçada do localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
      }
      
      console.log('🔄 Estado limpo forçadamente');
      return { sucesso: true }; // Retornar sucesso mesmo com erro, pois o estado foi limpo
    }
  };

  const value = {
    usuario,
    isAdmin,
    carregando,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
