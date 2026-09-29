const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/pages/PlantDiseaseDetection.jsx');
let code = fs.readFileSync(file, 'utf8');

// Replace rounded-full for w-6 with rounded-md
code = code.replace(/className="w-6 h-6 rounded-full object-cover/g, 'className="w-6 h-6 rounded-md object-cover');

// Replace rounded-full for w-8 with rounded-lg
code = code.replace(/className="w-8 h-8 rounded-full object-cover/g, 'className="w-8 h-8 rounded-lg object-cover');

fs.writeFileSync(file, code);
console.log('Successfully updated image shapes to rounded squares.');
