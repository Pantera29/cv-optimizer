import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware se ejecuta antes de la renderización de las páginas
export function middleware(request: NextRequest) {
  // Simplemente pasamos todas las solicitudes, pero podemos
  // agregar lógica específica si es necesario más adelante
  return NextResponse.next();
}

// Solo aplicamos este middleware a rutas específicas
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|preview|favicon.ico).*)',
  ],
}; 