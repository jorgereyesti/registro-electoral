import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PersonaReadOnly from '@/components/personas/PersonaReadOnly';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function PersonaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: persona, error } = await (supabase.from('personas') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !persona) {
    notFound();
  }

  let perfil = null;
  if (persona.created_by) {
    const { data: perfilData } = await (supabase.from('perfiles') as any)
      .select('email, nombre_completo, rol')
      .eq('id', persona.created_by)
      .single();
    perfil = perfilData;
  }

  const personaConPerfil = {
    ...persona,
    perfiles: perfil,
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior */}
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

      {/* Ficha de Solo Lectura */}
      <PersonaReadOnly persona={personaConPerfil} />
    </div>
  );
}
