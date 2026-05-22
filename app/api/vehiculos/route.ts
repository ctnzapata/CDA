import { NextResponse } from 'next/server';
import { VehiculoService } from '@/services/vehiculoService';

/**
 * Endpoint de API para la gestión de Vehículos.
 * GET /api/vehiculos - Lista todos los vehículos o busca uno por placa si se pasa ?placa=XYZ123.
 * POST /api/vehiculos - Registra un nuevo vehículo con validación relacional.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placa = searchParams.get('placa');

    if (placa) {
      const result = await VehiculoService.buscarPorPlaca(placa);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }
      return NextResponse.json(result);
    } else {
      const result = await VehiculoService.obtenerTodos();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error en GET /api/vehiculos:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await VehiculoService.registrarVehiculo(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/vehiculos:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
