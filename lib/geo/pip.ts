// Point-in-Polygon (PIP) engine for San Miguel de Tucumán barrios and circuitos

function pointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point; // x = lng, y = lat
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface PIPResult {
  barrio: {
    id: number | null;
    nombre: string;
    circuitoElectoral?: string;
    distrito?: string;
    feature?: any;
  } | null;
  circuito: {
    id: number | null;
    numero: string;
    feature?: any;
  } | null;
}

/**
 * Identifica en microsegundos qué Barrio y Circuito Electoral contienen a un punto [lat, lng]
 */
export function identificarBarrioYCircuito(
  lat: number,
  lng: number,
  barriosGeoJson: any,
  circuitosGeoJson: any
): PIPResult {
  const pt: [number, number] = [lng, lat];
  let foundBarrio: any = null;
  let foundCircuito: any = null;

  if (barriosGeoJson?.features) {
    for (const f of barriosGeoJson.features) {
      const geom = f.geometry;
      if (!geom) continue;

      if (geom.type === 'Polygon') {
        if (pointInRing(pt, geom.coordinates[0])) {
          foundBarrio = f;
          break;
        }
      } else if (geom.type === 'MultiPolygon') {
        let insideMulti = false;
        for (const poly of geom.coordinates) {
          if (pointInRing(pt, poly[0])) {
            insideMulti = true;
            break;
          }
        }
        if (insideMulti) {
          foundBarrio = f;
          break;
        }
      }
    }
  }

  if (circuitosGeoJson?.features) {
    for (const f of circuitosGeoJson.features) {
      const geom = f.geometry;
      if (!geom) continue;

      if (geom.type === 'Polygon') {
        if (pointInRing(pt, geom.coordinates[0])) {
          foundCircuito = f;
          break;
        }
      } else if (geom.type === 'MultiPolygon') {
        let insideMulti = false;
        for (const poly of geom.coordinates) {
          if (pointInRing(pt, poly[0])) {
            insideMulti = true;
            break;
          }
        }
        if (insideMulti) {
          foundCircuito = f;
          break;
        }
      }
    }
  }

  return {
    barrio: foundBarrio
      ? {
          id: foundBarrio.properties.ID_BARRIO ?? null,
          nombre: foundBarrio.properties.NOMBRE?.trim() || '',
          circuitoElectoral: foundBarrio.properties.CIRCUITO_ELECTORAL ? String(foundBarrio.properties.CIRCUITO_ELECTORAL).trim() : '',
          distrito: foundBarrio.properties.DISTRITO || '',
          feature: foundBarrio,
        }
      : null,
    circuito: foundCircuito
      ? {
          id: foundCircuito.properties['ID CIRCUIT'] ?? null,
          numero: String(foundCircuito.properties.NUMERO_CIR).trim(),
          feature: foundCircuito,
        }
      : null,
  };
}
