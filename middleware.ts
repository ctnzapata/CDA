import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para protección de rutas.
 * Redirige al login (/) si se intenta acceder a /dashboard sin sesión.
 * Redirige al dashboard (/dashboard/registro) si se intenta acceder al login con sesión activa.
 */
export function middleware(request: NextRequest) {
  const sessionUser = request.cookies.get('session_user')?.value;
  const { pathname } = request.nextUrl;

  // 1. Proteger rutas del panel de control
  if (pathname.startsWith('/dashboard')) {
    if (!sessionUser) {
      // No autenticado -> Redirigir a la pantalla de Login
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Redirigir al dashboard si ya está autenticado y accede a la raíz de login
  if (pathname === '/') {
    if (sessionUser) {
      return NextResponse.redirect(new URL('/dashboard/registro', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
