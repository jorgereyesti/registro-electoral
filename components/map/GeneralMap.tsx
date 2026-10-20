'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { BARRIOS_LIST, CIRCUITOS_LIST, SMT_CENTER, DEFAULT_ZOOM } from '@/lib/geo/data';
import { PersonaRecord } from '@/lib/types/personas';
import { Filter, Users, Layers, Eye, RefreshCw, MapPin } from 'lucide-react';

interface GeneralMapProps {
  personas: PersonaRecord[];
  onPersonaSelect?: (persona: PersonaRecord) => void;
}

export default function GeneralMap({ personas, onPersonaSelect }: GeneralMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const barriosLayerRef = useRef<L.GeoJSON | null>(null);
  const circuitosLayerRef = useRef<L.GeoJSON | null>(null);

  // States
  const [selectedBarrio, setSelectedBarrio] = useState<string>('todos');
  const [selectedCircuito, setSelectedCircuito] = useState<string>('todos');
  const [showBarriosLayer, setShowBarriosLayer] = useState<boolean>(true);
  const [showCircuitosLayer, setShowCircuitosLayer] = useState<boolean>(false);
  const [geoJsonData, setGeoJsonData] = useState<{ barrios: any; circuitos: any } | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaRecord | null>(null);

  // Filtered personas based on selects
  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const matchBarrio = selectedBarrio === 'todos' || p.barrio.toLowerCase() === selectedBarrio.toLowerCase();
      const matchCircuito = selectedCircuito === 'todos' || p.circuito.toLowerCase() === selectedCircuito.toLowerCase();
      return matchBarrio && matchCircuito && p.lat != null && p.lng != null;
    });
  }, [personas, selectedBarrio, selectedCircuito]);

  // Load GeoJSON data in background
  useEffect(() => {
    Promise.all([
      fetch('/data/geo/barrios.json').then((r) => r.json()),
      fetch('/data/geo/circuitos.json').then((r) => r.json()),
    ])
      .then(([barrios, circuitos]) => {
        setGeoJsonData({ barrios, circuitos });
      })
      .catch((err) => console.error('Error cargando capas GeoJSON:', err));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SMT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Initialize Cluster Group
    const clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync GeoJSON layers when toggled or loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData) return;

    // Barrio Layer
    if (barriosLayerRef.current) {
      map.removeLayer(barriosLayerRef.current);
      barriosLayerRef.current = null;
    }

    if (showBarriosLayer && geoJsonData.barrios) {
      const bLayer = L.geoJSON(geoJsonData.barrios, {
        style: (feature) => {
          const isSelected = selectedBarrio !== 'todos' && feature?.properties?.NOMBRE === selectedBarrio;
          return {
            color: isSelected ? '#4f46e5' : '#71717a',
            weight: isSelected ? 3 : 1,
            fillColor: isSelected ? '#6366f1' : '#a1a1aa',
            fillOpacity: isSelected ? 0.35 : 0.08,
            dashArray: isSelected ? undefined : '3',
          };
        },
        onEachFeature: (feature, layer) => {
          const nombre = feature.properties?.NOMBRE;
          const circuito = feature.properties?.CIRCUITO_ELECTORAL;
          layer.bindTooltip(`<strong>Barrio:</strong> ${nombre}<br/><span class="text-xs text-zinc-500">Circuito: ${circuito}</span>`, {
            sticky: true,
          });
          layer.on('click', () => {
            if (nombre) setSelectedBarrio(nombre);
          });
        },
      });

      bLayer.addTo(map);
      barriosLayerRef.current = bLayer;
    }

    // Circuito Layer
    if (circuitosLayerRef.current) {
      map.removeLayer(circuitosLayerRef.current);
      circuitosLayerRef.current = null;
    }

    if (showCircuitosLayer && geoJsonData.circuitos) {
      const cLayer = L.geoJSON(geoJsonData.circuitos, {
        style: (feature) => {
          const isSelected = selectedCircuito !== 'todos' && String(feature?.properties?.NUMERO_CIR) === selectedCircuito;
          return {
            color: isSelected ? '#e11d48' : '#fb7185',
            weight: isSelected ? 3.5 : 1.5,
            fillColor: isSelected ? '#f43f5e' : '#ffe4e6',
            fillOpacity: isSelected ? 0.3 : 0.12,
          };
        },
        onEachFeature: (feature, layer) => {
          const num = feature.properties?.NUMERO_CIR;
          layer.bindTooltip(`<strong>Circuito Electoral Nº ${num}</strong>`, { sticky: true });
          layer.on('click', () => {
            if (num) setSelectedCircuito(String(num));
          });
        },
      });

      cLayer.addTo(map);
      circuitosLayerRef.current = cLayer;
    }
  }, [geoJsonData, showBarriosLayer, showCircuitosLayer, selectedBarrio, selectedCircuito]);

  // Sync Markers into Cluster Group using Rose-600 Map Accent (#e11d48)
  useEffect(() => {
    const cluster = clusterGroupRef.current;
    const map = mapInstanceRef.current;
    if (!cluster || !map) return;

    cluster.clearLayers();

    const pinIcon = L.divIcon({
      className: 'custom-person-marker',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: #e11d48;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13],
    });

    const newMarkers: L.Marker[] = [];

    filteredPersonas.forEach((p) => {
      if (p.lat == null || p.lng == null) return;

      const marker = L.marker([p.lat, p.lng], { icon: pinIcon });

      const popupHtml = `
        <div class="p-1 min-w-[200px]">
          <div class="font-bold text-sm text-zinc-900">${p.apellido_nombre}</div>
          <div class="text-xs text-indigo-600 font-semibold mt-0.5">DNI: ${p.dni}</div>
          <hr class="my-1.5 border-zinc-200" />
          <div class="text-xs text-zinc-600 space-y-0.5">
            <div><strong>Barrio:</strong> ${p.barrio}</div>
            <div><strong>Circuito:</strong> ${p.circuito}</div>
            ${p.direccion ? `<div><strong>Dirección:</strong> ${p.direccion}</div>` : ''}
            ${p.telefono ? `<div><strong>Tel:</strong> ${p.telefono}</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setActivePersona(p);
        if (onPersonaSelect) onPersonaSelect(p);
      });

      newMarkers.push(marker);
    });

    cluster.addLayers(newMarkers);

    // Auto-fit bounds if we have filtered markers
    if (newMarkers.length > 0 && (selectedBarrio !== 'todos' || selectedCircuito !== 'todos')) {
      const groupBounds = cluster.getBounds();
      if (groupBounds.isValid()) {
        map.fitBounds(groupBounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [filteredPersonas, selectedBarrio, selectedCircuito]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Panel Superior de Controles y Métricas */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Filtros:</span>
          </div>

          {/* Barrio Select */}
          <select
            value={selectedBarrio}
            onChange={(e) => setSelectedBarrio(e.target.value)}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Barrios</option>
            {BARRIOS_LIST.map((b) => (
              <option key={b.nombre} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>

          {/* Circuito Select */}
          <select
            value={selectedCircuito}
            onChange={(e) => setSelectedCircuito(e.target.value)}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Circuitos</option>
            {CIRCUITOS_LIST.map((c) => (
              <option key={c.numero} value={c.numero}>
                Circuito {c.numero}
              </option>
            ))}
          </select>

          {(selectedBarrio !== 'todos' || selectedCircuito !== 'todos') && (
            <button
              onClick={() => {
                setSelectedBarrio('todos');
                setSelectedCircuito('todos');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Restablecer
            </button>
          )}
        </div>

        {/* Toggle de Capas y Métricas */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setShowBarriosLayer(!showBarriosLayer)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                showBarriosLayer
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Barrios (362)
            </button>
            <button
              onClick={() => setShowCircuitosLayer(!showCircuitosLayer)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                showCircuitosLayer
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Circuitos (47)
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{filteredPersonas.length} Votantes</span>
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa y Drawer de Detalle Lateral */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[500px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Tarjeta flotante de votante seleccionado */}
        {activePersona && (
          <div className="absolute top-4 left-4 z-20 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl space-y-2 animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Votante Georreferenciado
              </span>
              <button
                onClick={() => setActivePersona(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              {activePersona.apellido_nombre}
            </div>
            <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
              DNI: <strong className="text-zinc-900 dark:text-zinc-100">{activePersona.dni}</strong>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-0.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div>📍 <strong>Barrio:</strong> {activePersona.barrio}</div>
              <div>🗳️ <strong>Circuito:</strong> {activePersona.circuito}</div>
              {activePersona.direccion && <div>🏠 <strong>Dirección:</strong> {activePersona.direccion}</div>}
              {activePersona.telefono && <div>📞 <strong>Teléfono:</strong> {activePersona.telefono}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
