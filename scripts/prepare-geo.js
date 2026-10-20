const fs = require('fs');
const path = require('path');

function fixMojibake(str) {
  if (!str || typeof str !== 'string') return str;
  if (/[ÃÂ]/.test(str)) {
    try {
      return Buffer.from(str, 'latin1').toString('utf8');
    } catch (e) {
      return str;
    }
  }
  return str;
}

function parseJsGeojson(filePath) {
  let content = fs.readFileSync(filePath, 'utf8').trim();
  const eqIdx = content.indexOf('=');
  let jsonStr = content.substring(eqIdx + 1).trim();
  if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
  return JSON.parse(jsonStr);
}

const barriosPath = path.resolve('../0- BASES/BARRIOS_GEOJSON.txt');
const circuitosPath = path.resolve('../0- BASES/CIRCUITOS_GEOJSON.txt');

fs.mkdirSync('public/data/geo', { recursive: true });
fs.mkdirSync('lib/geo', { recursive: true });

const barrios = parseJsGeojson(barriosPath);
const circuitos = parseJsGeojson(circuitosPath);

// Normalizar y corregir codificación en todos los barrios
for (const f of barrios.features) {
  for (const key of Object.keys(f.properties)) {
    if (typeof f.properties[key] === 'string') {
      f.properties[key] = fixMojibake(f.properties[key]);
    }
  }
}

// Normalizar y corregir codificación en circuitos (por precaución)
for (const f of circuitos.features) {
  for (const key of Object.keys(f.properties)) {
    if (typeof f.properties[key] === 'string') {
      f.properties[key] = fixMojibake(f.properties[key]);
    }
  }
}

fs.writeFileSync('public/data/geo/barrios.json', JSON.stringify(barrios, null, 2));
fs.writeFileSync('public/data/geo/circuitos.json', JSON.stringify(circuitos, null, 2));

// Extraer barrios únicos ordenados alfabéticamente
const uniqueBarrios = [];
const seenBarrios = new Set();
for (const f of barrios.features) {
  const nombre = f.properties.NOMBRE?.trim();
  if (nombre && !seenBarrios.has(nombre)) {
    seenBarrios.add(nombre);
    uniqueBarrios.push({
      id: f.properties.ID_BARRIO ?? (uniqueBarrios.length + 1),
      nombre: nombre,
      circuitoElectoral: f.properties.CIRCUITO_ELECTORAL ? String(f.properties.CIRCUITO_ELECTORAL).trim() : '',
      distrito: f.properties.DISTRITO || ''
    });
  }
}
uniqueBarrios.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

// Extraer circuitos únicos
const uniqueCircuitos = [];
const seenCircuitos = new Set();
for (const f of circuitos.features) {
  const num = f.properties.NUMERO_CIR?.toString().trim();
  if (num && !seenCircuitos.has(num)) {
    seenCircuitos.add(num);
    uniqueCircuitos.push({
      id: f.properties['ID CIRCUIT'] ?? (uniqueCircuitos.length + 1),
      numero: num
    });
  }
}
uniqueCircuitos.sort((a, b) => a.numero.localeCompare(b.numero, 'es', { numeric: true }));

const tsData = `// Catálogo oficial normalizado de Barrios y Circuitos de San Miguel de Tucumán

export interface BarrioOption {
  id: number | null;
  nombre: string;
  circuitoElectoral: string;
  distrito: string;
}

export interface CircuitoOption {
  id: number | null;
  numero: string;
}

export const BARRIOS_LIST: BarrioOption[] = ${JSON.stringify(uniqueBarrios, null, 2)};

export const CIRCUITOS_LIST: CircuitoOption[] = ${JSON.stringify(uniqueCircuitos, null, 2)};

export const SMT_CENTER: [number, number] = [-26.832, -65.204]; // [lat, lng]
export const DEFAULT_ZOOM = 13;
`;

fs.writeFileSync('lib/geo/data.ts', tsData);
console.log('Successfully regenerated public/data/geo/barrios.json, public/data/geo/circuitos.json and lib/geo/data.ts');
console.log('Total Barrios corregidos:', uniqueBarrios.length);
console.log('Total Circuitos:', uniqueCircuitos.length);
