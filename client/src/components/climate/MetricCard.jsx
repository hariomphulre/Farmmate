export default function MetricCard({ label, value, unit, accent = "#5FA8D3", sub }) {
  return (
    <div className="rounded-xl border border-[#2A3D33] bg-[#152420] p-4 flex flex-col gap-1 min-w-[140px]">
      <span className="text-[11px] font-mono uppercase tracking-wide text-[#8FA396]">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums" style={{ color: accent }}>
          {value ?? "—"}
        </span>
        {unit && <span className="text-xs text-[#8FA396]">{unit}</span>}
      </div>
      {sub && <span className="text-[11px] text-[#5C6D62]">{sub}</span>}
    </div>
  );
}