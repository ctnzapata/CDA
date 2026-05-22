import { NextResponse } from 'next/server';
import { CitaService } from '@/services/citaService';

/**
 * Endpoint de API para la gestión de Citas RTM.
 * 
 * POST /api/citas - Solicita una nueva cita. Valida deudas externas.
 *   - 201 Created: Cita asignada exitosamente.
 *   - 403 Forbidden: Cita rechazada por deudas pendientes de tránsito.
 *   - 400 Bad Request: Error en validaciones locales (vehículo no registrado, campos faltantes).
 * 
 * GET /api/citas - Busca citas asociadas a una placa o a la cédula de un propietario.
 *   - ?placa=XYZ123 -> Historial por placa.
 *   - ?idPropietario=123456 -> Historial por propietario.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await CitaService.registrarCita(body);

    if (!result.success) {
      // Si fue rechazada por deuda (debtsChecked), guardamos el registro pero retornamos 403
      if (result.debtsChecked) {
        return NextResponse.json(
          { success: false, error: result.error, cita: result.cita },
          { status: 403 }
        );
      }
      // Otros fallos de validación local (ej. no existe vehículo)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/citas:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor al procesar la cita.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placa = searchParams.get('placa');
    const idPropietario = searchParams.get('idPropietario');

    if (placa) {
      const result = await CitaService.obtenerCitasPorPlaca(placa);
      return NextResponse.json(result);
    }

    if (idPropietario) {
      const result = await CitaService.obtenerCitasPorPropietario(idPropietario);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Debe especificar el parámetro "placa" o "idPropietario" en la consulta.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en GET /api/citas:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor al buscar las citas.' },
      { status: 500 }
    );
  }
}
