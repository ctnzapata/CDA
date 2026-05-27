"use server";

import { prisma } from "@/lib/prisma";

/**
 * Consulta las citas asociadas a un vehículo específico por su placa.
 */
export async function consultarPorMatricula(placa: string) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placa: placa.toUpperCase() },
      include: {
        propietario: true,
        citas: {
          orderBy: { fecha: 'desc' },
          take: 5 // Mostramos el historial reciente
        }
      }
    });

    if (!vehiculo) {
      return { success: false, error: "Vehículo no encontrado en el sistema." };
    }

    return { success: true, data: vehiculo };
  } catch (error) {
    console.error("Error en consulta por matrícula:", error);
    return { success: false, error: "Error interno al consultar matrícula." };
  }
}

/**
 * Consulta todos los vehículos y sus citas asociadas a un propietario.
 */
export async function consultarPorPropietario(idPropietario: string) {
  try {
    const propietario = await prisma.propietario.findUnique({
      where: { id: idPropietario },
      include: {
        vehiculos: {
          include: {
            citas: {
              orderBy: { fecha: 'desc' },
              take: 3
            }
          }
        }
      }
    });

    if (!propietario) {
      return { success: false, error: "Propietario no encontrado en el sistema." };
    }

    return { success: true, data: propietario };
  } catch (error) {
    console.error("Error en consulta por propietario:", error);
    return { success: false, error: "Error interno al consultar propietario." };
  }
}

/**
 * Consulta el total de rechazos por deuda en un rango de fechas.
 */
export async function reporteRechazosDeuda(fechaInicio: string, fechaFin: string) {
  try {
    const start = new Date(`${fechaInicio}T00:00:00.000Z`);
    const end = new Date(`${fechaFin}T23:59:59.999Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: "Formato de fechas inválido." };
    }

    const total = await prisma.rechazoCita.count({
      where: {
        fechaIntento: {
          gte: start,
          lte: end
        }
      }
    });

    const lista = await prisma.rechazoCita.findMany({
      where: {
        fechaIntento: {
          gte: start,
          lte: end
        }
      },
      orderBy: { fechaIntento: 'desc' },
      take: 50 // Limitamos la lista por seguridad
    });

    return { success: true, data: { total, lista } };
  } catch (error) {
    console.error("Error en reporte de rechazos:", error);
    return { success: false, error: "Error interno al generar el reporte." };
  }
}
