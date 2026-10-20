'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { SMT_CENTER, DEFAULT_ZOOM } from '@/lib/geo/data';
import { buscarDireccionOSM, reverseGeocodeOSM } from '@/lib/geo/nominatim';
import { identificarBarrioYCircuito } from '@/lib/geo/pip';
import { Search, MapPin, Loader2, Compass, CheckCircle2 } from 'lucide-react';

export interface LocationChangePayload {
  lat: number;
  lng: number;
  barrio?: string;
  circuito?: string;
  direccionSugerida?: string;
  isLoadingDireccion?: boolean;
}

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onChange: (payload: LocationChangePayload) => void;
}

export default function LocationPickerMap({
  initialLat,
  initialLng,
  onChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const activeBoundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const reverseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mantener onChange en un ref para evitar recreaciones y bucles infinitos
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // GeoJSON en memoria para Point-in-Polygon
  const geoDataRef = useRef<{ barrios: any; circuitos: any } | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || SMT_CENTER[0],
    lng: initialLng || SMT_CENTER[1],
  });

  const [detectedZone, setDetectedZone] = useState<{ barrio?: string; circuito?: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; displayName: string }[]>([]);
  const [reverseLoading, setReverseLoading] = useState(false);

  // SVG Pin vibrante con Acento Rose-600 (#e11d48) para contraste máximo en OpenStreetMap
  const createPinIcon = () =>
    L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="
          width: 36px; 
          height: 36px; 
          background: linear-gradient(135deg, #e11d48, #be123c); 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 3px solid #ffffff; 
          box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.45);
          cursor: grab;
        ">
          <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

  // Resalta el perímetro poligonal del barrio identificado con Color Primario Indigo-600 (#4f46e5)
  const highlightBarrioPolygon = (barrioFeature: any) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeBoundaryLayerRef.current) {
      map.removeLayer(activeBoundaryLayerRef.current);
      activeBoundaryLayerRef.current = null;
    }

    if (barrioFeature) {
      const boundaryLayer = L.geoJSON(barrioFeature, {
        style: {
          color: '#4f46e5',
          weight: 2.5,
          fillColor: '#6366f1',
          fillOpacity: 0.18,
          dashArray: '4',
        },
      }).addTo(map);

      activeBoundaryLayerRef.current = boundaryLayer;
    }
  };

  // Procesa coordenadas: PIP inmediato + Geocodificación inversa con debounce
  const processCoordinates = useCallback(
    (lat: number, lng: number, shouldReverseGeocode: boolean = true) => {
      let detectedBarrioNombre: string | undefined;
      let detectedCircuitoNumero: string | undefined;

      // 1. Point-in-Polygon 100% local en microsegundos
      if (geoDataRef.current) {
        const pip = identificarBarrioYCircuito(
          lat,
          lng,
          geoDataRef.current.barrios,
          geoDataRef.current.circuitos
        );

        if (pip.barrio) {
          detectedBarrioNombre = pip.barrio.nombre;
          highlightBarrioPolygon(pip.barrio.feature);
        } else {
          highlightBarrioPolygon(null);
        }

        if (pip.circuito) {
          detectedCircuitoNumero = pip.circuito.numero;
        } else if (pip.barrio?.circuitoElectoral) {
          detectedCircuitoNumero = pip.barrio.circuitoElectoral;
        }

        setDetectedZone({
          barrio: detectedBarrioNombre,
          circuito: detectedCircuitoNumero,
        });
      }

      // 2. Notificar inmediatamente barrio y circuito a través del ref estable
      onChangeRef.current({
        lat,
        lng,
        barrio: detectedBarrioNombre,
        circuito: detectedCircuitoNumero,
        isLoadingDireccion: shouldReverseGeocode,
      });

      // 3. Geocodificación inversa con debounce para no saturar APIs
      if (reverseTimeoutRef.current) {
        clearTimeout(reverseTimeoutRef.current);
      }

      if (shouldReverseGeocode) {
        setReverseLoading(true);

        reverseTimeoutRef.current = setTimeout(async () => {
          try {
            const rev = await reverseGeocodeOSM(lat, lng);
            setReverseLoading(false);

            if (rev && rev.calleYNumero) {
              onChangeRef.current({
                lat,
                lng,
                barrio: detectedBarrioNombre,
                circuito: detectedCircuitoNumero,
                direccionSugerida: rev.calleYNumero,
                isLoadingDireccion: false,
              });

              if (markerRef.current) {
                markerRef.current
                  .bindPopup(
                    `<strong>${rev.calleYNumero}</strong><br/>` +
                      (detectedBarrioNombre ? `Barrio: ${detectedBarrioNombre}<br/>` : '') +
                      (detectedCircuitoNumero ? `Circuito: ${detectedCircuitoNumero}` : '')
                  )
                  .openPopup();
              }
            } else {
              onChangeRef.current({
                lat,
                lng,
                barrio: detectedBarrioNombre,
                circuito: detectedCircuitoNumero,
                isLoadingDireccion: false,
              });
            }
          } catch {
            setReverseLoading(false);
          }
        }, 400); // 400ms debounce
      }
    },
    [] // Callback 100% estable
  );

  // Cargar datos GeoJSON una sola vez al montar
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/data/geo/barrios.json').then((r) => r.json()),
      fetch('/data/geo/circuitos.json').then((r) => r.json()),
    ])
      .then(([barrios, circuitos]) => {
        if (!isMounted) return;
        geoDataRef.current = { barrios, circuitos };

        // Si hay coordenadas iniciales (modo edición), detectar zona sin sobreescribir dirección
        if (initialLat && initialLng) {
          processCoordinates(initialLat, initialLng, false);
        }
      })
      .catch((err) => console.error('Error cargando GeoJSON:', err));

    return () => {
      isMounted = false;
      if (reverseTimeoutRef.current) {
        clearTimeout(reverseTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inicializar mapa Leaflet una sola vez al montar
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const startLat = initialLat || SMT_CENTER[0];
    const startLng = initialLng || SMT_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: initialLat && initialLng ? 16 : DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([startLat, startLng], {
      icon: createPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.bindPopup('<b>Ubicación seleccionada</b><br>Haz clic en cualquier calle o mueve el pin.');

    // Evento de fin de arrastre del marcador
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      const lat = Number(pos.lat.toFixed(6));
      const lng = Number(pos.lng.toFixed(6));
      setCurrentCoords({ lat, lng });
      processCoordinates(lat, lng, true);
    });

    // Evento de clic en el mapa
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([lat, lng]);
      setCurrentCoords({ lat, lng });
      processCoordinates(lat, lng, true);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar posición del marcador si cambian props iniciales externamente
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (typeof initialLat === 'number' && typeof initialLng === 'number') {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - initialLat) > 0.0001 || Math.abs(currentPos.lng - initialLng) > 0.0001) {
        markerRef.current.setLatLng([initialLat, initialLng]);
        mapInstanceRef.current.panTo([initialLat, initialLng]);
        setCurrentCoords({ lat: initialLat, lng: initialLng });
      }
    }
  }, [initialLat, initialLng]);

  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await buscarDireccionOSM(searchQuery);
    setSearchResults(results);
    setIsSearching(false);

    if (results.length > 0) {
      seleccionarResultado(results[0]);
    }
  };

  const seleccionarResultado = (result: { lat: number; lng: number; displayName: string }) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const map = mapInstanceRef.current;
    const marker = markerRef.current;

    const lat = Number(result.lat.toFixed(6));
    const lng = Number(result.lng.toFixed(6));

    map.flyTo([lat, lng], 17, { duration: 1.2 });
    marker.setLatLng([lat, lng]);
    setCurrentCoords({ lat, lng });
    setSearchResults([]);

    processCoordinates(lat, lng, true);
  };

  return (
    <div className="space-y-3">
      {/* Buscador de dirección integrado */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar calle o punto en San Miguel de Tucumán (ej: 25 de Mayo 400)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs shadow-indigo-600/20 cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </div>

        {/* Dropdown de resultados de búsqueda */}
        {searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => seleccionarResultado(res)}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 flex items-start gap-2 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                <span className="truncate">{res.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-80 z-0" />

        {/* Barra de estado con detección en tiempo real */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shadow-lg gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-medium">
              <Compass className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="font-mono">{currentCoords.lat}, {currentCoords.lng}</span>
            </div>

            {detectedZone.barrio && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                {detectedZone.barrio} {detectedZone.circuito ? `(Cir. ${detectedZone.circuito})` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {reverseLoading ? (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Consultando OpenStreetMap...
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Punto delimitado</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        🎯 <strong>Georreferenciación inteligente activa:</strong> Haz clic en cualquier calle o arrastra el marcador <span className="text-rose-600 font-semibold dark:text-rose-400">rojo</span> para calcular el polígono, circuito electoral y dirección postal oficial.
      </p>
    </div>
  );
}
