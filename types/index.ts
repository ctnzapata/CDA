/**
 * Definiciones de tipos para el Sistema CDA RTM.
 * Alineados con el esquema de Prisma actualizado.
 */

export interface User {
  readonly id: string;
  readonly nombres?: string | null;
  readonly rol: string;
  readonly intentos: number;
  readonly bloqueado: boolean;
}

export type TipoVehiculo = 'Carro' | 'Moto';
export type TipoDocumento = 'CC' | 'NIT' | 'CE' | 'PASAPORTE';

export interface Propietario {
  readonly id: string;
  readonly tipoDocumento: string;
  readonly nombres: string;
  readonly apellidos: string;
  readonly telefono: string;
  readonly email: string;
  readonly direccion: string;
}

export interface Vehiculo {
  readonly placa: string;
  readonly tipoVehiculo: TipoVehiculo;
  readonly marca: string;
  readonly linea: string;
  readonly modelo: number;
  readonly color: string;
  readonly numeroChasis?: string | null;
  readonly numeroMotor?: string | null;
  readonly propietarioId: string;
}

export type EstadoCita = 'Asignada' | 'Rechazada por Deuda';

export interface Cita {
  readonly idCita: string;
  readonly placaVehiculo: string;
  readonly tipoVehiculo: string;
  readonly fechaHora: Date;
  readonly estado: EstadoCita;
}

// DTOs de transporte
export interface LoginResponse {
  readonly success: boolean;
  readonly error?: string;
  readonly user?: User;
}

export interface CitaRegistrationDTO {
  readonly placaVehiculo: string;
  readonly tipoVehiculo: TipoVehiculo;
  readonly fechaHora: string;
}
