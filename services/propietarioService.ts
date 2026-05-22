import { prisma } from '@/lib/prisma';
import { PropietarioRegistrationDTO } from '@/types';

/**
 * Servicio para el manejo de Propietarios.
 * Proporciona lógica de negocio para crear y consultar propietarios en la base de datos.
 */
export class PropietarioService {
  /**
   * Registra un nuevo propietario.
   * @param dto Datos del propietario.
   */
  static async registrarPropietario(dto: PropietarioRegistrationDTO) {
    try {
      const { idPropietario, nombre, telefono, correo, direccion } = dto;

      // 1. Validar campos obligatorios
      if (!idPropietario || !nombre || !telefono || !correo || !direccion) {
        return { success: false, error: 'Todos los campos del propietario son obligatorios.' };
      }

      // 2. Comprobar si el propietario ya existe
      const propietarioExistente = await prisma.propietario.findUnique({
        where: { idPropietario: idPropietario.trim() },
      });

      if (propietarioExistente) {
        return {
          success: false,
          error: `El propietario con la cédula/ID ${idPropietario} ya se encuentra registrado.`,
        };
      }

      // 3. Crear el registro en SQLite
      const nuevoPropietario = await prisma.propietario.create({
        data: {
          idPropietario: idPropietario.trim(),
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          correo: correo.trim().toLowerCase(),
          direccion: direccion.trim(),
        },
      });

      return { success: true, propietario: nuevoPropietario };
    } catch (error) {
      console.error('Error en PropietarioService.registrarPropietario:', error);
      return { success: false, error: 'Ocurrió un error en el servidor al registrar el propietario.' };
    }
  }

  /**
   * Obtiene todos los propietarios ordenados alfabéticamente por nombre.
   */
  static async obtenerTodos() {
    try {
      const propietarios = await prisma.propietario.findMany({
        orderBy: { nombre: 'asc' },
      });
      return { success: true, propietarios };
    } catch (error) {
      console.error('Error en PropietarioService.obtenerTodos:', error);
      return { success: false, error: 'Error al consultar la lista de propietarios.' };
    }
  }

  /**
   * Busca un propietario por ID (Cédula) incluyendo sus vehículos vinculados.
   * @param idPropietario Cédula del propietario.
   */
  static async buscarPorId(idPropietario: string) {
    try {
      const propietario = await prisma.propietario.findUnique({
        where: { idPropietario: idPropietario.trim() },
        include: { vehiculos: true },
      });

      if (!propietario) {
        return { success: false, error: 'Propietario no encontrado.' };
      }

      return { success: true, propietario };
    } catch (error) {
      console.error('Error en PropietarioService.buscarPorId:', error);
      return { success: false, error: 'Error al buscar el propietario en el servidor.' };
    }
  }
}
