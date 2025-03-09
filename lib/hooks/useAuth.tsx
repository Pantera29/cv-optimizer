"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';

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
        console.log('Cargando sesión inicial...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al cargar la sesión:', error.message);
          return;
        }
        
        if (data?.session) {
          console.log('Sesión encontrada:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('No se encontró sesión activa');
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error inesperado al cargar la sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Suscripción a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Evento de autenticación:', event);
        
        if (currentSession) {
          console.log('Nuevo usuario autenticado:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('Usuario desautenticado');
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
      
      console.log('Intentando iniciar sesión con:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        console.log('Login exitoso, usuario:', data.session.user.id);
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error en login:', error.message);
      setError(error.message);
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
      
      if (error) throw error;
      
      console.log('Registro exitoso. Verifica tu email:', data);
      return { 
        user: data.user, 
        session: data.session 
      };
    } catch (error: any) {
      console.error('Error en registro:', error.message);
      setError(error.message);
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
      if (error) throw error;
      
      console.log('Sesión cerrada correctamente');
      setSession(null);
      setUser(null);
      
      // Redirigir a la página de login después de cerrar sesión
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message);
      setError(error.message);
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