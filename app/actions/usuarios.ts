"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { usuarioSchema } from "@/lib/schemas";

export async function desbloquearUsuario(formData: FormData) {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw new Error("ID de usuario requerido.");
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        bloqueado: false,
        intentos: 0,
      },
    });

    revalidatePath("/dashboard/usuarios");
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    throw new Error("No se pudo desbloquear el usuario.");
  }
}

export async function createUsuario(data: unknown) {
  try {
    const validData = usuarioSchema.parse(data);

    if (!validData.password) {
      return { success: false, error: "La contraseña es requerida para un usuario nuevo." };
    }

    const existing = await prisma.user.findUnique({
      where: { id: validData.id },
    });

    if (existing) {
      return { success: false, error: "El nombre de usuario ya existe." };
    }

    const hashedPassword = await bcrypt.hash(validData.password, 10);

    await prisma.user.create({
      data: {
        id: validData.id,
        nombres: validData.nombres,
        rol: validData.rol,
        password: hashedPassword,
      },
    });

    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating usuario:", error);
    if (error.name === "ZodError") return { success: false, error: "Error de validación." };
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function updateUsuario(id: string, data: unknown) {
  try {
    const validData = usuarioSchema.parse(data);

    const updateData: any = {
      nombres: validData.nombres,
      rol: validData.rol,
    };

    if (validData.password && validData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(validData.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating usuario:", error);
    return { success: false, error: "Error al actualizar el usuario." };
  }
}

export async function deleteUsuario(id: string) {
  try {
    // Evitar eliminar al admin principal si es necesario, o al propio usuario
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting usuario:", error);
    return { success: false, error: "Error al eliminar el usuario." };
  }
}
