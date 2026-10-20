'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { BARRIOS_LIST, CIRCUITOS_LIST, SMT_CENTER, DEFAULT_ZOOM } from '@/lib/geo/data';
import { PersonaRecord } from '@/lib/types/personas';
import {
  Filter,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  ZoomIn,
  Layers,
  Maximize2,
  Minimize2,
  Globe,
  Sun,
  Moon,
  Mountain,
  Map as MapIcon,
  FileSpreadsheet,
  Printer,
  Search,
  X,
  ShieldCheck,
  UserCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const ZOOM_THRESHOLD = 15; // Umbral: < 15 etiquetas de circuitos, >= 15 detalle de votantes

// Tipos de capas base OpenStreetMap y satelitales
type BaseLayerType = 'osm' | 'satellite' | 'light' | 'dark' | 'topo';

interface BaseLayerConfig {
  id: BaseLayerType;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const BASE_LAYERS: Record<BaseLayerType, BaseLayerConfig> = {
  osm: {
    id: 'osm',
    name: 'Calles (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satélite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  light: {
    id: 'light',
    name: 'Claro Minimalista',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  dark: {
    id: 'dark',
    name: 'Modo Oscuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  topo: {
    id: 'topo',
    name: 'Topográfico',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
};

export interface ReferenteOption {
  id: string;
  nombre: string;
  email?: string | null;
  rol?: string | null;
}

export type PersonaWithReferente = PersonaRecord & {
  referente_nombre?: string;
  referente_id?: string;
};

interface GeneralMapProps {
  personas: PersonaWithReferente[];
  focusPersona?: PersonaRecord | null;
  referentes?: ReferenteOption[];
  onPersonaSelect?: (persona: PersonaRecord) => void;
}

export default function GeneralMap({
  personas,
  focusPersona,
  referentes = [],
  onPersonaSelect,
}: GeneralMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const barriosLayerRef = useRef<L.GeoJSON | null>(null);
  const circuitosLayerRef = useRef<L.GeoJSON | null>(null);
  const circuitLabelsLayerRef = useRef<L.LayerGroup | null>(null);
  const focusAppliedRef = useRef<boolean>(false);

  // States de Filtros
  const [selectedBarrio, setSelectedBarrio] = useState<string>('todos');
  const [selectedCircuito, setSelectedCircuito] = useState<string>('todos');
  const [selectedReferente, setSelectedReferente] = useState<string>('todos');

  // States de Capas y Visualización
  const [showBarriosLayer, setShowBarriosLayer] = useState<boolean>(true);
  const [showCircuitosLayer, setShowCircuitosLayer] = useState<boolean>(true);
  const [showVotantesLayer, setShowVotantesLayer] = useState<boolean>(true);
  const [showDensityMode, setShowDensityMode] = useState<boolean>(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayerType>('osm');
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);

  // States de Datos y Modal
  const [geoJsonData, setGeoJsonData] = useState<{ barrios: any; circuitos: any } | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaRecord | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [showVotantesModal, setShowVotantesModal] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');

  // Estadísticas de cobertura electoral por barrio, circuito y referente
  const voterStats = useMemo(() => {
    const byCircuito: Record<string, number> = {};
    const byBarrio: Record<string, number> = {};
    const byReferente: Record<string, number> = {};

    personas.forEach((p) => {
      if (p.circuito) {
        const cKey = String(p.circuito).trim();
        byCircuito[cKey] = (byCircuito[cKey] || 0) + 1;
      }
      if (p.barrio) {
        const bKey = p.barrio.toLowerCase().trim();
        byBarrio[bKey] = (byBarrio[bKey] || 0) + 1;
      }
      if (p.created_by) {
        byReferente[p.created_by] = (byReferente[p.created_by] || 0) + 1;
      }
    });

    let emptyCircuitsCount = 0;
    CIRCUITOS_LIST.forEach((c) => {
      if (!byCircuito[c.numero]) emptyCircuitsCount++;
    });

    return { byCircuito, byBarrio, byReferente, emptyCircuitsCount };
  }, [personas]);

  // Votantes filtrados según Barrio, Circuito y Referente
  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      const matchBarrio =
        selectedBarrio === 'todos' || p.barrio.toLowerCase() === selectedBarrio.toLowerCase();
      const matchCircuito =
        selectedCircuito === 'todos' || p.circuito.toLowerCase() === selectedCircuito.toLowerCase();
      const matchReferente =
        selectedReferente === 'todos' ||
        p.created_by === selectedReferente ||
        p.referente_id === selectedReferente;

      return matchBarrio && matchCircuito && matchReferente && p.lat != null && p.lng != null;
    });
  }, [personas, selectedBarrio, selectedCircuito, selectedReferente]);

  // Votantes visibles dentro del modal flotante con buscador propio
  const modalPersonas = useMemo(() => {
    const q = modalSearch.toLowerCase().trim();
    if (!q) return filteredPersonas;
    return filteredPersonas.filter(
      (p) =>
        p.dni.includes(q) ||
        p.apellido_nombre.toLowerCase().includes(q) ||
        (p.referente_nombre && p.referente_nombre.toLowerCase().includes(q))
    );
  }, [filteredPersonas, modalSearch]);

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

  // Sincronizador de capas según nivel de zoom (LOD)
  const syncLayersByZoom = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const zoom = map.getZoom();
    setCurrentZoom(zoom);
    const isCloseUp = zoom >= ZOOM_THRESHOLD;

    // 1. Capa de etiquetas de circuito: visible solo si zoom < 15
    if (circuitLabelsLayerRef.current) {
      if (showCircuitosLayer && !isCloseUp) {
        if (!map.hasLayer(circuitLabelsLayerRef.current)) {
          map.addLayer(circuitLabelsLayerRef.current);
        }
      } else {
        if (map.hasLayer(circuitLabelsLayerRef.current)) {
          map.removeLayer(circuitLabelsLayerRef.current);
        }
      }
    }

    // 2. Capa de votantes: sincronizada con toggle showVotantesLayer
    if (clusterGroupRef.current) {
      if (showVotantesLayer) {
        if (!map.hasLayer(clusterGroupRef.current)) {
          map.addLayer(clusterGroupRef.current);
        }
      } else {
        if (map.hasLayer(clusterGroupRef.current)) {
          map.removeLayer(clusterGroupRef.current);
        }
      }
    }
  }, [showCircuitosLayer, showVotantesLayer]);

  // Manejo de pantalla completa
  const toggleFullscreen = useCallback(() => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch((err) => console.error('Error fullscreen:', err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error('Error exit fullscreen:', err));
      }
    }
  }, []);

  // Listener del evento nativo fullscreenchange
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
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

    // Capa base inicial
    const baseConfig = BASE_LAYERS[baseLayer];
    const tileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
    }).addTo(map);
    baseTileLayerRef.current = tileLayer;

    // Cluster Group
    const clusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 70, // ~200-250m en zoom 15/16
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        if (count >= 10) {
          return L.divIcon({
            className: 'cluster-dense-node',
            html: `
              <div class="cluster-dense-inner" title="Núcleo de ${count} votantes en ~2 cuadras a la redonda">
                <span>+${count}</span>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });
        }

        return L.divIcon({
          className: 'cluster-regular-node',
          html: `
            <div class="cluster-regular-inner" title="${count} votantes cercanos">
              <span>${count}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      },
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    map.on('zoomend', () => {
      syncLayersByZoom();
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [syncLayersByZoom]);

  // Cambio de capa base
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const config = BASE_LAYERS[baseLayer];
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    newTileLayer.bringToBack();
    baseTileLayerRef.current = newTileLayer;
  }, [baseLayer]);

  // Sync GeoJSON layers when toggled or loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData) return;

    // 1. Barrio Layer
    if (barriosLayerRef.current) {
      map.removeLayer(barriosLayerRef.current);
      barriosLayerRef.current = null;
    }

    if (showBarriosLayer && geoJsonData.barrios) {
      const bLayer = L.geoJSON(geoJsonData.barrios, {
        style: (feature) => {
          const isSelected =
            selectedBarrio !== 'todos' && feature?.properties?.NOMBRE === selectedBarrio;
          const barrioName = feature?.properties?.NOMBRE?.toLowerCase()?.trim();
          const count = barrioName ? voterStats.byBarrio[barrioName] || 0 : 0;

          if (showDensityMode) {
            let fillColor = '#cbd5e1';
            let fillOpacity = 0.12;

            if (count > 0 && count <= 5) {
              fillColor = '#a5b4fc';
              fillOpacity = 0.25;
            } else if (count > 5 && count <= 20) {
              fillColor = '#818cf8';
              fillOpacity = 0.4;
            } else if (count > 20) {
              fillColor = '#4338ca';
              fillOpacity = 0.6;
            }

            return {
              color: isSelected ? '#1e1b4b' : '#312e81',
              weight: isSelected ? 4 : 2.5,
              fillColor,
              fillOpacity,
            };
          }

          return {
            color: isSelected ? '#1e1b4b' : '#4338ca',
            weight: isSelected ? 4 : 2.5,
            fillColor: isSelected ? '#6366f1' : '#4f46e5',
            fillOpacity: isSelected ? 0.32 : 0.09,
          };
        },
        onEachFeature: (feature, layer) => {
          const nombre = feature.properties?.NOMBRE;
          const circuito = feature.properties?.CIRCUITO_ELECTORAL;
          const bKey = nombre ? nombre.toLowerCase().trim() : '';
          const count = voterStats.byBarrio[bKey] || 0;

          layer.bindTooltip(
            `<strong>Barrio:</strong> ${nombre}<br/><span class="text-xs text-zinc-500">Circuito: ${circuito}</span><br/><span class="text-xs font-semibold text-indigo-600">Votantes: ${count}</span>`,
            { sticky: true }
          );

          layer.on('click', () => {
            if (nombre) setSelectedBarrio(nombre);
          });
        },
      });

      bLayer.addTo(map);
      barriosLayerRef.current = bLayer;
    }

    // 2. Circuito Layer + Etiquetas dinámicas
    if (circuitosLayerRef.current) {
      map.removeLayer(circuitosLayerRef.current);
      circuitosLayerRef.current = null;
    }

    if (circuitLabelsLayerRef.current) {
      map.removeLayer(circuitLabelsLayerRef.current);
      circuitLabelsLayerRef.current = null;
    }

    if (showCircuitosLayer && geoJsonData.circuitos) {
      const labelsGroup = L.layerGroup();

      const cLayer = L.geoJSON(geoJsonData.circuitos, {
        style: (feature) => {
          const num = String(feature?.properties?.NUMERO_CIR).trim();
          const isSelected = selectedCircuito !== 'todos' && num === selectedCircuito;
          const count = voterStats.byCircuito[num] || 0;

          if (count === 0) {
            return {
              color: isSelected ? '#be123c' : '#f43f5e',
              weight: isSelected ? 4 : 2,
              dashArray: '5, 4',
              fillColor: '#ffe4e6',
              fillOpacity: 0.12,
            };
          }

          return {
            color: isSelected ? '#4338ca' : '#e11d48',
            weight: isSelected ? 4 : 2.5,
            fillColor: isSelected ? '#818cf8' : '#fda4af',
            fillOpacity: isSelected ? 0.35 : 0.15,
          };
        },
        onEachFeature: (feature, layer: any) => {
          const num = String(feature.properties?.NUMERO_CIR).trim();
          const count = voterStats.byCircuito[num] || 0;

          layer.bindTooltip(
            `<strong>Circuito Electoral Nº ${num}</strong><br/><span class="text-xs font-semibold ${
              count > 0 ? 'text-indigo-600' : 'text-rose-600'
            }">${count > 0 ? `${count} Votantes registrados` : '⚠️ Sin votantes registrados'}</span>`,
            { sticky: true }
          );

          layer.on('click', () => {
            if (num) setSelectedCircuito(num);
          });

          if (layer.getBounds) {
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
              const center = bounds.getCenter();

              const badgeHtml =
                count > 0
                  ? `
                    <div class="circuit-badge-active" title="Circuito ${num}: ${count} votantes registrados. Clic para acercar.">
                      <div class="text-[11px] font-black tracking-wider text-indigo-700 dark:text-indigo-300">
                        CIRCUITO ${num}
                      </div>
                      <div class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span>🗳️ ${count} Votantes</span>
                      </div>
                    </div>
                  `
                  : `
                    <div class="circuit-badge-empty" title="Circuito ${num}: Sin votantes registrados en el padrón. Clic para acercar.">
                      <div class="text-[11px] font-black tracking-wider text-rose-700 dark:text-rose-300">
                        CIRCUITO ${num}
                      </div>
                      <div class="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                        <span>⚠️ Sin votantes</span>
                      </div>
                    </div>
                  `;

              const circuitBadge = L.marker(center, {
                icon: L.divIcon({
                  className: 'circuit-label-node',
                  html: badgeHtml,
                  iconSize: [120, 46],
                  iconAnchor: [60, 23],
                }),
                interactive: true,
              });

              circuitBadge.on('click', () => {
                setSelectedCircuito(num);
                map.flyToBounds(bounds, {
                  padding: [40, 40],
                  maxZoom: 16,
                  duration: 1.2,
                });
              });

              labelsGroup.addLayer(circuitBadge);
            }
          }
        },
      });

      cLayer.addTo(map);
      circuitosLayerRef.current = cLayer;
      circuitLabelsLayerRef.current = labelsGroup;

      syncLayersByZoom();
    }
  }, [
    geoJsonData,
    showBarriosLayer,
    showCircuitosLayer,
    showDensityMode,
    selectedBarrio,
    selectedCircuito,
    voterStats,
    syncLayersByZoom,
  ]);

  // Focus en votante (?persona=id)
  useEffect(() => {
    if (
      !focusPersona ||
      !mapReady ||
      !geoJsonData ||
      !mapInstanceRef.current ||
      focusAppliedRef.current
    ) {
      return;
    }

    focusAppliedRef.current = true;

    setSelectedBarrio(focusPersona.barrio);
    setSelectedCircuito(focusPersona.circuito);
    setShowBarriosLayer(true);
    setShowCircuitosLayer(true);
    setShowVotantesLayer(true);

    setActivePersona(focusPersona);

    if (focusPersona.lat != null && focusPersona.lng != null) {
      setTimeout(() => {
        mapInstanceRef.current?.setView([focusPersona.lat!, focusPersona.lng!], 16, {
          animate: true,
        });
      }, 300);
    }
  }, [focusPersona, mapReady, geoJsonData]);

  // Sync Markers into Cluster Group
  useEffect(() => {
    const cluster = clusterGroupRef.current;
    const map = mapInstanceRef.current;
    if (!cluster || !map) return;

    cluster.clearLayers();

    if (!showVotantesLayer) {
      if (map.hasLayer(cluster)) {
        map.removeLayer(cluster);
      }
      return;
    }

    if (!map.hasLayer(cluster)) {
      map.addLayer(cluster);
    }

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
            ${p.referente_nombre ? `<div><strong>Referente:</strong> <span class="text-indigo-600 font-semibold">${p.referente_nombre}</span></div>` : ''}
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

    if (
      newMarkers.length > 0 &&
      (selectedBarrio !== 'todos' || selectedCircuito !== 'todos' || selectedReferente !== 'todos')
    ) {
      const groupBounds = cluster.getBounds();
      if (groupBounds.isValid()) {
        map.fitBounds(groupBounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [filteredPersonas, selectedBarrio, selectedCircuito, selectedReferente, showVotantesLayer]);

  useEffect(() => {
    syncLayersByZoom();
  }, [syncLayersByZoom]);

  // Exportar a Excel
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (selectedBarrio !== 'todos') params.set('barrio', selectedBarrio);
    if (selectedCircuito !== 'todos') params.set('circuito', selectedCircuito);
    if (selectedReferente !== 'todos') params.set('referente', selectedReferente);
    window.open(`/api/exportar-excel?${params.toString()}`, '_blank');
  };

  // Exportar / Imprimir a PDF formal institucional
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const referenteNombreFiltro =
      selectedReferente !== 'todos'
        ? referentes.find((r) => r.id === selectedReferente)?.nombre || selectedReferente
        : 'Todos los referentes';

    const fechaHoy = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const rowsHtml = modalPersonas
      .map(
        (p, idx) => `
        <tr style="border-bottom: 1px solid #e4e4e7; font-size: 11px;">
          <td style="padding: 6px 8px; font-family: monospace; font-weight: bold;">${p.dni}</td>
          <td style="padding: 6px 8px; font-weight: 600;">${p.apellido_nombre}</td>
          <td style="padding: 6px 8px;">${p.barrio}</td>
          <td style="padding: 6px 8px; text-align: center;">Cir. ${p.circuito}</td>
          <td style="padding: 6px 8px;">${p.direccion || '-'}</td>
          <td style="padding: 6px 8px;">${p.telefono || '-'}</td>
          <td style="padding: 6px 8px; color: #4338ca; font-weight: 600;">${p.referente_nombre || 'Sin asignar'}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Padrón Electoral - San Miguel de Tucumán</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #18181b; margin: 0; padding: 10px; }
            .header { border-bottom: 2px solid #4338ca; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #1e1b4b; }
            .subtitle { font-size: 11px; color: #71717a; margin-top: 2px; }
            .badge-box { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1e1b4b; color: #ffffff; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .footer { margin-top: 24px; text-align: right; font-size: 10px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Sistema de Registro Electoral • SMT</div>
              <div class="subtitle">Nómina Territorial de Votantes Georreferenciados</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #52525b;">
              <div><strong>Fecha de emisión:</strong> ${fechaHoy}</div>
              <div><strong>Total Registros:</strong> ${modalPersonas.length} votantes</div>
            </div>
          </div>

          <div class="badge-box">
            <div><strong>Barrio:</strong> ${selectedBarrio === 'todos' ? 'Todos los barrios' : selectedBarrio}</div>
            <div><strong>Circuito:</strong> ${selectedCircuito === 'todos' ? 'Todos los circuitos' : `Circuito ${selectedCircuito}`}</div>
            <div><strong>Referente:</strong> ${referenteNombreFiltro}</div>
            <div><strong>Filtro Búsqueda:</strong> ${modalSearch || 'Ninguno'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 12%;">DNI</th>
                <th style="width: 25%;">Apellido y Nombre</th>
                <th style="width: 18%;">Barrio</th>
                <th style="width: 10%; text-align: center;">Circuito</th>
                <th style="width: 15%;">Dirección</th>
                <th style="width: 10%;">Teléfono</th>
                <th style="width: 10%;">Referente</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Documento emitido para fines de fiscalización y gestión electoral • San Miguel de Tucumán
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Clic en votante de la tabla modal: centrar mapa y cerrar modal
  const handleSelectFromModal = (persona: PersonaWithReferente) => {
    setShowVotantesModal(false);
    setActivePersona(persona);
    if (onPersonaSelect) onPersonaSelect(persona);

    if (persona.lat != null && persona.lng != null && mapInstanceRef.current) {
      mapInstanceRef.current.setView([persona.lat, persona.lng], 17, { animate: true });
    }
  };

  return (
    <div
      ref={mapWrapperRef}
      className={`flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 bg-zinc-100 dark:bg-zinc-950 w-screen h-screen'
          : 'h-full space-y-3'
      }`}
    >
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

          {/* NUEVO: Referente Select */}
          <select
            value={selectedReferente}
            onChange={(e) => setSelectedReferente(e.target.value)}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 max-w-[170px]"
          >
            <option value="todos">Todos los Referentes</option>
            {referentes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          {(selectedBarrio !== 'todos' ||
            selectedCircuito !== 'todos' ||
            selectedReferente !== 'todos') && (
            <button
              onClick={() => {
                setSelectedBarrio('todos');
                setSelectedCircuito('todos');
                setSelectedReferente('todos');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Restablecer
            </button>
          )}
        </div>

        {/* Toggle de Capas, Escala, Pantalla Completa y Botón Contador Interactivo */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indicador de Nivel de Zoom / Detalle */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
              currentZoom < ZOOM_THRESHOLD
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            }`}
            title={`Zoom: ${currentZoom}. < 15: etiquetas de circuitos. >= 15: votantes en detalle.`}
          >
            <ZoomIn className="w-3 h-3" />
            <span>
              {currentZoom < ZOOM_THRESHOLD
                ? 'Vista General (Circuitos)'
                : 'Detalle Callejero (Votantes)'}
            </span>
          </div>

          {/* Menú Desplegable de Modos de Mapa Base */}
          <div className="relative">
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Cambiar mapa base (OpenStreetMap, Satélite, Oscuro, etc.)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{BASE_LAYERS[baseLayer].name}</span>
            </button>

            {showLayersMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
                  Mapa Base (Tiles)
                </div>

                <button
                  onClick={() => {
                    setBaseLayer('osm');
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    baseLayer === 'osm'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Calles (OSM)</span>
                </button>

                <button
                  onClick={() => {
                    setBaseLayer('satellite');
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    baseLayer === 'satellite'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Satélite (Esri)</span>
                </button>

                <button
                  onClick={() => {
                    setBaseLayer('light');
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    baseLayer === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Claro Minimalista</span>
                </button>

                <button
                  onClick={() => {
                    setBaseLayer('dark');
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    baseLayer === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Modo Oscuro</span>
                </button>

                <button
                  onClick={() => {
                    setBaseLayer('topo');
                    setShowLayersMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    baseLayer === 'topo'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5 text-teal-500" />
                  <span>Topográfico</span>
                </button>
              </div>
            )}
          </div>

          {/* Conmutadores de Capas Vectoriales */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            {/* Barrios */}
            <button
              onClick={() => setShowBarriosLayer(!showBarriosLayer)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                showBarriosLayer
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Mostrar contornos reforzados de los 362 barrios"
            >
              Barrios (362)
            </button>

            {/* Circuitos */}
            <button
              onClick={() => setShowCircuitosLayer(!showCircuitosLayer)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                showCircuitosLayer
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Mostrar circuitos electorales con etiquetas de conteo (en zoom < 15)"
            >
              <span>Circuitos (47)</span>
              {voterStats.emptyCircuitsCount > 0 && (
                <span className="text-[10px] px-1 py-0.2 bg-white/20 rounded-full font-mono">
                  {voterStats.emptyCircuitsCount} vacíos
                </span>
              )}
            </button>

            {/* Toggle de Votantes */}
            <button
              onClick={() => setShowVotantesLayer(!showVotantesLayer)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                showVotantesLayer
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
              }`}
              title="Habilitar u ocultar los marcadores y clusters de votantes"
            >
              {showVotantesLayer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Votantes</span>
            </button>

            {/* Modo Densidad */}
            <button
              onClick={() => setShowDensityMode(!showDensityMode)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                showDensityMode
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
              }`}
              title="Modo Densidad: Colorea barrios según concentración de votantes"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Densidad</span>
            </button>
          </div>

          {/* Botón Pantalla Completa */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-xs"
            title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Ver mapa en pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* BOTÓN CONTADOR INTERACTIVO (Abre el Padrón Flotante) */}
          <button
            onClick={() => setShowVotantesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-indigo-600/25 cursor-pointer hover:scale-105 active:scale-95 group"
            title="Abrir Padrón Flotante con clasificación por Referente y exportar a Excel / PDF"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{filteredPersonas.length} Votantes</span>
            <span className="hidden sm:inline-block text-[10px] font-medium text-indigo-200 border-l border-indigo-400/50 pl-1.5 ml-0.5 group-hover:text-white">
              Ver Padrón
            </span>
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa y Tarjeta Flotante */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[500px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Botón flotante directo para Pantalla Completa sobre el mapa */}
        <div className="absolute top-4 right-14 z-20">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>
        </div>

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
            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                📍 <strong>Barrio:</strong> {activePersona.barrio}
              </div>
              <div>
                🗳️ <strong>Circuito:</strong> {activePersona.circuito}
              </div>
              {(activePersona as any).referente_nombre && (
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    Referente: <strong>{(activePersona as any).referente_nombre}</strong>
                  </span>
                </div>
              )}
              {activePersona.direccion && (
                <div>
                  🏠 <strong>Dirección:</strong> {activePersona.direccion}
                </div>
              )}
              {activePersona.telefono && (
                <div>
                  📞 <strong>Teléfono:</strong> {activePersona.telefono}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL FLOTANTE / SHEET: PADRÓN TERRITORIAL Y REFERENTES    */}
      {/* ========================================================= */}
      {showVotantesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                      Padrón Territorial Filtrado
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Mostrando {filteredPersonas.length} votantes •{' '}
                      {selectedBarrio !== 'todos' ? `Barrio: ${selectedBarrio}` : 'Todos los barrios'} •{' '}
                      {selectedCircuito !== 'todos' ? `Circuito ${selectedCircuito}` : 'Todos los circuitos'}
                      {selectedReferente !== 'todos' &&
                        ` • Referente: ${
                          referentes.find((r) => r.id === selectedReferente)?.nombre || selectedReferente
                        }`}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowVotantesModal(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cerrar padrón"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Buscador y Botones de Exportación */}
            <div className="p-3 sm:px-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
              {/* Buscador dentro del padrón */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por DNI, Nombre o Referente..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Botones de Exportación Excel y PDF */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-emerald-600/20 cursor-pointer"
                  title="Descargar archivo Excel con datos y referentes"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shadow-indigo-600/20 cursor-pointer"
                  title="Generar vista institucional para imprimir o guardar como PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-auto p-1 sm:p-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-600 dark:text-zinc-300 font-bold uppercase text-[10px] tracking-wider z-10 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-3.5 py-2.5">DNI</th>
                    <th className="px-3.5 py-2.5">Apellido y Nombre</th>
                    <th className="px-3.5 py-2.5">Barrio / Circuito</th>
                    <th className="px-3.5 py-2.5">Dirección</th>
                    <th className="px-3.5 py-2.5">Teléfono</th>
                    <th className="px-3.5 py-2.5">Cargado por (Referente)</th>
                    <th className="px-3.5 py-2.5 text-right">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {modalPersonas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                        No se encontraron personas con los criterios especificados.
                      </td>
                    </tr>
                  ) : (
                    modalPersonas.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => handleSelectFromModal(p)}
                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer group"
                        title="Haz clic para centrar en el mapa"
                      >
                        <td className="px-3.5 py-2.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {p.dni}
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {p.apellido_nombre}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {p.barrio}
                          </span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            Circuito {p.circuito}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {p.direccion || <span className="italic text-zinc-400">Sin dirección</span>}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-zinc-600 dark:text-zinc-400">
                          {p.telefono || '-'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                            <span>{p.referente_nombre || 'Sin asignar'}</span>
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 group-hover:underline">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Ver en mapa</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                Mostrando <strong>{modalPersonas.length}</strong> de{' '}
                <strong>{filteredPersonas.length}</strong> votantes seleccionados
              </div>
              <div className="text-[11px] italic text-zinc-400 hidden sm:block">
                Tip: Haz clic en cualquier votante para localizarlo automáticamente en el mapa.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
