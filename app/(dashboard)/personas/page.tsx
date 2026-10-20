import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PersonasTable from '@/components/personas/PersonasTable';
import { PersonaRecord } from '@/lib/types/personas';

export default async function PersonasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener perfil del usuario
  const { data: perfil } = await (supabase.from('perfiles') as any)
    .select('*')
    .eq('id', user?.id)
    .single();

  const isAdmin = perfil?.rol === 'admin';

  // Obtener listado de personas (respetando las políticas RLS)
  const { data: personas, count, error } = await (supabase.from('personas') as any)
    .select('*', { count: 'exact' })
    .order('apellido_nombre', { ascending: true });

  if (error) {
    console.error('Error cargando personas:', error);
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Padrón de Votantes
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Gestión, búsqueda, exportación y georreferenciación de personas en San Miguel de Tucumán.
        </p>
      </div>

      {/* Tabla con Filtros y Acciones */}
      <PersonasTable
        initialPersonas={(personas as PersonaRecord[]) || []}
        totalCount={count || 0}
        currentUserId={user?.id || ''}
        isAdmin={isAdmin}
      />
    </div>
  );
}
