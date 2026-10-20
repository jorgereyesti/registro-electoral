import { NextRequest, NextResponse } from 'next/server';

// In-memory cache para evitar consultas redundantes
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora de caché

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ calleYNumero: '', direccionCompleta: '', barrio: '' });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ calleYNumero: '', direccionCompleta: '', barrio: '' });
  }

  // Clave de caché redondeada a 4 decimales (~11 metros de precisión)
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && (cached.data?.calleYNumero || cached.data?.direccionCompleta)) {
    return NextResponse.json(cached.data);
  }

  let calleYNumero = '';
  let direccionCompleta = '';
  let barrio = '';

  // 1. Intentar con Photon (Komoot OSM mirror): no tiene bloqueo por rate-limit 429
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(photonUrl, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'SistemaRegistroElectoral_SMT/1.0 (gobierno@smt.gob.ar)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const feat = data?.features?.[0]?.properties;
      if (feat) {
        const street = feat.street || feat.name || '';
        const housenumber = feat.housenumber || '';

        if (street && housenumber) {
          calleYNumero = `${street} ${housenumber}`;
        } else if (street) {
          calleYNumero = street;
        }

        barrio = feat.locality || feat.district || '';
        const city = feat.city || 'San Miguel de Tucumán';
        direccionCompleta = [calleYNumero, barrio, city, 'Tucumán'].filter(Boolean).join(', ');
      }
    }
  } catch (err) {
    // Si Photon falla o timeout, intentamos Nominatim
  }

  // 2. Fallback con Nominatim (OpenStreetMap oficial) si Photon no devolvió calle
  if (!calleYNumero) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'SistemaRegistroElectoral_SMT/1.0 (gobierno@smt.gob.ar)',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.street || addr.residential || addr.avenue || '';
        const houseNumber = addr.house_number || '';

        if (road && houseNumber) {
          calleYNumero = `${road} ${houseNumber}`;
        } else if (road) {
          calleYNumero = road;
        } else if (data.display_name) {
          calleYNumero = data.display_name.split(',')[0];
        }

        direccionCompleta = data.display_name || '';
        barrio = addr.neighbourhood || addr.suburb || addr.city_district || '';
      }
    } catch (err) {
      // Degradar silenciosamente
    }
  }

  const responsePayload = {
    calleYNumero: calleYNumero.trim(),
    direccionCompleta: direccionCompleta.trim(),
    barrio: barrio.trim(),
  };

  if (responsePayload.calleYNumero || responsePayload.direccionCompleta) {
    cache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });
  }

  return NextResponse.json(responsePayload);
}
