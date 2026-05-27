import { prisma } from "@/lib/prisma";
import UsuariosTable from "@/components/dashboard/UsuariosTable";

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({
    orderBy: { id: 'asc' }
  });

  return <UsuariosTable usuarios={usuarios} />;
}
