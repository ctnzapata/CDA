import { prisma } from "@/lib/prisma";
import PropietariosTable from "@/components/dashboard/PropietariosTable";

export const dynamic = 'force-dynamic';

export default async function PropietariosPage() {
  const propietarios = await prisma.propietario.findMany({
    orderBy: { nombres: 'asc' },
    include: {
      _count: { select: { vehiculos: true } }
    }
  });

  return <PropietariosTable propietarios={propietarios} />;
}
