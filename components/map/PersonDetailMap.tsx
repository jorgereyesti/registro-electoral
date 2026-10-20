'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface PersonDetailMapProps {
  lat: number;
  lng: number;
  nombre: string;
  dni: string;
  direccion?: string | null;
  barrio?: string;
  circuito?: string;
}

export default function PersonDetailMap({
  lat,
  lng,
  nombre,
  dni,
  direccion,
  barrio,
  circuito,
}: PersonDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-pin-detail',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #e11d48, #be123c);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(225, 29, 72, 0.45);
        ">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

    const popupHtml = `
      <div class="p-1">
        <strong class="text-sm font-bold text-zinc-900">${nombre}</strong>
        <div class="text-xs text-indigo-600 font-semibold">DNI: ${dni}</div>
        ${direccion ? `<div class="text-xs text-zinc-600 mt-1">${direccion}</div>` : ''}
        ${barrio ? `<div class="text-xs text-zinc-500">${barrio} - Cir. ${circuito}</div>` : ''}
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, nombre, dni, direccion, barrio, circuito]);

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
