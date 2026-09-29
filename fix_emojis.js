const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/pages/PlantDiseaseDetection.jsx');
let code = fs.readFileSync(file, 'utf8');

const cropsMatch = code.match(/const CROPS = \[\s*([\s\S]*?)\s*\];/);
if (cropsMatch) {
  let cropsStr = cropsMatch[0];
  cropsStr = cropsStr.replace(/emoji: '🍌'/g, "image: '/crop_images/banana.jpeg'");
  // No turmeric image? I'll use a placeholder or check if the user meant something else
  cropsStr = cropsStr.replace(/emoji: '🌿'/g, "image: '/crop_images/tea.jpeg'"); // placeholder for turmeric
  cropsStr = cropsStr.replace(/emoji: '🌽'/g, "image: '/crop_images/corn.jpeg'");
  cropsStr = cropsStr.replace(/emoji: '🌾'/g, "image: '/crop_images/wheat.jpeg'");
  cropsStr = cropsStr.replace(/emoji: '☁️'/g, "image: '/crop_images/cotton.jpeg'");
  cropsStr = cropsStr.replace(/emoji: '🎋'/g, "image: '/crop_images/sugarcane.jpeg'");
  cropsStr = cropsStr.replace(/emoji: '🍵'/g, "image: '/crop_images/tea.jpeg'");
  cropsStr = cropsStr.replace(/emoji: '🍅'/g, "image: '/crop_images/tomato.jpeg'");
  
  code = code.replace(cropsMatch[0], cropsStr);
}

// Update Dropdown selector button
code = code.replace(
  /\{selectedCrop \? \`\$\{selectedCrop\.emoji\}  \$\{selectedCrop\.label\}\` : 'Choose a crop type…'\}/g,
  `{selectedCrop ? (
                      <span className="flex items-center gap-2">
                        <img src={selectedCrop.image} alt={selectedCrop.label} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                        {selectedCrop.label}
                      </span>
                    ) : 'Choose a crop type…'}`
);

// Update Dropdown items list
code = code.replace(
  /<span className="text-lg">\{crop\.emoji\}<\/span>/g,
  '<img src={crop.image} alt={crop.label} className="w-8 h-8 rounded-full object-cover border border-gray-200" />'
);

// Update History list item
code = code.replace(
  /<span className="text-lg flex-shrink-0 mt-0\.5">\{crop\?\.emoji \|\| '🌱'\}<\/span>/g,
  `{crop ? (
                              <img src={crop.image} alt={crop.label} className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0 mt-0.5" />
                            ) : (
                              <span className="text-lg flex-shrink-0 mt-0.5">🌱</span>
                            )}`
);

fs.writeFileSync(file, code);
console.log('Successfully replaced emojis with images.');
