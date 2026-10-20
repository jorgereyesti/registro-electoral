const fs = require('fs');

const content = fs.readFileSync('../0- BASES/BARRIOS_GEOJSON.txt', 'utf8');

const regexJulio = /"NOMBRE":\s*"([^"]*Julio[^"]*)"/g;
let match;
console.log('--- Nombres con Julio ---');
while ((match = regexJulio.exec(content)) !== null) {
  console.log(match[1]);
}

const regexMojibake = /"NOMBRE":\s*"([^"]*[ÂÃ][^"]*)"/g;
let matchM;
console.log('\n--- Nombres con caracteres Mojibake (Â o Ã) en el archivo original ---');
let count = 0;
while ((matchM = regexMojibake.exec(content)) !== null && count < 20) {
  console.log(matchM[1]);
  count++;
}
