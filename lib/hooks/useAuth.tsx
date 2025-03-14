"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<{user: User | null; session: Session | null} | void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Función auxiliar para logging condicional
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Cargar la sesión inicial
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        logDebug('Cargando sesión inicial...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logDebug('Error al cargar la sesión:', error.message);
          return;
        }
        
        if (data?.session) {
          logDebug('Sesión encontrada:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          logDebug('No se encontró sesión activa');
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        logDebug('Error inesperado al cargar la sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Suscripción a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        logDebug('Evento de autenticación:', event);
        
        if (currentSession) {
          logDebug('Nuevo usuario autenticado:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          logDebug('Usuario desautenticado');
          setSession(null);
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      logDebug('Intentando iniciar sesión con:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        logDebug('Login exitoso, usuario:', data.session.user.id);
        setSession(data.session);
        setUser(data.session.user);
        router.push('/app');
        return true;
      }
      
      return false;
    } catch (error: any) {
      logDebug('Error en login:', error.message);
      setError(error.message || 'Error al iniciar sesión');
      toast.error(error.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      logDebug('Registro exitoso. Verifica tu email:', data);
      toast.success('Cuenta creada. Por favor, verifica tu correo electrónico.');
      return { 
        user: data.user, 
        session: data.session 
      };
    } catch (error: any) {
      logDebug('Error en registro:', error.message);
      setError(error.message || 'Error al registrar usuario');
      toast.error(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      logDebug('Sesión cerrada correctamente');
      setSession(null);
      setUser(null);
      
      // Redirigir a la página de login usando router
      router.push('/login');
    } catch (error: any) {
      logDebug('Error al cerrar sesión:', error.message);
      setError(error.message || 'Error al cerrar sesión');
      toast.error(error.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();
  return user;
}; 