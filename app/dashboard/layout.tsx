'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Layout general para el panel de administración (/dashboard).
 * Proporciona barra de navegación lateral, barra superior y control de cierre de sesión.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const userName = 'admin';
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoadingLogout(false);
    }
  };

  const navItems = [
    {
      name: 'Registro RTM',
      path: '/dashboard/registro',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      name: 'Solicitud Citas',
      path: '/dashboard/citas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.625 21h12.75A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.625 9h12.75A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
      ),
    },
    {
      name: 'Consultas & Reportes',
      path: '/dashboard/consultas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-1.769-1.769a3.375 3.375 0 1 1-4.773-4.773 3.375 3.375 0 0 1 4.773 4.773Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* 1. Barra de Navegación Lateral (Sidebar) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-900 bg-slate-950 md:flex">
        
        {/* Identidad de Marca */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-900 bg-slate-950">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-lg">
            CDA
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Control RTM</h1>
            <p className="text-[10px] text-slate-500 font-medium">Ley 769 de 2002</p>
          </div>
        </div>

        {/* Menú de Opciones */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Info de Usuario y Cierre de Sesión */}
        <div className="border-t border-slate-900 p-4 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200 text-xs font-semibold uppercase">
                {userName.substring(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white leading-none">{userName}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Técnico Operador</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={loadingLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              {loadingLogout ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Área de Contenido Principal (Topbar + Vista) */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
        
        {/* Barra superior (Topbar) - Muestra navegación móvil e info de sesión */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-900 bg-slate-950/80 px-6 backdrop-blur-md">
          {/* Navegación Móvil (Solo visible en pantallas pequeñas) */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 text-white font-bold text-sm">
              CDA
            </div>
            <div className="flex gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {item.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título dinámico basado en la ruta */}
          <div className="hidden md:block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CDA Antioquia / Sistema de Gestión
            </span>
          </div>

          {/* Estado de conexión / Info del sistema */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Servidor Conectado (SQLite)
            </span>
            <button
              onClick={handleLogout}
              className="md:hidden text-xs text-red-400 font-semibold uppercase tracking-wide hover:underline"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Vista del Dashboard con scroll independiente */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
