import { NextResponse } from 'next/server';
import { PropietarioService } from '@/services/propietarioService';

/**
 * Endpoint de API para la gestión de Propietarios.
 * GET /api/propietarios - Lista todos los propietarios o busca uno por cédula si se pasa ?id=XXXX.
 * POST /api/propietarios - Registra un nuevo propietario.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const result = await PropietarioService.buscarPorId(id);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }
      return NextResponse.json(result);
    } else {
      const result = await PropietarioService.obtenerTodos();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error en GET /api/propietarios:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await PropietarioService.registrarPropietario(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/propietarios:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
