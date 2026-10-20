const fs = require('fs');
const tsData = fs.readFileSync('lib/geo/data.ts', 'utf8');
const jsonBarrios = fs.readFileSync('public/data/geo/barrios.json', 'utf8');

console.log('lib/geo/data.ts has mojibake [ÂÃ]:', /[ÂÃ]/.test(tsData));
console.log('public/data/geo/barrios.json has mojibake [ÂÃ]:', /[ÂÃ]/.test(jsonBarrios));
console.log('Found "1° de Julio":', tsData.includes('1° de Julio'));
console.log('Found "1Â° de Julio":', tsData.includes('1Â° de Julio'));
console.log('Found "La Porteña":', tsData.includes('La Porteña'));
console.log('Found "Las Américas":', tsData.includes('Las Américas'));
console.log('Found "Ampliación Obispo Colombres":', tsData.includes('Ampliación Obispo Colombres'));
