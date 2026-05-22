/**
 * Base de datos simulada de deudas de tránsito.
 * Representa la consulta externa realizada a la Gobernación de Antioquia y a la Secretaría de Movilidad.
 * De acuerdo con la Ley 769 de 2002, los vehículos con deudas pendientes no pueden obtener la aprobación de su cita.
 */
export const EXTERNAL_DEBTS: readonly string[] = [
  'XMA15G',
  'AAA123',
  'CDA999',
  'MOR888',
  'DEU456'
];

/**
 * Función que verifica si una placa posee deudas activas con las entidades de tránsito.
 * @param placa Placa del vehículo a consultar.
 * @returns Verdadero si la placa posee deudas pendientes; de lo contrario, falso.
 */
export function verificarDeudaExterna(placa: string): boolean {
  if (!placa) return false;
  
  // Limpieza y normalización de la placa para evitar fallos de formato
  const placaNormalizada = placa.trim().toUpperCase();
  return EXTERNAL_DEBTS.includes(placaNormalizada);
}
