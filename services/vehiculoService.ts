import { prisma } from '@/lib/prisma';
import { VehiculoRegistrationDTO } from '@/types';

/**
 * Servicio para el manejo de Vehículos.
 * Proporciona la lógica de negocio para registrar y consultar vehículos,
 * garantizando la integridad de llave foránea contra Propietarios.
 */
export class VehiculoService {
  /**
   * Registra un nuevo vehículo en el sistema.
   * @param dto Datos del vehículo.
   */
  static async registrarVehiculo(dto: VehiculoRegistrationDTO) {
    try {
      const { placa, tipo, marca, modelo, color, idPropietario } = dto;

      // 1. Validar campos obligatorios
      if (!placa || !tipo || !marca || !modelo || !color || !idPropietario) {
        return { success: false, error: 'Todos los campos del vehículo son obligatorios.' };
      }

      // 2. Normalizar placa (Ej: AAA123 o XMA15G)
      const placaNormalizada = placa.trim().toUpperCase();

      // 3. Comprobar si el vehículo ya existe
      const vehiculoExistente = await prisma.vehiculo.findUnique({
        where: { placa: placaNormalizada },
      });

      if (vehiculoExistente) {
        return {
          success: false,
          error: `El vehículo con placas ${placaNormalizada} ya se encuentra registrado en el sistema.`,
        };
      }

      // 4. REGLA DE NEGOCIO: Validar integridad relacional en el backend.
      // No se puede registrar un vehículo si el idPropietario no existe.
      const propietarioExistente = await prisma.propietario.findUnique({
        where: { idPropietario: idPropietario.trim() },
      });

      if (!propietarioExistente) {
        return {
          success: false,
          error: `No es posible registrar el vehículo. El propietario con cédula ${idPropietario} no está registrado en el sistema. Regístrelo primero.`,
        };
      }

      // 5. Crear el registro de vehículo en SQLite
      const nuevoVehiculo = await prisma.vehiculo.create({
        data: {
          placa: placaNormalizada,
          tipo,
          marca: marca.trim(),
          modelo: modelo.trim(),
          color: color.trim(),
          idPropietario: idPropietario.trim(),
        },
      });

      return { success: true, vehiculo: nuevoVehiculo };
    } catch (error) {
      console.error('Error en VehiculoService.registrarVehiculo:', error);
      return { success: false, error: 'Ocurrió un error en el servidor al registrar el vehículo.' };
    }
  }

  /**
   * Obtiene todos los vehículos registrados con la información básica de su propietario.
   */
  static async obtenerTodos() {
    try {
      const vehiculos = await prisma.vehiculo.findMany({
        include: { propietario: true },
        orderBy: { placa: 'asc' },
      });
      return { success: true, vehiculos };
    } catch (error) {
      console.error('Error en VehiculoService.obtenerTodos:', error);
      return { success: false, error: 'Error al consultar la lista de vehículos.' };
    }
  }

  /**
   * Busca un vehículo por su placa.
   * @param placa Placa del vehículo.
   */
  static async buscarPorPlaca(placa: string) {
    try {
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { placa: placa.trim().toUpperCase() },
        include: { propietario: true, citas: true },
      });

      if (!vehiculo) {
        return { success: false, error: 'Vehículo no encontrado.' };
      }

      return { success: true, vehiculo };
    } catch (error) {
      console.error('Error en VehiculoService.buscarPorPlaca:', error);
      return { success: false, error: 'Error al buscar el vehículo.' };
    }
  }
}
