import { prisma } from "@/lib/prisma";
import CitasAgenda from "@/components/dashboard/CitasAgenda";

export const dynamic = 'force-dynamic';

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  // Por defecto usa la fecha actual en formato local (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD reliably
  const selectedDateStr = date || todayStr;
  
  const [year, month, day] = selectedDateStr.split('-').map(Number);
  // La DB guarda fechas como UTC puras
  const fechaPura = new Date(Date.UTC(year, month - 1, day));

  // Obtener citas del día
  const citas = await prisma.cita.findMany({
    where: { fecha: fechaPura },
    include: {
      vehiculo: {
        include: {
          propietario: {
            select: { nombres: true, apellidos: true }
          }
        }
      }
    },
    orderBy: { horaSlot: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agenda de Inspecciones (RTM)</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona las citas, verifica disponibilidad y controla el flujo en pista.</p>
        </div>
      </div>

      <CitasAgenda initialCitas={citas} selectedDateStr={selectedDateStr} />
    </div>
  );
}
