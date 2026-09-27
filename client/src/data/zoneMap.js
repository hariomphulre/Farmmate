export const MAP_CENTER = [30.9012, 75.8574];
export const MAP_ZOOM = 15;

export const AREA_465 = [
  [30.9088, 75.8502],
  [30.9112, 75.8648],
  [30.9034, 75.8712],
  [30.8930, 75.8674],
  [30.8916, 75.8526],
  [30.8994, 75.8484],
];

export const AREA_464 = [
  [30.9086, 75.8388],
  [30.9088, 75.8502],
  [30.8994, 75.8484],
  [30.8916, 75.8526],
  [30.8908, 75.8402],
  [30.9010, 75.8368],
];

export const ZONES = [
  {
    id: 'zone-1',
    name: 'Zone 1',
    color: '#6d28d9',
    goal: 120,
    disturbance: 'Insect (4%)',
    rx: 145,
    ndvi: 0.52,
    center: [30.9068, 75.8564],
    polygon: [
      [30.9088, 75.8502],
      [30.9112, 75.8648],
      [30.9058, 75.8654],
      [30.9038, 75.8508],
    ],
  },
  {
    id: 'zone-2',
    name: 'Zone 2',
    color: '#84cc16',
    goal: 95,
    disturbance: 'Nutrient (3%)',
    rx: 105,
    ndvi: 0.71,
    center: [30.9038, 75.8648],
    polygon: [
      [30.9112, 75.8648],
      [30.9034, 75.8712],
      [30.8990, 75.8668],
      [30.9058, 75.8654],
    ],
  },
  {
    id: 'zone-3',
    name: 'Zone 3',
    color: '#14b8a6',
    goal: 110,
    disturbance: 'Climate (5%)',
    rx: 150,
    ndvi: 0.67,
    center: [30.8978, 75.8636],
    polygon: [
      [30.9058, 75.8654],
      [30.9034, 75.8712],
      [30.8930, 75.8674],
      [30.8950, 75.8588],
      [30.9038, 75.8508],
    ],
  },
  {
    id: 'zone-4',
    name: 'Zone 4',
    color: '#f59e0b',
    goal: 80,
    disturbance: 'Insect (2%)',
    rx: 90,
    ndvi: 0.61,
    center: [30.8956, 75.8532],
    polygon: [
      [30.9038, 75.8508],
      [30.8950, 75.8588],
      [30.8916, 75.8526],
      [30.8994, 75.8484],
    ],
  },
];

export const ESRI_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const OSM_STREETS = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
