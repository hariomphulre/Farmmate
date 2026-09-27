function ndviColor(t) {
  const stops = [
    [0.0, [58, 16, 120]],
    [0.18, [107, 45, 179]],
    [0.34, [34, 140, 90]],
    [0.46, [163, 220, 70]],
    [0.58, [34, 197, 168]],
    [0.74, [29, 90, 190]],
    [1.0, [15, 40, 120]],
  ];
  for (let i = 1; i < stops.length; i += 1) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const u = (t - t0) / (t1 - t0);
      return c0.map((v, idx) => Math.round(v + (c1[idx] - v) * u));
    }
  }
  return stops[stops.length - 1][1];
}

function heightAt(x, y) {
  return (
    Math.sin(x * 0.018) * Math.cos(y * 0.014) +
    0.55 * Math.sin(x * 0.041 + y * 0.027) +
    0.28 * Math.sin(x * 0.09 - y * 0.06) +
    0.18 * Math.cos((x + y) * 0.033)
  );
}

function pointInPolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function boundsFromPolygon(latlngs) {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;
  latlngs.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function createNdviDataUrl(polygon, size = 640) {
  const [[minLat, minLng], [maxLat, maxLng]] = boundsFromPolygon(polygon);
  const ring = polygon.map(([lat, lng]) => [
    ((lng - minLng) / (maxLng - minLng)) * (size - 1),
    (1 - (lat - minLat) / (maxLat - minLat)) * (size - 1),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!pointInPolygon(x, y, ring)) continue;
      const n = (heightAt(x, y) + 2.05) / 4.1;
      heights[y * size + x] = n;
      const [r, g, b] = ndviColor(Math.min(1, Math.max(0, n)));
      const i = (y * size + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 230;
    }
  }
  ctx.putImageData(image, 0, 0);

  ctx.strokeStyle = 'rgba(20, 24, 40, 0.28)';
  ctx.lineWidth = 1;
  const levels = 14;
  for (let l = 1; l < levels; l += 1) {
    const iso = l / levels;
    ctx.beginPath();
    for (let y = 1; y < size; y += 2) {
      for (let x = 1; x < size; x += 2) {
        const a = heights[(y - 1) * size + (x - 1)];
        const b = heights[y * size + x];
        if (!a && !b) continue;
        if ((a - iso) * (b - iso) <= 0) {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}
