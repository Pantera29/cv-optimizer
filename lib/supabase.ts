import { createClient } from '@supabase/supabase-js'

// Verificar que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Solo lanzar error en el entorno de cliente, no durante la compilación
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!supabaseUrl) console.error('Error crítico: NEXT_PUBLIC_SUPABASE_URL no está definido')
  if (!supabaseAnonKey) console.error('Error crítico: NEXT_PUBLIC_SUPABASE_ANON_KEY no está definido')
}

// Valores fallback para evitar errores en producción si las variables no están definidas
const safeSupabaseUrl = supabaseUrl || 'https://fallback-url.supabase.co'
const safeSupabaseAnonKey = supabaseAnonKey || 'fallback-anon-key'

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null
        }
        try {
          return JSON.parse(window.localStorage.getItem(key) || 'null')
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error al leer datos de autenticación:', error)
          }
          return null
        }
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(value))
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error al guardar datos de autenticación:', error)
            }
          }
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(key)
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error al eliminar datos de autenticación:', error)
            }
          }
        }
      },
    },
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
}) 