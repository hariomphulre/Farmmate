import { useState } from "react";

// Color ramp from dry (soil wetness ~0) to saturated (soil wetness ~1)
// Mirrors the palette convention of satellite soil-moisture products.
function soilColor(v) {
  if (v == null) return "#2A3D33";
  const stops = [
    { t: 0.0, c: [122, 79, 41] }, // dry soil brown
    { t: 0.35, c: [178, 142, 74] }, // parched tan
    { t: 0.55, c: [163, 176, 92] }, // moderate olive-green
    { t: 0.75, c: [92, 168, 128] }, // healthy green
    { t: 1.0, c: [63, 130, 168] }, // saturated blue
  ];
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i].t && v <= stops[i + 1].t) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi.t - lo.t || 1;
  const f = (v - lo.t) / span;
  const rgb = lo.c.map((c, i) => Math.round(c + (hi.c[i] - c) * f));
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

export default function ClimateStrip({ series }) {
  const [hover, setHover] = useState(null);

  if (!series || series.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#2A3D33] bg-[#152420] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-[#EDEFE9]">Root-zone soil moisture strip</h3>
          <p className="text-[11px] text-[#8FA396]">Daily soil wetness index, dry → saturated, {series.length} days</p>
        </div>
        {hover && (
          <div className="text-right font-mono text-[11px] text-[#EDEFE9]">
            <div>{hover.date}</div>
            <div className="text-[#8FA396]">
              {hover.soilRoot != null ? `${(hover.soilRoot * 100).toFixed(0)}% wetness` : "no data"}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full gap-[1.5px] overflow-hidden rounded" style={{ height: 40 }}>
        {series.map((d) => (
          <div
            key={d.date}
            onMouseEnter={() => setHover(d)}
            onMouseLeave={() => setHover(null)}
            title={`${d.date}: ${d.soilRoot != null ? (d.soilRoot * 100).toFixed(0) + "%" : "no data"}`}
            style={{ background: soilColor(d.soilRoot), flex: "1 1 0" }}
            className="cursor-crosshair hover:opacity-80 transition-opacity"
          />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#8FA396]">
        <span>dry</span>
        <div
          className="h-2 flex-1 rounded"
          style={{ background: "linear-gradient(90deg, rgb(122,79,41), rgb(178,142,74), rgb(163,176,92), rgb(92,168,128), rgb(63,130,168))" }}
        />
        <span>saturated</span>
      </div>
    </div>
  );
}