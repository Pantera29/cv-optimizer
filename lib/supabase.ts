import { createClient } from '@supabase/supabase-js'

// Verificar que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Solo lanzar error en el entorno de cliente, no durante la compilación
if (typeof window !== 'undefined') {
  if (!supabaseUrl) console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null
        }
        return JSON.parse(window.localStorage.getItem(key) || 'null')
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      },
    },
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
}) 