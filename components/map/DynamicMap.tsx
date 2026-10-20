'use client';

import dynamic from 'next/dynamic';
import React from 'react';

function MapSkeleton({ message = 'Cargando visualizador cartográfico...' }: { message?: string }) {
  return (
    <div className="w-full h-full min-h-[420px] bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-6 text-zinc-600 dark:text-zinc-400 animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{message}</p>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Sincronizando capas OpenStreetMap y PostGIS...</span>
    </div>
  );
}

export const DynamicLocationPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  {
    ssr: false,
    loading: () => <MapSkeleton message="Cargando selector de ubicación..." />,
  }
);

export const DynamicGeneralMap = dynamic(
  () => import('./GeneralMap'),
  {
    ssr: false,
    loading: () => <MapSkeleton message="Cargando mapa electoral interactivo..." />,
  }
);

export const DynamicPersonDetailMap = dynamic(
  () => import('./PersonDetailMap'),
  {
    ssr: false,
    loading: () => <MapSkeleton message="Cargando geolocalización de la persona..." />,
  }
);
