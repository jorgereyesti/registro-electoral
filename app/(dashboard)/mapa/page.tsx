import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DynamicGeneralMap } from '@/components/map/DynamicMap';
import { PersonaRecord } from '@/lib/types/personas';
import { Map } from 'lucide-react';

export default async function MapaGeneralPage() {
  const supabase = await createClient();

  // Cargamos los registros con coordenadas para el mapa
  const { data: personas, error } = await (supabase.from('personas') as any)
    .select('id, dni, apellido_nombre, barrio, circuito, direccion, telefono, lat, lng, created_at')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (error) {
    console.error('Error cargando personas para el mapa:', error);
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
        <DynamicGeneralMap personas={(personas as PersonaRecord[]) || []} />
      </div>
    </div>
  );
}
