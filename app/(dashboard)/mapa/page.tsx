import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DynamicGeneralMap } from '@/components/map/DynamicMap';
import { PersonaRecord } from '@/lib/types/personas';
import { Map } from 'lucide-react';

export default async function MapaGeneralPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Cargamos los registros con coordenadas para el mapa incluyendo created_by y fecha_nacimiento
  const { data: personas, error } = await (supabase.from('personas') as any)
    .select('id, dni, apellido_nombre, fecha_nacimiento, barrio, circuito, direccion, telefono, lat, lng, created_at, created_by')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (error) {
    console.error('Error cargando personas para el mapa:', error);
  }

  // 2. Cargamos el catálogo de perfiles (referentes y administradores)
  const { data: perfiles } = await (supabase.from('perfiles') as any)
    .select('id, email, nombre_completo, rol');

  const perfilesMap: Record<string, any> = {};
  (perfiles || []).forEach((p: any) => {
    if (p.id) perfilesMap[p.id] = p;
  });

  // 3. Cruzamos a cada persona con los datos de su referente
  const personasConReferente = (personas || []).map((p: any) => {
    const perfil = perfilesMap[p.created_by];
    return {
      ...p,
      referente_nombre: perfil?.nombre_completo || perfil?.email || 'Sin referente asignado',
      referente_id: p.created_by || 'sin_asignar',
    };
  });

  // 4. Lista limpia de referentes disponibles para el filtro
  const referentes = (perfiles || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre_completo || p.email || 'Usuario',
    email: p.email,
    rol: p.rol,
  }));

  // Si viene un votante focalizado desde el padrón (?persona=uuid)
  let focusPersona: PersonaRecord | null = null;
  if (params.persona) {
    const { data } = await (supabase.from('personas') as any)
      .select('*')
      .eq('id', params.persona)
      .single();
    if (data) focusPersona = data as PersonaRecord;
  }

  return (
    <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Mapa General de San Miguel de Tucumán
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visualización geoespacial con marcadores en acento <span className="font-semibold text-rose-600 dark:text-rose-400">rose-600</span>, agrupamiento dinámico (clusters) y delimitación de 354 Barrios y 47 Circuitos Electorales.
          </p>
        </div>
      </div>

      {/* Componente del Mapa Aislado */}
      <div className="flex-1 w-full min-h-0">
        <DynamicGeneralMap
          personas={(personasConReferente as PersonaRecord[]) || []}
          focusPersona={focusPersona}
          referentes={referentes}
        />
      </div>
    </div>
  );
}
