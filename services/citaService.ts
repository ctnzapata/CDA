import { prisma } from '@/lib/prisma';
import { verificarDeudaExterna } from '@/lib/externalDebts';
import { CitaRegistrationDTO, EstadoCita } from '@/types';

/**
 * Servicio para el manejo de Citas RTM (Revisión Técnico Mecánica).
 * Implementa las validaciones de la Ley 769 de 2002, como la verificación de deudas externas
 * con la Gobernación de Antioquia y la Secretaría de Movilidad.
 */
export class CitaService {
  /**
   * Registra una nueva cita en el sistema con validación de deudas de tránsito.
   * @param dto Datos de la cita solicitada.
   */
  static async registrarCita(dto: CitaRegistrationDTO) {
    try {
      const { placaVehiculo, tipoVehiculo, fechaHora } = dto;

      // 1. Validar campos obligatorios
      if (!placaVehiculo || !tipoVehiculo || !fechaHora) {
        return {
          success: false,
          error: 'Todos los campos de la cita (placa, tipo de vehículo y fecha/hora) son obligatorios.',
        };
      }

      const placaNormalizada = placaVehiculo.trim().toUpperCase();

      // 2. Validar si el vehículo existe en la base de datos local
      const vehiculoExistente = await prisma.vehiculo.findUnique({
        where: { placa: placaNormalizada },
      });

      if (!vehiculoExistente) {
        return {
          success: false,
          error: `No es posible agendar la cita. El vehículo con placas ${placaNormalizada} no está registrado en el CDA. Regístrelo primero en el módulo de Registro RTM.`,
        };
      }

      // 3. MOTOR DE VALIDACIÓN DE DEUDAS (Ley 769 de 2002)
      // Cruzar la placa contra la base simulada de deudas externas
      const tieneDeuda = verificarDeudaExterna(placaNormalizada);
      const estado: EstadoCita = tieneDeuda ? 'Rechazada por Deuda' : 'Asignada';

      // 4. Crear el registro de la cita en SQLite
      const nuevaCita = await prisma.cita.create({
        data: {
          placaVehiculo: placaNormalizada,
          tipoVehiculo,
          fechaHora: new Date(fechaHora),
          estado,
        },
      });

      if (tieneDeuda) {
        return {
          success: false,
          error: `Solicitud RECHAZADA. El vehículo con placa ${placaNormalizada} posee deudas de tránsito pendientes con la Gobernación de Antioquia y la Secretaría de Movilidad. Según la Ley 769 de 2002, no está autorizado para agendar su RTM.`,
          cita: nuevaCita,
          debtsChecked: true,
        };
      }

      return {
        success: true,
        cita: nuevaCita,
        debtsChecked: true,
      };
    } catch (error) {
      console.error('Error en CitaService.registrarCita:', error);
      return {
        success: false,
        error: 'Ocurrió un error inesperado en el servidor al intentar agendar la cita.',
      };
    }
  }

  /**
   * Obtiene el historial de citas vinculadas a una placa de vehículo.
   * @param placa Placa del vehículo.
   */
  static async obtenerCitasPorPlaca(placa: string) {
    try {
      const placaNormalizada = placa.trim().toUpperCase();
      const citas = await prisma.cita.findMany({
        where: { placaVehiculo: placaNormalizada },
        orderBy: { fechaHora: 'desc' },
      });

      return { success: true, citas };
    } catch (error) {
      console.error('Error en CitaService.obtenerCitasPorPlaca:', error);
      return { success: false, error: 'Error al consultar el historial del vehículo.' };
    }
  }

  /**
   * Obtiene todas las citas asociadas a todos los vehículos de un propietario.
   * @param idPropietario Cédula del propietario.
   */
  static async obtenerCitasPorPropietario(idPropietario: string) {
    try {
      const cedula = idPropietario.trim();

      // Buscamos las citas uniendo a través del vehículo
      const citas = await prisma.cita.findMany({
        where: {
          vehiculo: {
            idPropietario: cedula,
          },
        },
        include: {
          vehiculo: true,
        },
        orderBy: { fechaHora: 'desc' },
      });

      return { success: true, citas };
    } catch (error) {
      console.error('Error en CitaService.obtenerCitasPorPropietario:', error);
      return { success: false, error: 'Error al consultar las citas del propietario.' };
    }
  }

  /**
   * Consulta y lista citas rechazadas por deudas dentro de un rango de fechas.
   * @param fechaInicio Fecha inicial del rango.
   * @param fechaFin Fecha final del rango.
   */
  static async obtenerReporteRechazadosPorFecha(fechaInicio: Date, fechaFin: Date) {
    try {
      // Ajustamos el rango de fechas para que abarque todo el día correspondiente
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);

      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);

      const citasRechazadas = await prisma.cita.findMany({
        where: {
          estado: 'Rechazada por Deuda',
          fechaHora: {
            gte: inicio,
            lte: fin,
          },
        },
        include: {
          vehiculo: {
            include: {
              propietario: true,
            },
          },
        },
        orderBy: { fechaHora: 'desc' },
      });

      const totalRechazados = citasRechazadas.length;

      return {
        success: true,
        citas: citasRechazadas,
        totalRechazados,
      };
    } catch (error) {
      console.error('Error en CitaService.obtenerReporteRechazadosPorFecha:', error);
      return { success: false, error: 'Error al generar el reporte de rechazos por fechas.' };
    }
  }
}
