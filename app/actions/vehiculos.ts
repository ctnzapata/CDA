"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { vehicleSchema } from "@/lib/schemas";

export async function createVehiculo(data: unknown) {
  try {
    const validData = vehicleSchema.parse(data);

    // Verificar si ya existe la placa
    const existing = await prisma.vehiculo.findUnique({
      where: { placa: validData.placa },
    });

    if (existing) {
      return { success: false, error: "Ya existe un vehículo con esta placa." };
    }

    // Verificar si el propietario existe
    const propietario = await prisma.propietario.findUnique({
      where: { id: validData.propietarioId },
    });

    if (!propietario) {
      return { success: false, error: "El propietario seleccionado no existe." };
    }

    await prisma.vehiculo.create({
      data: validData,
    });

    revalidatePath("/dashboard/vehiculos");
    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating vehiculo:", error);
    if (error.name === "ZodError") {
      return { success: false, error: "Error de validación de datos." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function updateVehiculo(placa: string, data: unknown) {
  try {
    const validData = vehicleSchema.parse(data);

    await prisma.vehiculo.update({
      where: { placa },
      data: validData,
    });

    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating vehiculo:", error);
    return { success: false, error: "Error al actualizar el vehículo." };
  }
}

export async function deleteVehiculo(placa: string) {
  try {
    await prisma.vehiculo.delete({
      where: { placa },
    });

    revalidatePath("/dashboard/vehiculos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting vehiculo:", error);
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "No se puede eliminar el vehículo porque tiene inspecciones (citas) asociadas." 
      };
    }
    return { success: false, error: "Error al eliminar el vehículo." };
  }
}
