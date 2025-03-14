'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';

export default function LinkedInJobExtractor() {
  const { user, session } = useAuth();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionDebug, setSessionDebug] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(false);
  const [tokenFetchAttempts, setTokenFetchAttempts] = useState<number>(0);

  // Función para establecer la cookie con el token de acceso
  const setAuthCookie = (token: string) => {
    // Establecer cookie con opciones de seguridad (httpOnly no funciona en client-side)
    console.log('Estableciendo cookie de autenticación con token');
    Cookies.set('auth_token', token, { 
      expires: 1, // 1 día 
      path: '/',
      sameSite: 'Strict',
      secure: window.location.protocol === 'https:'
    });
    return token;
  };

  // Obtener token directamente desde Supabase
  const getAuthToken = async () => {
    setIsTokenLoading(true);
    try {
      console.log('Intentando obtener token - Intento #', tokenFetchAttempts + 1);
      
      // Intentar obtener directamente de la sesión actual
      const { data, error } = await supabase.auth.getSession();
      
      console.log('Respuesta de getSession:', data ? 'Datos obtenidos' : 'Sin datos');
      
      if (error) {
        console.error('Error al obtener sesión de Supabase:', error.message);
        return null;
      }
      
      if (data?.session?.access_token) {
        const token = data.session.access_token;
        console.log('Token obtenido correctamente. Longitud:', token.length);
        console.log('Primeros 10 caracteres:', token.substring(0, 10) + '...');
        setAccessToken(token);
        
        // Guardar el token como cookie para transmitirlo a la API
        setAuthCookie(token);
        
        return token;
      } else {
        console.log('No se encontró token en la sesión de Supabase');
        
        // Intentamos con getUser como alternativa
        const authUser = await supabase.auth.getUser();
        console.log('Respuesta de getUser:', authUser ? 'Datos obtenidos' : 'Sin datos');
        
        if (authUser.data?.user) {
          console.log('Usuario autenticado encontrado en getUser');
          // Intentar refrescar la sesión
          const { data: refreshData } = await supabase.auth.refreshSession();
          
          if (refreshData?.session?.access_token) {
            const refreshToken = refreshData.session.access_token;
            console.log('Token obtenido tras refresh. Longitud:', refreshToken.length);
            setAccessToken(refreshToken);
            
            // Guardar el token como cookie para transmitirlo a la API
            setAuthCookie(refreshToken);
            
            return refreshToken;
          }
        }
        
        return null;
      }
    } catch (e) {
      console.error('Error inesperado al obtener token:', e);
      return null;
    } finally {
      setIsTokenLoading(false);
      setTokenFetchAttempts(prev => prev + 1);
    }
  };

  // Efecto para obtener token cuando el componente se monta
  useEffect(() => {
    if (session) {
      console.log('Session encontrada en useAuth');
      setSessionDebug(JSON.stringify(session, null, 2));
      
      // Solo intentar obtener el token si no lo tenemos ya
      if (!accessToken && !isTokenLoading) {
        getAuthToken();
      }
    } else {
      console.log('No hay session en useAuth');
    }
  }, [session, accessToken, isTokenLoading, tokenFetchAttempts]);

  const extractJobData = async () => {
    // Resetear el estado
    setError(null);

    if (!url) {
      toast.error('Por favor, ingresa una URL de LinkedIn');
      return;
    }

    if (!url.includes('linkedin.com') || !url.includes('/jobs/')) {
      toast.error('La URL debe ser una oferta de trabajo válida de LinkedIn');
      return;
    }

    if (!user) {
      toast.error('Debes iniciar sesión para extraer datos de trabajos');
      setError('No estás autenticado. Por favor, inicia sesión para continuar.');
      return;
    }

    try {
      setIsLoading(true);
      setResult(null);
      
      // Asegurarnos de tener un token válido
      let token = accessToken;
      
      // Si no tenemos token, intentar obtenerlo
      if (!token) {
        console.log('No hay token disponible, intentando obtenerlo ahora...');
        token = await getAuthToken();
      } else {
        // Asegurarnos de que la cookie esté actualizada con el token actual
        setAuthCookie(token);
      }
      
      if (!token) {
        console.error('No se pudo obtener un token válido después de múltiples intentos');
        setError('No se pudo obtener autorización. Por favor, vuelve a iniciar sesión y recarga la página.');
        toast.error('Error de autenticación. Por favor, vuelve a iniciar sesión.');
        return;
      }
      
      console.log('Enviando solicitud a /api/jobs');
      console.log('Cookie auth_token establecida:', !!Cookies.get('auth_token'));
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // También se incluye el token en el header como respaldo
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
        // Asegurarnos de que las cookies se envíen con la solicitud
        credentials: 'include',
      });

      console.log('Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Error 401 recibido. Datos:', data);
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          
          // Intentar refrescar el token como último recurso
          setAccessToken(null);
          await getAuthToken();
          return;
        }
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setResult(data);
      toast.success('Datos de la oferta de trabajo extraídos correctamente');
    } catch (error) {
      console.error('Error al extraer datos:', error);
      setError(error instanceof Error ? error.message : 'Error al extraer los datos');
      toast.error(error instanceof Error ? error.message : 'Error al extraer los datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Extractor de Datos de LinkedIn</CardTitle>
        <CardDescription>
          Ingresa la URL de una oferta de trabajo de LinkedIn para extraer sus datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {!user && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md">
            <p className="text-sm font-medium">Debes iniciar sesión para usar esta función</p>
          </div>
        )}

        {/* Estado del token */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`mb-4 p-3 rounded-md ${accessToken ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
            <p className="text-sm font-medium">
              {isTokenLoading ? 'Obteniendo token...' : 
               accessToken ? `Token disponible (${accessToken.substring(0, 5)}...)` : 
               tokenFetchAttempts > 0 ? `No se pudo obtener token después de ${tokenFetchAttempts} intentos` : 
               'Token no disponible'}
            </p>
            {accessToken && (
              <p className="text-xs mt-1">
                Cookie establecida: {Cookies.get('auth_token') ? 'Sí ✓' : 'No ✗'}
              </p>
            )}
            {!accessToken && tokenFetchAttempts > 0 && !isTokenLoading && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={getAuthToken}
              >
                Reintentar obtener token
              </Button>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Input
            placeholder="https://www.linkedin.com/jobs/view/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading || !user}
            className="flex-1"
          />
          <Button 
            onClick={extractJobData} 
            disabled={isLoading || !user || isTokenLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando
              </>
            ) : (
              'Extraer Datos'
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="mt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Extrayendo datos de LinkedIn. Este proceso puede tardar varios minutos...
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">Resultado:</h3>
            <div className="mt-2 p-4 bg-muted rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between">
        <span>Powered by BrightData - Los datos pueden tardar varios minutos en extraerse</span>
        {user && <span>Usuario: {user.email}</span>}
      </CardFooter>
    </Card>
  );
} 