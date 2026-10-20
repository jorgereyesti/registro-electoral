export interface ReverseGeocodeResult {
  direccionCompleta: string;
  calleYNumero: string;
  barrio?: string;
}

/**
 * Busca direcciones en San Miguel de Tucumán mediante el proxy serverless seguro
 */
export async function buscarDireccionOSM(query: string): Promise<{ lat: number; lng: number; displayName: string }[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.warn('Búsqueda de dirección no disponible temporalmente:', error);
    return [];
  }
}

/**
 * Geocodificación inversa mediante proxy serverless seguro.
 * 100% resiliente: nunca lanza errores a la consola ni rompe la ejecución del frontend.
 */
export async function reverseGeocodeOSM(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || (!data.calleYNumero && !data.direccionCompleta)) return null;

    return {
      direccionCompleta: data.direccionCompleta || '',
      calleYNumero: data.calleYNumero || '',
      barrio: data.barrio || '',
    };
  } catch (error) {
    console.warn('Geocodificación inversa no disponible temporalmente:', error);
    return null;
  }
}
