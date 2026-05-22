import { NextResponse } from 'next/server';
import { CitaService } from '@/services/citaService';

/**
 * Endpoint de API para Consultas Especiales y Reportes.
 * 
 * GET /api/consultas - Obtiene el reporte de citas rechazadas por deudas.
 *   - Parámetros requeridos: fecha_inicio (YYYY-MM-DD) y fecha_fin (YYYY-MM-DD).
 *   - Retorna el listado de citas y la sumatoria total del recuento de vehículos rechazados.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicioStr = searchParams.get('fecha_inicio');
    const fechaFinStr = searchParams.get('fecha_fin');

    if (!fechaInicioStr || !fechaFinStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debe proporcionar los parámetros de fecha obligatorios: "fecha_inicio" y "fecha_fin".',
        },
        { status: 400 }
      );
    }

    const fechaInicio = new Date(fechaInicioStr);
    const fechaFin = new Date(fechaFinStr);

    // Validar si el formato de fecha es válido
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Los formatos de fecha proporcionados no son válidos. Use el formato estándar AAAA-MM-DD.',
        },
        { status: 400 }
      );
    }

    if (fechaInicio > fechaFin) {
      return NextResponse.json(
        {
          success: false,
          error: 'La fecha de inicio no puede ser posterior a la fecha de fin.',
        },
        { status: 400 }
      );
    }

    const result = await CitaService.obtenerReporteRechazadosPorFecha(fechaInicio, fechaFin);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en GET /api/consultas:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor al generar el reporte.' },
      { status: 500 }
    );
  }
}
