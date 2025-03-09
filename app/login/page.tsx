"use client"

import { AuthForm } from "@/components/auth/AuthForm"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEffect } from "react"
import { Loader2, FileText } from "lucide-react"

export default function LoginPage() {
  const { user, isLoading } = useAuth()

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user && !isLoading) {
      console.log("Usuario ya autenticado en la página de login, redirigiendo a /app")
      window.location.href = "/app"
    }
  }, [user, isLoading])

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-blue-50">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <FileText className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-blue-600">CV Optimizer</h1>
        </div>
      </div>
      
      <div className="w-full max-w-md px-4">
        <AuthForm />
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        Al iniciar sesión, aceptas nuestros <a href="#" className="text-blue-600 hover:underline">Términos de servicio</a> y <a href="#" className="text-blue-600 hover:underline">Política de privacidad</a>
      </div>
    </div>
  )
} 