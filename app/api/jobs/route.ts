import { NextRequest, NextResponse } from 'next/server';
import { requestJobData } from '@/app/services/brightData';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para verificación de tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Función auxiliar para logging condicional
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(`[API Jobs] ${message}`, data);
    } else {
      console.log(`[API Jobs] ${message}`);
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    logDebug('Recibiendo solicitud en /api/jobs');
    
    // Imprimir todos los headers para depuración
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    logDebug('Headers recibidos:', allHeaders);
    
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      logDebug('No se encontró header Authorization');
      return NextResponse.json(
        { success: false, message: 'No autorizado - Se requiere header Authorization' },
        { status: 401 }
      );
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      logDebug('Header Authorization no tiene el formato Bearer');
      return NextResponse.json(
        { success: false, message: 'No autorizado - Formato incorrecto, debe ser "Bearer {token}"' },
        { status: 401 }
      );
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token || token.trim() === '') {
      logDebug('Token vacío en el header Authorization');
      return NextResponse.json(
        { success: false, message: 'No autorizado - Token vacío' },
        { status: 401 }
      );
    }
    
    logDebug(`Token recibido (longitud: ${token.length})`);
    
    try {
      // Verificar el token con Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        logDebug('Error al verificar token:', error.message);
        return NextResponse.json(
          { success: false, message: `No autorizado - Error al verificar token: ${error.message}` },
          { status: 401 }
        );
      }
      
      if (!user) {
        logDebug('Token válido pero no se encontró usuario asociado');
        return NextResponse.json(
          { success: false, message: 'No autorizado - No se encontró usuario con este token' },
          { status: 401 }
        );
      }
      
      logDebug('Token verificado correctamente, usuario:', user.email);
      
      // Obtener los datos del cuerpo de la solicitud
      const body = await request.json();
      const { url } = body;
      
      if (!url) {
        return NextResponse.json(
          { success: false, message: 'Se requiere una URL válida de LinkedIn' },
          { status: 400 }
        );
      }
      
      logDebug('Solicitando datos para la URL:', url);
      
      // Solicitar los datos a BrightData (pasando el userId si es necesario)
      const jobData = await requestJobData(url, user.id);
      
      return NextResponse.json({
        success: true,
        data: [
          {
            success: true,
            data: jobData.data && jobData.data.length > 0 
              ? jobData.data[0] 
              : (jobData.jobData || { job_title: 'Sin título', company_name: 'Empresa desconocida' })
          }
        ]
      });
      
    } catch (tokenError) {
      logDebug('Error al procesar el token:', tokenError instanceof Error ? tokenError.message : String(tokenError));
      return NextResponse.json(
        { success: false, message: 'Error al verificar la autenticación' },
        { status: 401 }
      );
    }
  } catch (error) {
    logDebug('Error general en la ruta API:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 