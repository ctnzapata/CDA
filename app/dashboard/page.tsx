import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import { CarFront, Activity, LockKeyhole, Percent, CalendarClock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Crear fecha pura UTC para hoy
  const now = new Date();
  const fechaPura = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const [totalVehiculos, cuentasBloqueadas, rtmsHoy, rtmsCompletadasHoy, ultimosRegistros] = await Promise.all([
    prisma.vehiculo.count(),
    prisma.user.count({ where: { bloqueado: true } }),
    prisma.cita.count({ where: { fecha: fechaPura } }),
    prisma.cita.count({ where: { estado: 'COMPLETADA', fecha: fechaPura } }),
    prisma.cita.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vehiculo: true }
    })
  ]);

  const tasaAprobacion = rtmsHoy > 0 ? Math.round((rtmsCompletadasHoy / rtmsHoy) * 100) : 0;

  const kpis = [
    { label: "Citas Agendadas Hoy", value: rtmsHoy, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Vehículos Registrados", value: totalVehiculos, icon: CarFront, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Cuentas Bloqueadas", value: cuentasBloqueadas, icon: LockKeyhole, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Tasa de Finalización", value: `${tasaAprobacion}%`, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Principal</h1>
        <p className="text-slate-400 text-sm mt-1">¡Bienvenido! Resumen del estado operativo del Centro de Diagnóstico (CDA).</p>
      </div>

      {/* Grid KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-slate-900 rounded-xl border ${kpi.border} p-5 flex items-center gap-4`}>
              <div className={`h-12 w-12 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-white mt-0.5">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla últimas Citas */}
      <Card title="Últimas Citas Agendadas" subtitle="Mostrando las 5 operaciones más recientes en el sistema.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Placa</th>
                <th className="pb-3 font-semibold">Vehículo</th>
                <th className="pb-3 font-semibold">Fecha y Hora</th>
                <th className="pb-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimosRegistros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
                      <CalendarClock className="h-8 w-8 text-slate-700" />
                      <p>No hay registros RTM en el sistema aún.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ultimosRegistros.map((registro) => (
                  <tr key={registro.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-semibold text-white">{registro.placaVehiculo}</td>
                    <td className="py-3.5 text-slate-300">
                      {registro.vehiculo.tipoVehiculo}
                      <span className="text-slate-500 text-xs ml-1.5">({registro.vehiculo.marca})</span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {registro.fecha.toISOString().split('T')[0]} a las {registro.horaSlot}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md border uppercase ${
                        registro.estado === 'PENDIENTE'
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : registro.estado === 'EN_PISTA'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : registro.estado === 'COMPLETADA'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {registro.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
