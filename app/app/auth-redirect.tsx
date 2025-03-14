"use client"

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Solo redirigir después de que useAuth haya terminado de cargar
    if (!isLoading) {
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Usuario autenticado, redirigiendo a la aplicación')
        }
        // Usar router en lugar de window.location
        router.push('/app')
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('No hay usuario autenticado, redirigiendo a login')
        }
        // Usar router en lugar de window.location
        router.push('/login')
      }
    }
  }, [user, isLoading, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Redirigiendo...</h2>
        <p className="text-gray-500">Por favor espera mientras te redirigimos</p>
      </div>
    </div>
  )
} 