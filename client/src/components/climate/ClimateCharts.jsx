import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const GRID = "#2A3D33";
const AXIS = "#8FA396";

function ChartShell({ title, sub, children, height = 260 }) {
  return (
    <div className="rounded-xl border border-[#2A3D33] bg-[#152420] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-[#EDEFE9]">{title}</h3>
        {sub && <p className="text-[11px] text-[#8FA396]">{sub}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function tickDate(d) {
  return d ? d.slice(5) : "";
}

const tooltipStyle = {
  background: "#0E1A14",
  border: "1px solid #2A3D33",
  borderRadius: 8,
  fontSize: 12,
  color: "#EDEFE9",
};

export function TemperatureChart({ data }) {
  return (
    <ChartShell title="Temperature range" sub="Daily min / mean / max, °C — NASA POWER">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={tickDate} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} unit="°" />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8FA396" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} />
        <Area type="monotone" dataKey="tMax" name="Max" stroke="#D9A441" fill="#D9A44122" strokeWidth={1.5} />
        <Line type="monotone" dataKey="tAvg" name="Mean" stroke="#5FA8D3" dot={false} strokeWidth={2} />
        <Area type="monotone" dataKey="tMin" name="Min" stroke="#8FC5E8" fill="#8FC5E822" strokeWidth={1.5} />
      </ComposedChart>
    </ChartShell>
  );
}

export function PrecipitationChart({ data }) {
  return (
    <ChartShell title="Precipitation" sub="Daily rainfall, mm — NASA POWER">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={tickDate} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} unit="mm" />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8FA396" }} />
        <Bar dataKey="precip" name="Rainfall" fill="#5FA8D3" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartShell>
  );
}

export function SoilMoistureChart({ data }) {
  return (
    <ChartShell title="Root-zone soil moisture" sub="Fraction saturated (0–1) — NASA POWER">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={tickDate} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} domain={[0, 1]} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8FA396" }} />
        <Area type="monotone" dataKey="soilRoot" name="Root zone" stroke="#5CA880" fill="#5CA88033" strokeWidth={2} />
      </ComposedChart>
    </ChartShell>
  );
}

export function GDDChart({ data }) {
  return (
    <ChartShell title="Cumulative growing degree days" sub="Base 10°C — a proxy for crop development pace">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={tickDate} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8FA396" }} />
        <Line type="monotone" dataKey="cumulativeGDD" name="Cumulative GDD" stroke="#D9A441" dot={false} strokeWidth={2} />
      </ComposedChart>
    </ChartShell>
  );
}

export function SolarWindChart({ data }) {
  return (
    <ChartShell title="Solar radiation & wind speed" sub="MJ/m²/day and m/s — NASA POWER">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={tickDate} stroke={AXIS} fontSize={11} />
        <YAxis yAxisId="left" stroke={AXIS} fontSize={11} />
        <YAxis yAxisId="right" orientation="right" stroke={AXIS} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8FA396" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} />
        <Line yAxisId="left" type="monotone" dataKey="solar" name="Solar radiation" stroke="#D9A441" dot={false} strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="wind" name="Wind speed" stroke="#8FC5E8" dot={false} strokeWidth={1.5} />
      </ComposedChart>
    </ChartShell>
  );
}