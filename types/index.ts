/**
 * Definiciones de tipos estrictas e inmutables para el MVP de RTM.
 * De acuerdo con la skill 'typescript-expert', no se emplea el tipo 'any'.
 */

export interface User {
  readonly id: string;
  readonly intentos: number;
  readonly bloqueado: boolean;
}

export type TipoVehiculo = 'Carro' | 'Moto';

export interface Propietario {
  readonly idPropietario: string; // Cédula del propietario
  readonly nombre: string;
  readonly telefono: string;
  readonly correo: string;
  readonly direccion: string;
}

export interface Vehiculo {
  readonly placa: string;
  readonly tipo: TipoVehiculo;
  readonly marca: string;
  readonly modelo: string;
  readonly color: string;
  readonly idPropietario: string;
}

export type EstadoCita = 'Asignada' | 'Rechazada por Deuda';

export interface Cita {
  readonly idCita: string;
  readonly placaVehiculo: string;
  readonly tipoVehiculo: string;
  readonly fechaHora: Date;
  readonly estado: EstadoCita;
}

// Interfaces de transporte de datos (DTOs)
export interface LoginResponse {
  readonly success: boolean;
  readonly error?: string;
  readonly user?: User;
}

export interface CitaRegistrationDTO {
  readonly placaVehiculo: string;
  readonly tipoVehiculo: TipoVehiculo;
  readonly fechaHora: string; // Viene serializado como ISO String
}

export interface PropietarioRegistrationDTO {
  readonly idPropietario: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly correo: string;
  readonly direccion: string;
}

export interface VehiculoRegistrationDTO {
  readonly placa: string;
  readonly tipo: TipoVehiculo;
  readonly marca: string;
  readonly modelo: string;
  readonly color: string;
  readonly idPropietario: string;
}
