const fs = require('fs');
const file = 'client/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the map initialization logic with dynamic div creation
content = content.replace(
  /useEffect\(\(\) => \{\s*if \(\!mapRef\.current \|\| mapObj\.current\) return;\s*const map = L\.map\(mapRef\.current, \{/s,
  `useEffect(() => {
    if (!mapRef.current) return;
    
    // Create a fresh div for the main map to avoid React 18 strict mode Leaflet bugs
    const mapContainer = document.createElement('div');
    mapContainer.className = 'absolute inset-0';
    mapRef.current.appendChild(mapContainer);

    const map = L.map(mapContainer, {`
);

// Fix the mini map initialization similarly
content = content.replace(
  /if \(miniRef\.current\) \{\s*mini = L\.map\(miniRef\.current, \{/s,
  `if (miniRef.current) {
      const miniContainer = document.createElement('div');
      miniContainer.style.width = '100%';
      miniContainer.style.height = '100%';
      miniRef.current.appendChild(miniContainer);
      mini = L.map(miniContainer, {`
);

// Fix the cleanup function
content = content.replace(
  /return \(\) => \{.*?\};\s*\}, \[\]\);/s,
  `return () => {
      ro.disconnect();
      if (mini) {
        mini.remove();
        if (miniRef.current) miniRef.current.innerHTML = '';
      }
      map.remove();
      if (mapRef.current) mapRef.current.innerHTML = '';
      mapObj.current = null;
    };
  }, []);`
);

fs.writeFileSync(file, content);
console.log('Patched map initialization');
