"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { citaSchema } from "@/lib/schemas";

// Constante de reglas de negocio
const MAX_CAPACITY_PER_SLOT = 3;

/**
 * Crea una nueva cita tras validar rigurosamente las reglas de negocio.
 */
export async function createCita(data: unknown, usuarioId?: string) {
  try {
    const validData = citaSchema.parse(data);

    // 1. Horario Operativo & Validación del Pasado
    // Convertir fecha ("YYYY-MM-DD") y horaSlot ("HH:mm") a Date local para comparación
    const [year, month, day] = validData.fecha.split("-").map(Number);
    const [hour, minute] = validData.horaSlot.split(":").map(Number);
    
    const citaDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    if (citaDate < now) {
      return { success: false, error: "No se permiten citas en días u horas del pasado." };
    }

    const dayOfWeek = citaDate.getDay(); // 0 = Domingo
    if (dayOfWeek === 0) {
      return { success: false, error: "No hay atención operativa los días Domingos." };
    }

    // 2. Cita Única Activa
    // Un vehículo NO puede tener más de una cita PENDIENTE o EN_PISTA al mismo tiempo.
    const activeCita = await prisma.cita.findFirst({
      where: {
        placaVehiculo: validData.placaVehiculo,
        estado: { in: ["PENDIENTE", "EN_PISTA"] },
      },
    });

    if (activeCita) {
      return { success: false, error: "El vehículo ya tiene una cita activa (Pendiente o En Pista)." };
    }

    // Buscar si el vehículo existe (para relacionar al propietario y asegurar consistencia)
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placa: validData.placaVehiculo },
    });

    if (!vehiculo) {
      return { success: false, error: "El vehículo no se encuentra registrado en el sistema. Regístrelo primero." };
    }

    // 2.5 Validación de Deudas (Regla Crítica de Negocio)
    if (vehiculo.tieneDeuda) {
      // Registrar el rechazo para analítica
      await prisma.rechazoCita.create({
        data: {
          placaVehiculo: vehiculo.placa,
          motivo: "Deuda pendiente con entidad de tránsito (SIMIT / Gobernación)",
        }
      });
      return { 
        success: false, 
        error: "El vehículo posee multas de tránsito pendientes. Asignación bloqueada según la Ley 769 de 2002." 
      };
    }

    // 3. Límite de Capacidad (Overbooking)
    // El modelo guarda 'fecha' puramente, usamos Date UTC para estandarizar
    const fechaPura = new Date(Date.UTC(year, month - 1, day));
    
    const countInSlot = await prisma.cita.count({
      where: {
        fecha: fechaPura,
        horaSlot: validData.horaSlot,
        estado: { in: ["PENDIENTE", "EN_PISTA"] }, // Las canceladas no cuentan
      },
    });

    if (countInSlot >= MAX_CAPACITY_PER_SLOT) {
      return { success: false, error: `El bloque de ${validData.horaSlot} ya alcanzó su máxima capacidad (${MAX_CAPACITY_PER_SLOT} cupos).` };
    }

    // 4. Crear la Cita
    await prisma.cita.create({
      data: {
        fecha: fechaPura,
        horaSlot: validData.horaSlot,
        observaciones: validData.observaciones || null,
        placaVehiculo: validData.placaVehiculo,
        propietarioId: vehiculo.propietarioId,
        usuarioId: usuarioId || null,
        estado: "PENDIENTE",
      },
    });

    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear cita:", error);
    if (error.name === "ZodError") {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Error interno del servidor al agendar." };
  }
}

/**
 * Control de Flujo: Cambia estado de PENDIENTE a EN_PISTA
 */
export async function iniciarInspeccion(id: string) {
  try {
    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) return { success: false, error: "Cita no encontrada." };
    if (cita.estado !== "PENDIENTE") {
      return { success: false, error: "Solo citas PENDIENTES pueden iniciar inspección." };
    }

    await prisma.cita.update({
      where: { id },
      data: { estado: "EN_PISTA" },
    });

    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch (error) {
    console.error("Error al iniciar inspección:", error);
    return { success: false, error: "Error al actualizar estado." };
  }
}

/**
 * Control de Flujo: Cambia estado de EN_PISTA a COMPLETADA
 */
export async function finalizarInspeccion(id: string) {
  try {
    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) return { success: false, error: "Cita no encontrada." };
    if (cita.estado !== "EN_PISTA") {
      return { success: false, error: "La cita debe estar EN PISTA para ser completada." };
    }

    await prisma.cita.update({
      where: { id },
      data: { estado: "COMPLETADA" },
    });

    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch (error) {
    console.error("Error al finalizar inspección:", error);
    return { success: false, error: "Error al actualizar estado." };
  }
}

/**
 * Control de Flujo: Cambia estado a CANCELADA y guarda motivo
 */
export async function cancelarCita(id: string, motivo: string) {
  try {
    if (!motivo || motivo.trim().length < 5) {
      return { success: false, error: "Debe proporcionar un motivo válido de cancelación (min 5 caracteres)." };
    }

    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) return { success: false, error: "Cita no encontrada." };
    if (cita.estado === "COMPLETADA") {
      return { success: false, error: "No se puede cancelar una cita ya completada." };
    }

    // Se adjunta el motivo a las observaciones
    const nuevaObservacion = cita.observaciones 
      ? `${cita.observaciones}\n[CANCELADA]: ${motivo}` 
      : `[CANCELADA]: ${motivo}`;

    await prisma.cita.update({
      where: { id },
      data: { 
        estado: "CANCELADA",
        observaciones: nuevaObservacion
      },
    });

    revalidatePath("/dashboard/citas");
    return { success: true };
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    return { success: false, error: "Error al cancelar la cita." };
  }
}
