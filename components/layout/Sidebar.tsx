"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  CarFront,
  UserCheck,
  Car,
  CalendarDays,
  FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda RTM", href: "/dashboard/citas", icon: CalendarDays },
  { name: "Consultas & Reportes", href: "/dashboard/consultas", icon: FileSearch },
  { name: "Propietarios", href: "/dashboard/propietarios", icon: UserCheck },
  { name: "Vehículos", href: "/dashboard/vehiculos", icon: Car },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  if (!isClient) {
    return <div className="w-64 border-r border-slate-800 bg-slate-950 h-screen hidden md:block" />;
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800 bg-slate-950 h-screen transition-all duration-300 hidden md:flex z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Botón colapsar */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-sm hover:bg-slate-800 hover:text-slate-200 z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <CarFront className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="ml-3 font-bold text-white tracking-tight text-sm">
            CDA Manager
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
            Módulos
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-900/50"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "flex-shrink-0",
                  isCollapsed ? "h-5 w-5 mx-auto" : "h-5 w-5 mr-3",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User badge */}
      <div className="p-3 border-t border-slate-800">
        <div
          className={cn(
            "flex items-center rounded-lg p-2 bg-slate-800/50",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AD
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-200 truncate">
                Administrador
              </span>
              <span className="text-xs text-slate-500">CDA Sistema</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
