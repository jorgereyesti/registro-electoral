import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PersonaForm from '@/components/personas/PersonaForm';
import Link from 'next/link';
import { ArrowLeft, Edit3 } from 'lucide-react';

export default async function EditarPersonaPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/personas/${persona.id}`}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Editar Votante: {persona.apellido_nombre}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">DNI: {persona.dni}</p>
        </div>
      </div>

      <PersonaForm initialData={persona} isEditing={true} />
    </div>
  );
}
