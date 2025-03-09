"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error al obtener perfil de usuario:", error);
      } finally {
        setLoading(false);
      }
    }

    getUserProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">¡Bienvenido!</h1>
          <p className="text-gray-600">Login exitoso - Sesión iniciada correctamente</p>
        </div>

        {user && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">Información de usuario:</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Creado:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/app">Ir a la Aplicación</Link>
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
} 