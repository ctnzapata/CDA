import { prisma } from '@/lib/prisma';

/**
 * Servicio para el manejo de Vehículos.
 * Proporciona la lógica de negocio para registrar y consultar vehículos,
 * garantizando la integridad de llave foránea contra Propietarios.
 */
export class VehiculoService {
  /**
   * Registra un nuevo vehículo en el sistema.
   */
  static async registrarVehiculo(dto: {
    placa: string;
    tipoVehiculo: string;
    marca: string;
    linea: string;
    modelo: number;
    color: string;
    numeroChasis?: string;
    numeroMotor?: string;
    propietarioId: string;
  }) {
    try {
      const { placa, tipoVehiculo, marca, linea, modelo, color, numeroChasis, numeroMotor, propietarioId } = dto;

      if (!placa || !tipoVehiculo || !marca || !linea || !modelo || !color || !propietarioId) {
        return { success: false, error: 'Todos los campos del vehículo son obligatorios.' };
      }

      const placaNormalizada = placa.trim().toUpperCase();

      const vehiculoExistente = await prisma.vehiculo.findUnique({
        where: { placa: placaNormalizada },
      });

      if (vehiculoExistente) {
        return {
          success: false,
          error: `El vehículo con placas ${placaNormalizada} ya se encuentra registrado.`,
        };
      }

      const propietarioExistente = await prisma.propietario.findUnique({
        where: { id: propietarioId.trim() },
      });

      if (!propietarioExistente) {
        return {
          success: false,
          error: `No es posible registrar el vehículo. El propietario con documento ${propietarioId} no está registrado.`,
        };
      }

      const nuevoVehiculo = await prisma.vehiculo.create({
        data: {
          placa: placaNormalizada,
          tipoVehiculo,
          marca: marca.trim(),
          linea: linea.trim(),
          modelo,
          color: color.trim(),
          numeroChasis: numeroChasis?.trim() || null,
          numeroMotor: numeroMotor?.trim() || null,
          propietarioId: propietarioId.trim(),
        },
      });

      return { success: true, vehiculo: nuevoVehiculo };
    } catch (error) {
      console.error('Error en VehiculoService.registrarVehiculo:', error);
      return { success: false, error: 'Ocurrió un error al registrar el vehículo.' };
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
