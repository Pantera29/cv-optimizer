import { NextRequest, NextResponse } from 'next/server';
import { requestJobData } from '@/app/services/brightData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Se requiere una URL de LinkedIn' },
        { status: 400 }
      );
    }

    // Iniciar proceso de extracción de datos
    const result = await requestJobData(url);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Error al procesar la solicitud',
          error: result.error
        },
        { status: 500 }
      );
    }
    
    // Construir la respuesta incluyendo rawData si está disponible
    const response = {
      success: true,
      message: result.message || 'Datos de la oferta de trabajo procesados exitosamente',
      data: result.data
    };
    
    // Incluir rawData si está disponible
    if (result.rawData) {
      return NextResponse.json({
        ...response,
        rawData: result.rawData
      });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en la solicitud:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al procesar la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 