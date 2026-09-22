import { useEffect, useMemo, useState } from "react";
import { Apple, Grape, Carrot, Cherry, Leaf, Wheat, Sprout } from "lucide-react";
import serverOutput from "../../../../server/crop_prediction/crop_data/output.json";

// UI component to render fertilizer recommendations from output.json
export default function FertilizerRecommender() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("english");
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (isMounted) setData(serverOutput);
      } catch (err) {
        if (isMounted) setError(err?.message || "Failed to load recommendations");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const recommendations = useMemo(() => {
    return Array.isArray(data?.Top_5_Crop_Recommendations)
      ? data.Top_5_Crop_Recommendations
      : [];
  }, [data]);

  const languages = [
    { key: "english", label: "English" },
    { key: "hindi", label: "हिंदी" },
    { key: "marathi", label: "मराठी" }
  ];

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <p className="text-gray-600">Loading fertilizer recommendations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700 font-medium">{error}</p>
        <p className="text-red-600 text-sm mt-2">
          Tip: Ensure `output.json` is copied to `System/client/public/crop_data/output.json`.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <p className="text-gray-600">No recommendations found in output.json.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Fertilizer Recommender</h2>
        <div className="ml-auto flex items-center gap-2">
          {languages.map((lng) => (
            <button
              key={lng.key}
              onClick={() => setLanguage(lng.key)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                language === lng.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {lng.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec, index) => {
          const reasonText = rec?.Info?.reason?.[language] ?? rec?.Info?.reason?.english ?? "";
          const seasonText = rec?.Info?.season?.[language] ?? rec?.Info?.season?.english ?? "";
          const notesText = rec?.Info?.notes?.[language] ?? rec?.Info?.notes?.english ?? "";
          const nutrients = rec?.Fertilizer_Schedule?.nutrients_kg_per_hectare || {};
          const stages = rec?.Fertilizer_Schedule?.application_stages || {};
          const stageContent = typeof stages === "string" ? stages : stages?.[language] || stages?.english || {};

          const isExpanded = expandedIndex === index;

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Recommended Crop</div>
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                      {getCropIcon(rec?.Crop)}
                      <span>{capitalize(rec?.Crop)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Probability</div>
                    <div className="text-lg font-semibold text-blue-600">{formatProbability(rec?.Probability)}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">Reason</div>
                  <p className="text-gray-700 leading-relaxed">{reasonText}</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Season</div>
                    <div className="text-sm font-medium text-gray-900">{seasonText}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border sm:col-span-2">
                    <div className="text-xs text-gray-500">Notes</div>
                    <div className="text-sm text-gray-900">{notesText}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-2">Nutrient Recommendation (kg/ha)</div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["N", "P", "K"]).map((n) => (
                      <div key={n} className="rounded-lg border p-3 text-center">
                        <div className="text-xs text-gray-500">{n}</div>
                        <div className="text-lg font-semibold text-gray-900">{nutrients?.[n] ?? "-"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                    className="w-full text-left px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <span className="font-semibold text-gray-800">Application Stages</span>
                    <span className="float-right text-sm text-gray-600">{isExpanded ? "Hide" : "Show"}</span>
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {typeof stageContent === "string" ? (
                        <p className="text-gray-700">{stageContent}</p>
                      ) : (
                        Object.entries(stageContent).map(([stageKey, stageVal]) => (
                          <div key={stageKey} className="rounded-lg border p-3">
                            <div className="text-sm font-semibold text-gray-800 mb-1">{formatKey(stageKey)}</div>
                            {typeof stageVal === "string" ? (
                              <p className="text-gray-700">{stageVal}</p>
                            ) : (
                              <div className="space-y-2">
                                {stageVal?.विवरण || stageVal?.वर्णन || stageVal?.description ? (
                                  <p className="text-gray-700">
                                    {stageVal?.विवरण || stageVal?.वर्णन || stageVal?.description}
                                  </p>
                                ) : null}
                                {Array.isArray(stageVal?.खाद) || Array.isArray(stageVal?.खते) || Array.isArray(stageVal?.fertilizers) ? (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Fertilizers</div>
                                    <ul className="list-disc list-inside text-gray-700">
                                      {(stageVal?.खाद || stageVal?.खते || stageVal?.fertilizers).map((f, i) => (
                                        <li key={i}>{f}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                                {Array.isArray(stageVal?.स्प्रे) || Array.isArray(stageVal?.sprays) ? (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Sprays</div>
                                    <ul className="list-disc list-inside text-gray-700">
                                      {(stageVal?.स्प्रे || stageVal?.sprays).map((s, i) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatProbability(value) {
  if (typeof value !== "number") return "-";
  return `${Math.round(value * 100)}%`;
}

function capitalize(text) {
  if (typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatKey(key) {
  try {
    if (!key) return "";
    return key
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return String(key);
  }
}

function getCropIcon(cropName) {
  if (!cropName || typeof cropName !== "string") return <Sprout className="w-5 h-5 text-green-600" />;
  const key = cropName.toLowerCase();
  if (key.includes("apple")) return <Apple className="w-5 h-5 text-red-500" />;
  if (key.includes("grape")) return <Grape className="w-5 h-5 text-purple-600" />;
  if (key.includes("maize") || key.includes("corn")) return <Wheat className="w-5 h-5 text-yellow-600" />;
  if (key.includes("orange")) return <Cherry className="w-5 h-5 text-orange-500" />;
  if (key.includes("kidney") || key.includes("bean")) return <Leaf className="w-5 h-5 text-green-600" />;
  if (key.includes("wheat")) return <Wheat className="w-5 h-5 text-amber-700" />;
  if (key.includes("carrot")) return <Carrot className="w-5 h-5 text-orange-600" />;
  return <Sprout className="w-5 h-5 text-green-600" />;
}