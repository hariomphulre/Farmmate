import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Leaf,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  Eye,
  Stethoscope,
  History,
  Trash2,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Clock,
  X,
} from 'lucide-react';

// ── Supported crops with their display info ──────────────────────────────────
const CROPS = [
  { value: 'banana',    label: 'Banana',    image: '/crop_images/banana.jpeg' },
  { value: 'turmeric',  label: 'Turmeric',  image: '/crop_images/turmeric.jpeg' },
  { value: 'corn',      label: 'Corn',      image: '/crop_images/corn.jpeg' },
  { value: 'wheat',     label: 'Wheat',     image: '/crop_images/wheat.jpeg' },
  { value: 'cotton',    label: 'Cotton',    image: '/crop_images/cotton.jpg' },
  { value: 'sugarcane', label: 'Sugarcane', image: '/crop_images/sugarcane.jpeg' },
  { value: 'tea',       label: 'Tea',       image: '/crop_images/tea.jpeg' },
  { value: 'tomato',    label: 'Tomato',    image: '/crop_images/tomato.jpeg' },
];

const API_BASE = '/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getUserId() {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('userData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?.userId || parsed?.user_id || null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const PlantDiseaseDetection = () => {
  const [selectedFile, setSelectedFile]   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [diseaseInfo, setDiseaseInfo]     = useState(null);
  const [detections, setDetections]       = useState([]);
  const [error, setError]                 = useState(null);
  const [plantName, setPlantName]         = useState('');
  const [history, setHistory]             = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef  = useRef(null);

  const userId = getUserId();

  // ── Fetch history ────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/disease-history/${userId}`);
      const data = await res.json();
      if (data.success) setHistory(data.history || []);
    } catch (err) {
      console.error('History fetch failed:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── File handlers ────────────────────────────────────────────────────────
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setDiseaseInfo(null);
    setDetections([]);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => processFile(e.target.files[0]);
  const handleDragOver    = (e) => e.preventDefault();
  const handleDrop        = (e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); };

  // ── Upload & analyze ─────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile) { setError('Please select an image first'); return; }
    if (!plantName)    { setError('Please select a crop type'); return; }

    setIsAnalyzing(true);
    setError(null);
    setDiseaseInfo(null);
    setDetections([]);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile, `${plantName}_${Date.now()}.png`);
      formData.append('plantName', plantName);
      if (userId) formData.append('userId', userId);

      const res = await fetch(`${API_BASE}/upload-disease-image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const result = await res.json();

      if (result.success) {
        setDiseaseInfo(result.diseaseInfo || null);
        setDetections(result.detections || []);
        // Refresh history
        fetchHistory();
      } else {
        setError(result.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Delete history record ────────────────────────────────────────────────
  const deleteRecord = async (id) => {
    try {
      await fetch(`${API_BASE}/disease-history/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiseaseInfo(null);
    setDetections([]);
    setError(null);
    setPlantName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedCrop = CROPS.find((c) => c.value === plantName);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#052e16] text-white">
            <Leaf size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plant Disease Detection</h1>
            <p className="text-sm text-gray-500">AI-powered crop disease analysis using Roboflow models</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Upload + Results (spans 2 cols on lg) ─────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upload Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-gray-400" />
                <h2 className="font-semibold text-gray-800">Upload & Analyze</h2>
              </div>
              {(selectedFile || diseaseInfo) && (
                <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            <div className="p-6">
              {/* Crop selector */}
              <div className="mb-4" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Crop</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                    dropdownOpen ? 'border-[#052e16] ring-1 ring-[#052e16]' : 'border-gray-200'
                  } bg-white text-left transition-all`}
                >
                  <span className={selectedCrop ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedCrop ? (
                      <span className="flex items-center gap-2">
                        <img src={selectedCrop.image} alt={selectedCrop.label} className="w-6 h-6 rounded-md object-cover border border-gray-200" />
                        {selectedCrop.label}
                      </span>
                    ) : 'Choose a crop type…'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2">
                    {CROPS.map((crop) => (
                      <button
                        key={crop.value}
                        onClick={() => { setPlantName(crop.value); setDropdownOpen(false); setError(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                          plantName === crop.value ? 'bg-gray-50 font-medium' : ''
                        }`}
                      >
                        <img src={crop.image} alt={crop.label} className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                        <span className="text-sm text-gray-800">{crop.label}</span>
                        {plantName === crop.value && <CheckCircle2 size={14} className="ml-auto text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  previewUrl
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="space-y-3">
                    <img src={previewUrl} alt="Selected leaf" className="max-h-52 mx-auto rounded-lg shadow-sm" />
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {selectedFile?.name}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 mx-auto">
                      <ImageIcon size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-600">
                        Drag and drop your leaf image, or{' '}
                        <span className="text-[#052e16] font-medium cursor-pointer">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG · Max 10 MB</p>
                    </div>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              {/* Action button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || !plantName || isAnalyzing}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-[#052e16] hover:bg-[#06401e] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing {selectedCrop?.label || 'crop'}…
                  </>
                ) : (
                  <>
                    Detect Disease
                  </>
                )}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Card */}
          {diseaseInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Eye size={18} className="text-gray-400" />
                <h2 className="font-semibold text-gray-800">Detection Results</h2>
                {detections.length > 0 && (
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {detections.length} finding{detections.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="p-6 space-y-5">
                {/* Top detection */}
                <div className={`rounded-xl p-5 ${
                  diseaseInfo.name === 'No disease detected'
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-amber-50 border border-amber-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl flex-shrink-0 ${
                      diseaseInfo.name === 'No disease detected'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      {diseaseInfo.name === 'No disease detected' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{diseaseInfo.name}</h3>
                      {diseaseInfo.confidence && diseaseInfo.confidence !== 'N/A' && (
                        <span className="text-xs text-gray-500 mt-0.5 block">Confidence: {diseaseInfo.confidence}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* All detections list */}
                {detections.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">All Detections</h4>
                    <div className="space-y-2">
                      {detections.map((det, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-800">{det.class}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#052e16] rounded-full transition-all"
                                style={{ width: `${(det.confidence * 100).toFixed(0)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{(det.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description & Treatment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Eye size={14} /> Description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{diseaseInfo.description}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Stethoscope size={14} /> Treatment
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{diseaseInfo.treatment}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: History Panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <History size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-800">Detection History</h2>
              <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 mx-auto mb-3">
                    <Clock size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No detection history yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {userId ? 'Results will appear here after analysis' : 'Log in to save history'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {history.map((record) => {
                    const dets = typeof record.detections === 'string'
                      ? JSON.parse(record.detections)
                      : record.detections || [];
                    const topDet = dets.length > 0
                      ? dets.reduce((a, b) => ((a.confidence || 0) > (b.confidence || 0) ? a : b))
                      : null;
                    const isHealthy = topDet ? topDet.class.toLowerCase().includes('healthy') : true;
                    const crop = CROPS.find((c) => c.value === record.plant_name);

                    return (
                      <div key={record.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {crop ? (
                              <img src={crop.image} alt={crop.label} className="w-8 h-8 rounded-lg object-cover border border-gray-200 flex-shrink-0 mt-0.5" />
                            ) : (
                              <span className="text-lg flex-shrink-0 mt-0.5">🌱</span>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 capitalize truncate">
                                {record.plant_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {topDet && !isHealthy
                                  ? `${topDet.class} · ${(topDet.confidence * 100).toFixed(0)}%`
                                  : 'Healthy / No disease'}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <Clock size={10} />
                                {timeAgo(record.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                            aria-label="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Detection chips */}
                        {dets.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 ml-7">
                            {dets.slice(0, 3).map((d, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {d.class}
                              </span>
                            ))}
                            {dets.length > 3 && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                +{dets.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PlantDiseaseDetection;