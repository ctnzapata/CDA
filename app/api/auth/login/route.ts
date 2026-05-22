import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/services/authService';

/**
 * API Route para el Inicio de Sesión de la RTM.
 * POST /api/auth/login
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    // Llamado al servicio puro de negocio
    const result = await AuthService.login(id, password);

    if (result.success && result.user) {
      // Iniciar sesión guardando una cookie HTTP-only segura
      const cookieStore = await cookies();
      cookieStore.set('session_user', result.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2, // Sesión válida por 2 horas
      });

      return NextResponse.json({
        success: true,
        user: result.user,
      });
    } else {
      // Retornar error de credenciales o de bloqueo
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          bloqueado: result.bloqueado,
        },
        { status: result.bloqueado ? 403 : 401 }
      );
    }
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor.' },
      { status: 500 }
    );
  }
}
