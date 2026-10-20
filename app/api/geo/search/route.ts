import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = q.trim();
  let results: { lat: number; lng: number; displayName: string }[] = [];

  // 1. Probar primero con Nominatim
  try {
    const encodedQuery = encodeURIComponent(`${cleanQuery}, San Miguel de Tucumán, Tucumán, Argentina`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=ar&bounded=1&viewbox=-65.31,-26.75,-65.12,-26.92`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'SistemaRegistroElectoralSMT/1.0 (contacto@smt.gob.ar)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        results = data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
        }));
      }
    }
  } catch {
    // Continuar a fallback
  }

  // 2. Fallback a Photon (Komoot OSM mirror) si Nominatim falla o da 429
  if (results.length === 0) {
    try {
      const encodedQuery = encodeURIComponent(cleanQuery);
      const photonUrl = `https://photon.komoot.io/api/?q=${encodedQuery}&lat=-26.8322&lon=-65.2038&limit=5`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(photonUrl, {
        headers: { 'Accept-Language': 'es' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const features = data?.features || [];
        results = features
          .filter((f: any) => {
            const state = f.properties?.state || '';
            const city = f.properties?.city || '';
            return state.toLowerCase().includes('tucumán') || city.toLowerCase().includes('tucumán');
          })
          .map((f: any) => {
            const props = f.properties || {};
            const street = props.street || props.name || '';
            const num = props.housenumber || '';
            const loc = props.locality || props.district || '';
            const city = props.city || 'San Miguel de Tucumán';

            const line = [street && num ? `${street} ${num}` : street, loc, city].filter(Boolean).join(', ');

            return {
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              displayName: line,
            };
          });
      }
    } catch {
      // Degradar silenciosamente
    }
  }

  return NextResponse.json({ results });
}
