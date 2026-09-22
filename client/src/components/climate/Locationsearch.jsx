import { useState, useRef, useEffect } from "react";
import { searchLocation, getBrowserLocation } from "../../services/climateapi";

export default function LocationSearch({ onSelect, current }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const r = await searchLocation(query);
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function useMyLocation() {
    const loc = await getBrowserLocation();
    if (loc) {
      onSelect({ name: "Current location", latitude: loc.latitude, longitude: loc.longitude });
      setQuery("Current location");
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={boxRef}>
      <div className="flex items-center gap-2 rounded-lg border border-[#2A3D33] bg-[#152420] px-3 py-2 focus-within:border-[#5FA8D3] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#8FA396]">
          <path d="M12 21s7-6.4 7-12a7 7 0 10-14 0c0 5.6 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search field location, e.g. Nashik, India"
          className="w-full bg-transparent text-sm text-[#EDEFE9] placeholder:text-[#5C6D62] outline-none"
        />
        {searching && <span className="text-[10px] text-[#8FA396] font-mono">…</span>}
      </div>

      <button
        onClick={useMyLocation}
        className="mt-1.5 text-[11px] font-mono text-[#5FA8D3] hover:text-[#8FC5E8] transition-colors"
      >
        use current GPS location
      </button>

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#2A3D33] bg-[#152420] shadow-xl">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => {
                  onSelect(r);
                  setQuery(`${r.name}${r.admin1 ? ", " + r.admin1 : ""}`);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-[#1E322A] transition-colors"
              >
                <span className="text-sm text-[#EDEFE9]">{r.name}</span>
                <span className="text-[11px] text-[#8FA396] font-mono">
                  {[r.admin1, r.country].filter(Boolean).join(", ")} · {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}