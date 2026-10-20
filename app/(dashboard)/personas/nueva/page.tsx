import React from 'react';
import PersonaForm from '@/components/personas/PersonaForm';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function NuevaPersonaPage() {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/personas"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Alta de Votante
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Registra los datos personales y geolocaliza el domicilio exacto en el mapa.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <PersonaForm />
    </div>
  );
}
