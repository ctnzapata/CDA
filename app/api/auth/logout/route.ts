import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route para cerrar sesión.
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_user');

    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json({ success: false, error: 'Error al cerrar sesión.' }, { status: 500 });
  }
}
