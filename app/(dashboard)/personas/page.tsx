import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PersonasTable from '@/components/personas/PersonasTable';
import { PersonaRecord } from '@/lib/types/personas';

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    barrio?: string;
    circuito?: string;
    referente?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const pageSize = Math.max(1, parseInt(params.pageSize || '10', 10));
  const q = params.q?.trim() || '';
  const barrio = params.barrio?.trim() || 'todos';
  const circuito = params.circuito?.trim() || 'todos';
  const referente = params.referente?.trim() || 'todos';

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

  // Total absoluto del padrón en la base de datos
  const { count: totalCount } = await (supabase.from('personas') as any)
    .select('*', { count: 'exact', head: true });

  // Consulta paginada y filtrada en servidor
  let query = (supabase.from('personas') as any)
    .select('*', { count: 'exact' });

  if (q) {
    query = query.or(`dni.ilike.%${q}%,apellido_nombre.ilike.%${q}%`);
  }
  if (barrio && barrio !== 'todos') {
    query = query.eq('barrio', barrio);
  }
  if (circuito && circuito !== 'todos') {
    query = query.eq('circuito', circuito);
  }
  if (referente && referente !== 'todos') {
    query = query.eq('created_by', referente);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: personas, count: filteredCount, error } = await query
    .order('apellido_nombre', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error cargando personas:', error);
  }

  // Obtener catálogo de perfiles (referentes y administradores)
  const { data: perfiles } = await (supabase.from('perfiles') as any)
    .select('id, email, nombre_completo, rol');

  const perfilesMap: Record<string, any> = {};
  (perfiles || []).forEach((p: any) => {
    if (p.id) perfilesMap[p.id] = p;
  });

  // Cruzamos las personas con el perfil del referente creador
  const personasConReferente = (personas || []).map((p: any) => {
    const perf = perfilesMap[p.created_by];
    return {
      ...p,
      referente_nombre: perf?.nombre_completo || perf?.email || 'Sin referente asignado',
      referente_id: p.created_by || 'sin_asignar',
    };
  });

  // Catálogo de referentes para el filtro
  const referentes = (perfiles || []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre_completo || p.email || 'Usuario',
    email: p.email,
    rol: p.rol,
  }));

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

      {/* Tabla con Filtros y Paginación desde Servidor */}
      <PersonasTable
        initialPersonas={(personasConReferente as PersonaRecord[]) || []}
        totalCount={totalCount || 0}
        filteredCount={filteredCount ?? totalCount ?? 0}
        currentUserId={user?.id || ''}
        isAdmin={isAdmin}
        referentes={referentes}
        currentPage={page}
        pageSize={pageSize}
        initialQ={q}
        initialBarrio={barrio}
        initialCircuito={circuito}
        initialReferente={referente}
      />
    </div>
  );
}
