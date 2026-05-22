import { redirect } from 'next/navigation';

/**
 * Redirige automáticamente desde /dashboard a /dashboard/registro.
 * Esta es una Server Component pura; no requiere marcador 'use client'.
 */
export default function DashboardRootPage() {
  redirect('/dashboard/registro');
}
