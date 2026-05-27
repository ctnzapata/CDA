import { z } from "zod";

const currentYear = new Date().getFullYear();
const minYear = currentYear - 20;
const maxYear = currentYear + 2;

// --- PROPIETARIO ---
export const propietarioSchema = z.object({
  id: z.string().trim().min(5, "El documento debe tener al menos 5 dígitos."),
  tipoDocumento: z.enum(["CC", "NIT", "CE", "PASAPORTE"], {
    required_error: "Debes seleccionar un tipo de documento.",
  }),
  nombres: z.string().trim().min(2, "Los nombres son requeridos."),
  apellidos: z.string().trim().min(2, "Los apellidos son requeridos."),
  telefono: z.string().trim().min(7, "El teléfono debe tener al menos 7 dígitos."),
  email: z.string().trim().email("Debe ser un correo electrónico válido."),
  direccion: z.string().trim().min(5, "La dirección es obligatoria."),
});

export type PropietarioFormData = z.infer<typeof propietarioSchema>;

// --- VEHÍCULO ---
export const vehicleSchema = z.object({
  placa: z.string().trim().toUpperCase().min(1, "La placa es obligatoria"),
  tipoVehiculo: z.enum(["Carro", "Moto"], {
    required_error: "Debes seleccionar un tipo de vehículo.",
  }),
  marca: z.string().trim().min(2, "La marca debe tener al menos 2 caracteres."),
  linea: z.string().trim().min(2, "La línea es obligatoria."),
  modelo: z.coerce
    .number({
      required_error: "El año del modelo es obligatorio.",
      invalid_type_error: "El año debe ser numérico.",
    })
    .int("Debe ser un año entero")
    .min(minYear, { message: `El modelo no puede ser anterior a ${minYear}.` })
    .max(maxYear, { message: `El modelo no puede ser mayor a ${maxYear}.` }),
  color: z.string().trim().min(3, "El color debe tener al menos 3 caracteres."),
  numeroChasis: z.string().trim().optional(),
  numeroMotor: z.string().trim().optional(),
  propietarioId: z.string().trim().min(5, "Debes seleccionar o ingresar una cédula válida."),
}).superRefine((data, ctx) => {
  if (data.tipoVehiculo === "Carro") {
    if (!/^[A-Z]{3}\d{3}$/.test(data.placa)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placa inválida para carro. Formato esperado: AAA123.",
        path: ["placa"],
      });
    }
  } else if (data.tipoVehiculo === "Moto") {
    if (!/^[A-Z]{3}\d{2}[A-Z]$/.test(data.placa)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placa inválida para moto. Formato esperado: AAA12A.",
        path: ["placa"],
      });
    }
  }
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// --- USUARIO ---
export const usuarioSchema = z.object({
  id: z.string().trim().min(4, "El nombre de usuario debe tener al menos 4 caracteres."),
  password: z.string().optional().refine(
    (val) => !val || val.length === 0 || val.length >= 6,
    { message: "Si ingresas una contraseña, debe tener al menos 6 caracteres." }
  ),
  nombres: z.string().trim().min(2, "Los nombres son requeridos."),
  rol: z.enum(["ADMIN", "TECNICO"]),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

// --- CITA (RTM) ---
// Generamos los slots válidos desde las 07:00 hasta las 17:00 en intervalos de 30 minutos.
export const VALID_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", 
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00"
] as const;

export const citaSchema = z.object({
  placaVehiculo: z.string().trim().toUpperCase().min(1, "La placa es obligatoria"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD"),
  horaSlot: z.enum(VALID_SLOTS, {
    errorMap: () => ({ message: "Bloque horario no válido o fuera del rango operativo." })
  }),
  observaciones: z.string().trim().optional(),
});

export type CitaFormData = z.infer<typeof citaSchema>;
