"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { propietarioSchema } from "@/lib/schemas";

export async function createPropietario(data: unknown) {
  try {
    const validData = propietarioSchema.parse(data);

    // Verificar si ya existe
    const existing = await prisma.propietario.findUnique({
      where: { id: validData.id },
    });

    if (existing) {
      return { success: false, error: "Ya existe un propietario con este documento." };
    }

    await prisma.propietario.create({
      data: validData,
    });

    revalidatePath("/dashboard/propietarios");
    revalidatePath("/dashboard/propietarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating propietario:", error);
    if (error.name === "ZodError") {
      return { success: false, error: "Error de validación de datos." };
    }
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function updatePropietario(id: string, data: unknown) {
  try {
    const validData = propietarioSchema.parse(data);

    await prisma.propietario.update({
      where: { id },
      data: validData,
    });

    revalidatePath("/dashboard/propietarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating propietario:", error);
    return { success: false, error: "Error al actualizar el propietario." };
  }
}

export async function deletePropietario(id: string) {
  try {
    await prisma.propietario.delete({
      where: { id },
    });

    revalidatePath("/dashboard/propietarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting propietario:", error);
    // Verificar error de llave foránea (Prisma P2003)
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "No se puede eliminar el propietario porque tiene vehículos asociados." 
      };
    }
    return { success: false, error: "Error al eliminar el propietario." };
  }
}
