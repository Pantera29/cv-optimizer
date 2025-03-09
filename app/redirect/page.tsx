"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RedirectPage() {
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log('Verificando sesión para redirección...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Estado de sesión:', session ? 'Autenticado' : 'No autenticado')
        
        if (session) {
          console.log('Usuario autenticado, redirigiendo a /app')
          window.location.href = '/app'
        } else {
          console.log('Usuario no autenticado, redirigiendo a /login')
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error)
        window.location.href = '/login'
      }
    }
    
    checkAuthAndRedirect()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-3">Procesando autenticación</h2>
        <p className="text-gray-500 mb-4">Estamos verificando tu identidad y preparando tu espacio de trabajo.</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
} 