"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, LogOut, Loader2 } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/propietarios": "Propietarios",
  "/dashboard/vehiculos": "Vehículos",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/configuracion": "Configuración",
};

interface TopHeaderProps {
  onLogout: () => void;
  loadingLogout: boolean;
}

export function TopHeader({ onLogout, loadingLogout }: TopHeaderProps) {
  const pathname = usePathname();

  // Título dinámico según la ruta activa
  const pageTitle =
    Object.entries(PAGE_TITLES)
      .reverse()
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Dashboard";

  // Breadcrumb
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: mobile toggle + breadcrumb */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-slate-200 transition-colors">
          <Menu size={22} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const label = seg.charAt(0).toUpperCase() + seg.slice(1);
            return (
              <span key={seg} className="flex items-center gap-2">
                <span className={isLast ? "font-semibold text-white" : "text-slate-500"}>
                  {label}
                </span>
                {!isLast && <span className="text-slate-700">/</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-800" />

        {/* Avatar */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">Administrador</p>
            <p className="text-xs text-slate-500">CDA Sistema</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          disabled={loadingLogout}
          className="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          {loadingLogout ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}
