"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else {
          setSessionInfo(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleManualNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticación</h1>
      
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Estado de sesión:</h2>
            <div className="bg-white p-3 rounded-md text-xs overflow-auto max-h-60">
              <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Pruebas de navegación:</h2>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleManualNavigation("/")}>
                Ir a Home
              </Button>
              <Button onClick={() => handleManualNavigation("/login")}>
                Ir a Login
              </Button>
              <Button onClick={() => handleManualNavigation("/app")}>
                Ir a App
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                Cerrar sesión
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Estado de la aplicación:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Ruta actual:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
              </li>
              <li>
                <strong>Modo:</strong> {process.env.NODE_ENV}
              </li>
              <li>
                <strong>Autenticado:</strong> {sessionInfo?.session ? 'Sí' : 'No'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 