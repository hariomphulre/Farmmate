const ACCENT = {
  warning: { border: "#D9A441", bg: "#D9A44114", icon: "⚠" },
  positive: { border: "#5CA880", bg: "#5CA88014", icon: "✓" },
  info: { border: "#5FA8D3", bg: "#5FA8D314", icon: "ℹ" },
};

export default function ClimateInsights({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#2A3D33] bg-[#152420] p-4">
      <h3 className="text-sm font-medium text-[#EDEFE9] mb-3">Analytics & insights</h3>
      <ul className="flex flex-col gap-2">
        {insights.map((ins, i) => {
          const a = ACCENT[ins.type] || ACCENT.info;
          return (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-[13px] leading-snug text-[#EDEFE9]"
              style={{ background: a.bg, borderLeft: `2px solid ${a.border}` }}
            >
              <span style={{ color: a.border }} className="mt-[1px] shrink-0 font-mono text-[12px]">
                {a.icon}
              </span>
              <span>{ins.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}