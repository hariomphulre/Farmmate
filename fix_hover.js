const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/pages/PlantDiseaseDetection.jsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/hover:bg-\[#1f2937\]/g, 'hover:bg-[#06401e]');

fs.writeFileSync(file, code);
console.log('Fixed hover state');
