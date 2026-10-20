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

const barrios = parseJsGeojson('../0- BASES/BARRIOS_GEOJSON.txt');

let fixedCount = 0;
for (const f of barrios.features) {
  for (const key of Object.keys(f.properties)) {
    const val = f.properties[key];
    if (typeof val === 'string' && /[ÃÂ]/.test(val)) {
      const fixed = fixMojibake(val);
      if (key === 'NOMBRE') {
        console.log(`Original: "${val}" ===> Corregido: "${fixed}"`);
      }
      f.properties[key] = fixed;
      fixedCount++;
    }
  }
}

console.log(`Total de propiedades corregidas: ${fixedCount}`);
