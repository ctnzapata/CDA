import ConsultasView from "@/components/dashboard/ConsultasView";

export const dynamic = 'force-dynamic';

export default function ConsultasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Centro de Consultas y Reportes</h1>
        <p className="text-slate-400 text-sm mt-1">
          Busque historial de vehículos, propietarios y reporte estadístico de rechazos por deuda (Ley 769).
        </p>
      </div>

      <ConsultasView />
    </div>
  );
}
