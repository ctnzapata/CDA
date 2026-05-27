import { prisma } from '@/lib/prisma';

/**
 * Servicio para el manejo de Propietarios.
 * Proporciona lógica de negocio para crear y consultar propietarios en la base de datos.
 */
export class PropietarioService {
  /**
   * Registra un nuevo propietario.
   */
  static async registrarPropietario(dto: {
    id: string;
    tipoDocumento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    direccion: string;
  }) {
    try {
      const { id, tipoDocumento, nombres, apellidos, telefono, email, direccion } = dto;

      if (!id || !tipoDocumento || !nombres || !apellidos || !telefono || !email || !direccion) {
        return { success: false, error: 'Todos los campos del propietario son obligatorios.' };
      }

      const existente = await prisma.propietario.findUnique({
        where: { id: id.trim() },
      });

      if (existente) {
        return {
          success: false,
          error: `El propietario con documento ${id} ya se encuentra registrado.`,
        };
      }

      const nuevoPropietario = await prisma.propietario.create({
        data: {
          id: id.trim(),
          tipoDocumento: tipoDocumento.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          telefono: telefono.trim(),
          email: email.trim().toLowerCase(),
          direccion: direccion.trim(),
        },
      });

      return { success: true, propietario: nuevoPropietario };
    } catch (error) {
      console.error('Error en PropietarioService.registrarPropietario:', error);
      return { success: false, error: 'Ocurrió un error al registrar el propietario.' };
    }
  }

  /**
   * Obtiene todos los propietarios ordenados alfabéticamente.
   */
  static async obtenerTodos() {
    try {
      const propietarios = await prisma.propietario.findMany({
        orderBy: { nombres: 'asc' },
      });
      return { success: true, propietarios };
    } catch (error) {
      console.error('Error en PropietarioService.obtenerTodos:', error);
      return { success: false, error: 'Error al consultar la lista de propietarios.' };
    }
  }

  /**
   * Busca un propietario por ID (Documento) incluyendo sus vehículos vinculados.
   */
  static async buscarPorId(id: string) {
    try {
      const propietario = await prisma.propietario.findUnique({
        where: { id: id.trim() },
        include: { vehiculos: true },
      });

      if (!propietario) {
        return { success: false, error: 'Propietario no encontrado.' };
      }

      return { success: true, propietario };
    } catch (error) {
      console.error('Error en PropietarioService.buscarPorId:', error);
      return { success: false, error: 'Error al buscar el propietario.' };
    }
  }
}
