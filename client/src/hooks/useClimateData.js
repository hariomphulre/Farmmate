import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchCurrentAndForecast,
  fetchHistoricalClimate,
  computeGDD,
  summarizeClimate,
  buildInsights,
} from "../services/climateapi";

/**
 * Orchestrates all live climate data for a given lat/lon + lookback window.
 * Returns loading/error state plus everything the dashboard needs to render.
 */
export function useClimateData(location, rangeDays = 90) {
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const [fc, hist] = await Promise.all([
        fetchCurrentAndForecast(location.latitude, location.longitude),
        fetchHistoricalClimate(location.latitude, location.longitude, rangeDays),
      ]);
      setForecast(fc);
      setHistory(hist);
    } catch (e) {
      setError(e.message || "Failed to load climate data");
    } finally {
      setLoading(false);
    }
  }, [location, rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  const gddSeries = useMemo(() => (history ? computeGDD(history) : []), [history]);
  const summary = useMemo(() => (history ? summarizeClimate(history) : null), [history]);
  const insights = useMemo(() => (summary && history ? buildInsights(summary, history) : []), [summary, history]);

  return { forecast, history, gddSeries, summary, insights, loading, error, reload: load };
}