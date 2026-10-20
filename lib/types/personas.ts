import { z } from 'zod';

export function isMayorDe16(fechaNacimientoStr: string): boolean {
  if (!fechaNacimientoStr) return false;
  const fechaNac = new Date(fechaNacimientoStr + 'T00:00:00');
  if (isNaN(fechaNac.getTime())) return false;
  
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mesDiff = hoy.getMonth() - fechaNac.getMonth();
  
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad >= 16;
}

export const personaSchema = z.object({
  apellido_nombre: z
    .string()
    .min(3, 'El apellido y nombre debe contener al menos 3 caracteres')
    .max(150, 'El nombre es demasiado extenso'),
  dni: z
    .string()
    .regex(/^[0-9]{6,10}$/, 'El DNI debe contener entre 6 y 10 dígitos numéricos sin puntos ni espacios'),
  fecha_nacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((val) => isMayorDe16(val), {
      message: 'Regla Electoral: La persona debe tener al menos 16 años a la fecha de carga',
    }),
  telefono: z.string().optional().default(''),
  direccion: z.string().optional().default(''),
  barrio: z.string().min(1, 'Debe seleccionar un barrio'),
  circuito: z.string().min(1, 'Debe seleccionar un circuito electoral'),
  lat: z.number({ message: 'Debe fijar la ubicación en el mapa' }),
  lng: z.number({ message: 'Debe fijar la ubicación en el mapa' }),
});

export type PersonaFormData = z.infer<typeof personaSchema>;

export interface PersonaRecord {
  id: string;
  dni: string;
  apellido_nombre: string;
  fecha_nacimiento: string;
  telefono: string | null;
  direccion: string | null;
  barrio: string;
  circuito: string;
  lat: number | null;
  lng: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creador?: {
    email: string | null;
    nombre_completo: string | null;
  };
}

export interface PerfilUsuario {
  id: string;
  email: string | null;
  nombre_completo: string | null;
  rol: 'admin' | 'referente';
}
