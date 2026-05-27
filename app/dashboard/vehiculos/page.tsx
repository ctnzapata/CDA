import { prisma } from "@/lib/prisma";
import VehiculosTable from "@/components/dashboard/VehiculosTable";

export const dynamic = 'force-dynamic';

export default async function VehiculosPage() {
  const [vehiculos, propietarios] = await Promise.all([
    prisma.vehiculo.findMany({
      orderBy: { placa: 'asc' },
      include: {
        propietario: {
          select: { nombres: true, apellidos: true }
        }
      }
    }),
    prisma.propietario.findMany({
      orderBy: { nombres: 'asc' },
      select: { id: true, nombres: true, apellidos: true }
    })
  ]);

  return <VehiculosTable vehiculos={vehiculos} propietarios={propietarios} />;
}
