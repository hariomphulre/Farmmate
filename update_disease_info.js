const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server/server.cjs');
let code = fs.readFileSync(serverFile, 'utf8');

const regex = /const isHealthy = topDetection \? topDetection\.class\.toLowerCase\(\)\.includes\('healthy'\) : true;\n\n\s*return res\.status\(200\)\.json\({[\s\S]*?imageUrl: `\/crop_imgs\/disease\/\$\{finalFilename\}`,[\s\S]*?\}\);/m;

const replacement = `const isHealthy = topDetection ? topDetection.class.toLowerCase().includes('healthy') : true;

    // Load disease info from JSON if available
    let customDescription = null;
    let customTreatment = null;
    if (topDetection && !isHealthy) {
      try {
        const infoPath = path.join(__dirname, '../ml-service/crop_disease_info.json');
        if (fs.existsSync(infoPath)) {
          const diseaseData = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          
          // Try exact match or case-insensitive match
          let plantData = diseaseData[plantName];
          if (!plantData) {
             const key = Object.keys(diseaseData).find(k => k.toLowerCase() === plantName.toLowerCase());
             if (key) plantData = diseaseData[key];
          }
          
          if (plantData) {
            let diseaseKey = topDetection.class;
            if (!plantData[diseaseKey]) {
              diseaseKey = Object.keys(plantData).find(k => k.toLowerCase() === topDetection.class.toLowerCase());
            }
            if (diseaseKey && plantData[diseaseKey]) {
              const info = plantData[diseaseKey];
              
              // Build description
              let descParts = [];
              const whatIsKey = Object.keys(info).find(k => k.startsWith('What is'));
              if (whatIsKey && info[whatIsKey]) {
                descParts.push(info[whatIsKey]);
              }
              if (info['Why & How this happen']) {
                descParts.push('**Cause:** ' + info['Why & How this happen']);
              }
              if (descParts.length > 0) {
                customDescription = descParts.join('\\n\\n');
              }
              
              // Build treatment
              let treatParts = [];
              if (info['Steps to cure'] && Array.isArray(info['Steps to cure'])) {
                treatParts.push('**Steps to cure:**\\n' + info['Steps to cure'].join('\\n'));
              }
              if (info['Recommended Pesticites/Fungicides/Bactericides/etc... '] && Array.isArray(info['Recommended Pesticites/Fungicides/Bactericides/etc... '])) {
                treatParts.push('**Recommended Treatments:**\\n' + info['Recommended Pesticites/Fungicides/Bactericides/etc... '].join('\\n'));
              }
              if (treatParts.length > 0) {
                customTreatment = treatParts.join('\\n\\n');
              }
            }
          }
        }
      } catch (e) {
        console.error('[Disease] Failed to load crop_disease_info.json:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Disease detection completed',
      diseaseInfo: {
        name: topDetection && !isHealthy ? topDetection.class : 'No disease detected',
        description: customDescription 
          ? customDescription 
          : (topDetection && !isHealthy
              ? \`Detected \${topDetection.class} in \${plantName} leaf with \${(topDetection.confidence * 100).toFixed(1)}% confidence.\`
              : \`No significant disease patterns were detected in the \${plantName} leaf image. The plant appears healthy.\`),
        treatment: customTreatment 
          ? customTreatment 
          : (topDetection && !isHealthy
              ? \`Disease "\${topDetection.class}" detected. Consult an agricultural expert for specific treatment. General recommendations: 1) Isolate affected plants, 2) Remove infected leaves, 3) Apply appropriate fungicide/pesticide, 4) Improve air circulation.\`
              : 'No treatment required. Continue regular care and monitoring.'),
        confidence: topDetection ? \`\${(topDetection.confidence * 100).toFixed(1)}%\` : 'N/A',
      },
      detections: detections,
      totalDetections: mlResult.total_detections || 0,
      plant: plantName,
      imageUrl: \`/crop_imgs/disease/\${finalFilename}\`,
    });`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(serverFile, code);
  console.log('Successfully updated server.cjs');
} else {
  console.log('Could not match regex in server.cjs');
}
