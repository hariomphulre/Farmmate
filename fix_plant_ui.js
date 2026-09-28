const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/pages/PlantDiseaseDetection.jsx');
let code = fs.readFileSync(file, 'utf8');

// Replace all #111827 with #052e16
code = code.replace(/#111827/g, '#052e16');

// Add whitespace-pre-wrap to description and treatment <p> tags
code = code.replace(
  /<p className="text-sm text-gray-600 leading-relaxed">\{diseaseInfo\.description\}<\/p>/g,
  '<p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{diseaseInfo.description}</p>'
);

code = code.replace(
  /<p className="text-sm text-gray-600 leading-relaxed">\{diseaseInfo\.treatment\}<\/p>/g,
  '<p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{diseaseInfo.treatment}</p>'
);

fs.writeFileSync(file, code);
console.log('Successfully updated UI theme and whitespace properties.');
