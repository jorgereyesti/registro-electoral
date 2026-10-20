'use client';

import React from 'react';
import Link from 'next/link';
import { DynamicPersonDetailMap } from '@/components/map/DynamicMap';
import {
  User,
  Edit3,
  Calendar,
  Phone,
  Home,
  MapPin,
  Building,
  ShieldCheck,
  Clock,
  Hash,
} from 'lucide-react';

interface PersonaReadOnlyProps {
  persona: {
    id: string;
    dni: string;
    apellido_nombre: string;
    fecha_nacimiento: string;
    telefono?: string | null;
    direccion?: string | null;
    barrio: string;
    circuito: string;
    lat?: number | null;
    lng?: number | null;
    created_at: string;
    perfiles?: {
      email?: string | null;
      nombre_completo?: string | null;
      rol?: string | null;
    } | null;
  };
}

export default function PersonaReadOnly({ persona }: PersonaReadOnlyProps) {
  const birthDate = new Date(persona.fecha_nacimiento);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        {/* Columna Izquierda: Datos del Votante (solo lectura) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Datos del Votante
          </h3>

          {/* DNI */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              DNI
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-mono font-bold">
              <Hash className="w-4 h-4 text-indigo-500 shrink-0" />
              {persona.dni}
            </div>
          </div>

          {/* Apellido y Nombre */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Apellido y Nombre
            </label>
            <div className="px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold">
              {persona.apellido_nombre}
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Fecha de Nacimiento
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{persona.fecha_nacimiento}</span>
              <span className="inline-flex items-center gap-1 ml-auto text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {age} años
              </span>
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Teléfono de Contacto
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className={persona.telefono ? '' : 'text-zinc-400 italic'}>
                {persona.telefono || 'No registrado'}
              </span>
            </div>
          </div>

          {/* Barrio y Circuito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Barrio (SMT)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold">
                <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {persona.barrio}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Circuito Electoral
              </label>
              <div className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold">
                Circuito {persona.circuito}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Dirección (Calle y Número)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl">
              <Home className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className={persona.direccion ? '' : 'text-zinc-400 italic'}>
                {persona.direccion || 'Sin dirección registrada'}
              </span>
            </div>
          </div>

          {/* Trazabilidad de Auditoría */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
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

        {/* Columna Derecha: Geolocalización + Acciones */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Ubicación Cartográfica
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">
              Ubicación georreferenciada del votante en el mapa de San Miguel de Tucumán.
            </p>

            {persona.lat != null && persona.lng != null ? (
              <>
                <DynamicPersonDetailMap
                  lat={persona.lat}
                  lng={persona.lng}
                  nombre={persona.apellido_nombre}
                  dni={persona.dni}
                  direccion={persona.direccion}
                  barrio={persona.barrio}
                  circuito={persona.circuito}
                />
                <p className="text-[11px] text-zinc-400 font-mono text-center mt-2">
                  Coordenadas WGS84: {persona.lat}, {persona.lng}
                </p>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl text-xs text-zinc-400">
                No se han registrado coordenadas para esta persona.
              </div>
            )}
          </div>

          {/* Botón Editar Datos */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/personas"
              className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              Volver al Padrón
            </Link>

            <Link
              href={`/personas/${persona.id}/editar`}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/25 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Datos</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
