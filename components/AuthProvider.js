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

        const { data: { session } } = await servicoSupabase.client.auth.getSession();
        
        if (session?.user) {
          setUsuario(session.user);
          setIsAdmin(true);
        } else {
          setUsuario(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
      } finally {
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
      const { error } = await servicoSupabase.client.auth.signOut();
      if (error) throw error;
      
      setUsuario(null);
      setIsAdmin(false);
      return { sucesso: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { sucesso: false, erro: 'Erro ao sair' };
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
