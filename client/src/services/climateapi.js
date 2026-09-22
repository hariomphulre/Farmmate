// climateApi.js
// Live climate data layer — no mock/dummy data anywhere.
// Sources:
//  - Open-Meteo (geocoding + current/forecast weather) — free, no API key: https://open-meteo.com
//  - NASA POWER (daily historical agro-climatology) — free, no API key: https://power.larc.nasa.gov

const OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const NASA_POWER_DAILY = "https://power.larc.nasa.gov/api/temporal/daily/point";

/** Search for a place name -> [{name, admin1, country, latitude, longitude}] */
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `${OPEN_METEO_GEOCODE}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `${r.latitude},${r.longitude}`,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/** Reverse-ish default: try browser geolocation, fall back to null */
export function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000 }
    );
  });
}

/** Current conditions + 16-day forecast from Open-Meteo */
export async function fetchCurrentAndForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,et0_fao_evapotranspiration",
    timezone: "auto",
    forecast_days: 14,
  });
  const res = await fetch(`${OPEN_METEO_FORECAST}?${params.toString()}`);
  if (!res.ok) throw new Error(`Forecast fetch failed (${res.status})`);
  return res.json();
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Historical daily agro-climatology from NASA POWER.
 * Parameters chosen for agriculture: temp (mean/max/min), precipitation,
 * relative humidity, wind speed, solar radiation, and root-zone soil wetness.
 */
export async function fetchHistoricalClimate(lat, lon, days = 90) {
  const end = new Date();
  end.setDate(end.getDate() - 2); // POWER has ~2 day latency
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const parameters = [
    "T2M",
    "T2M_MAX",
    "T2M_MIN",
    "PRECTOTCORR",
    "RH2M",
    "WS2M",
    "ALLSKY_SFC_SW_DWN",
    "GWETROOT",
    "GWETPROF",
  ].join(",");

  const params = new URLSearchParams({
    parameters,
    community: "AG",
    longitude: lon,
    latitude: lat,
    start: fmtDate(start),
    end: fmtDate(end),
    format: "JSON",
  });

  const res = await fetch(`${NASA_POWER_DAILY}?${params.toString()}`);
  if (!res.ok) throw new Error(`NASA POWER fetch failed (${res.status})`);
  const data = await res.json();
  const p = data?.properties?.parameter;
  if (!p) throw new Error("NASA POWER returned no parameter data for this location");

  const dates = Object.keys(p.T2M || {}).sort();
  const FILL = -999; // POWER's missing-value sentinel

  const series = dates.map((d) => {
    const clean = (v) => (v === FILL || v === undefined ? null : v);
    return {
      date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
      tAvg: clean(p.T2M?.[d]),
      tMax: clean(p.T2M_MAX?.[d]),
      tMin: clean(p.T2M_MIN?.[d]),
      precip: clean(p.PRECTOTCORR?.[d]),
      humidity: clean(p.RH2M?.[d]),
      wind: clean(p.WS2M?.[d]),
      solar: clean(p.ALLSKY_SFC_SW_DWN?.[d]),
      soilRoot: clean(p.GWETROOT?.[d]),
      soilProfile: clean(p.GWETPROF?.[d]),
    };
  });

  return series;
}

// ---------- Derived analytics (real math on real data, nothing fabricated) ----------

/** Cumulative Growing Degree Days, base temp in °C (default 10 — common base for many row crops) */
export function computeGDD(series, baseTemp = 10) {
  let cumulative = 0;
  return series.map((d) => {
    if (d.tMax == null || d.tMin == null) return { date: d.date, gdd: null, cumulativeGDD: cumulative };
    const meanT = (d.tMax + d.tMin) / 2;
    const daily = Math.max(meanT - baseTemp, 0);
    cumulative += daily;
    return { date: d.date, gdd: Number(daily.toFixed(2)), cumulativeGDD: Number(cumulative.toFixed(2)) };
  });
}

/** Summary stats over the series: totals, means, extremes, stress-day counts */
export function summarizeClimate(series) {
  const valid = (arr) => arr.filter((v) => v != null);
  const tAvgVals = valid(series.map((d) => d.tAvg));
  const tMaxVals = valid(series.map((d) => d.tMax));
  const tMinVals = valid(series.map((d) => d.tMin));
  const precipVals = valid(series.map((d) => d.precip));
  const humidityVals = valid(series.map((d) => d.humidity));
  const windVals = valid(series.map((d) => d.wind));
  const solarVals = valid(series.map((d) => d.solar));
  const soilVals = valid(series.map((d) => d.soilRoot));

  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const sum = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) : null);
  const max = (arr) => (arr.length ? Math.max(...arr) : null);
  const min = (arr) => (arr.length ? Math.min(...arr) : null);

  const heatStressDays = tMaxVals.filter((v) => v >= 35).length;
  const frostDays = tMinVals.filter((v) => v <= 0).length;
  const dryDays = precipVals.filter((v) => v < 1).length;
  const heavyRainDays = precipVals.filter((v) => v >= 20).length;

  // Simple linear trend (slope per day) for soil moisture, used as a drought-direction signal
  const soilTrend = linearTrendSlope(series.map((d) => d.soilRoot));

  return {
    avgTemp: mean(tAvgVals),
    maxTemp: max(tMaxVals),
    minTemp: min(tMinVals),
    totalPrecip: sum(precipVals),
    avgHumidity: mean(humidityVals),
    avgWind: mean(windVals),
    avgSolar: mean(solarVals),
    avgSoilMoisture: mean(soilVals),
    heatStressDays,
    frostDays,
    dryDays,
    heavyRainDays,
    soilTrend, // >0 wetting, <0 drying
    daysAnalyzed: series.length,
  };
}

function linearTrendSlope(values) {
  const pts = values.map((v, i) => [i, v]).filter(([, v]) => v != null);
  const n = pts.length;
  if (n < 2) return 0;
  const xMean = pts.reduce((a, [x]) => a + x, 0) / n;
  const yMean = pts.reduce((a, [, y]) => a + y, 0) / n;
  let num = 0;
  let den = 0;
  for (const [x, y] of pts) {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/** Generate plain-language insight strings from real computed stats */
export function buildInsights(summary, series) {
  const insights = [];
  if (summary.totalPrecip != null) {
    const dailyAvg = summary.totalPrecip / summary.daysAnalyzed;
    if (dailyAvg < 1) {
      insights.push({
        type: "warning",
        text: `Only ${summary.totalPrecip.toFixed(1)} mm of rain fell over the last ${summary.daysAnalyzed} days — well below typical crop water needs. Consider irrigation planning.`,
      });
    } else {
      insights.push({
        type: "info",
        text: `Total precipitation over the last ${summary.daysAnalyzed} days was ${summary.totalPrecip.toFixed(1)} mm.`,
      });
    }
  }
  if (summary.soilTrend < -0.001) {
    insights.push({
      type: "warning",
      text: `Root-zone soil moisture is trending downward, indicating drying conditions. Monitor for developing drought stress.`,
    });
  } else if (summary.soilTrend > 0.001) {
    insights.push({
      type: "positive",
      text: `Root-zone soil moisture is trending upward — favorable moisture conditions for crop growth.`,
    });
  }
  if (summary.heatStressDays > 0) {
    insights.push({
      type: "warning",
      text: `${summary.heatStressDays} day(s) reached 35°C or higher, a threshold linked to heat stress in many crops.`,
    });
  }
  if (summary.frostDays > 0) {
    insights.push({
      type: "warning",
      text: `${summary.frostDays} day(s) dropped to 0°C or below — frost risk for sensitive crops.`,
    });
  }
  if (summary.avgSolar != null) {
    insights.push({
      type: "info",
      text: `Average solar radiation was ${summary.avgSolar.toFixed(1)} MJ/m²/day, a key driver of photosynthesis and evapotranspiration.`,
    });
  }
  return insights;
}