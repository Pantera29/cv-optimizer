import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rutas protegidas que requieren autenticación
const protectedRoutes = ['/app', '/dashboard', '/profile']

// Esta función revisa si la ruta actual está protegida
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(route => path.startsWith(route))
}

// Rutas públicas que deben ser accesibles sin autenticación
const publicRoutes = ['/', '/login', '/api', '/_next', '/favicon.ico', '/redirect']

// Función auxiliar para logging condicional
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

export async function middleware(req: NextRequest) {
  // Si es una ruta pública, permitir acceso inmediatamente
  const path = req.nextUrl.pathname
  
  if (publicRoutes.some(route => path.startsWith(route))) {
    logDebug('Ruta pública, permitiendo acceso:', path)
    return NextResponse.next()
  }
  
  // Para rutas protegidas, verificar autenticación
  if (isProtectedRoute(path)) {
    logDebug('Verificando autenticación para ruta protegida:', path)
    
    // Crear el cliente de Supabase
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    
    try {
      // Obtener la sesión actual
      const { data: { session } } = await supabase.auth.getSession()
      
      // Si no hay sesión, redirigir a login
      if (!session) {
        logDebug('No hay sesión activa, redirigiendo a /login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      logDebug('Sesión verificada, permitiendo acceso a:', path)
      return res
    } catch (error) {
      logDebug('Error al verificar la sesión:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Para cualquier otra ruta, permitir acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 