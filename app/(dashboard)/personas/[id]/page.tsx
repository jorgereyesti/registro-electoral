import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DynamicPersonDetailMap } from '@/components/map/DynamicMap';
import { ArrowLeft, Edit3, Calendar, Phone, MapPin, Building, ShieldCheck, Clock } from 'lucide-react';

export default async function PersonaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: persona, error } = await (supabase.from('personas') as any)
    .select(`
      *,
      perfiles:created_by (
        email,
        nombre_completo,
        rol
      )
    `)
    .eq('id', id)
    .single();

  if (error || !persona) {
    notFound();
  }

  const birthDate = new Date(persona.fecha_nacimiento);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Barra Superior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/personas"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              Ficha del Votante
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">DNI: {persona.dni}</p>
          </div>
        </div>

        <Link
          href={`/personas/${persona.id}/editar`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shadow-indigo-600/20 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar Datos</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ficha de Información */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {persona.barrio} • Circuito {persona.circuito}
            </span>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
              {persona.apellido_nombre}
            </h2>
            <div className="inline-block mt-1 font-mono text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold">
              DNI: {persona.dni}
            </div>
          </div>

          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Fecha de Nacimiento:</strong> {persona.fecha_nacimiento} ({age} años)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Teléfono:</strong> {persona.telefono || 'No registrado'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                <strong>Dirección:</strong> {persona.direccion || 'Sin dirección exacta'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Barrio Oficial:</strong> {persona.barrio}
              </span>
            </div>
          </div>

          {/* Trazabilidad de Auditoría */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Registrado por:{' '}
                <strong>
                  {persona.perfiles?.nombre_completo || persona.perfiles?.email || 'Usuario del sistema'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alta efectuada: {new Date(persona.created_at).toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

        {/* Mapa con la ubicación exacta */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Ubicación Cartográfica
          </h3>
          {persona.lat != null && persona.lng != null ? (
            <DynamicPersonDetailMap
              lat={persona.lat}
              lng={persona.lng}
              nombre={persona.apellido_nombre}
              dni={persona.dni}
              direccion={persona.direccion}
              barrio={persona.barrio}
              circuito={persona.circuito}
            />
          ) : (
            <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl text-xs text-zinc-400">
              No se han registrado coordenadas para esta persona.
            </div>
          )}
          {persona.lat != null && (
            <p className="text-[11px] text-zinc-400 font-mono text-center">
              Coordenadas WGS84: {persona.lat}, {persona.lng}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
