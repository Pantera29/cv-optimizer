"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthRedirect() {
  useEffect(() => {
    const checkAuth = async () => {
      // Verificar si hay una sesión activa
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Sesión encontrada, redirigiendo a la aplicación')
          // Redirigir a la aplicación
          window.location.href = '/app'
        } else {
          console.log('No hay sesión activa, redirigiendo a login')
          // Redirigir a login
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error)
        window.location.href = '/login'
      }
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Redirigiendo...</h2>
        <p className="text-gray-500">Por favor espera mientras te redirigimos a la aplicación</p>
      </div>
    </div>
  )
} 