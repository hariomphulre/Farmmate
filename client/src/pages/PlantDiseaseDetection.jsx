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
  Camera,
  RotateCw,
  RefreshCw,
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
  const cameraInputRef = useRef(null);
  const dropdownRef  = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ── Camera state ─────────────────────────────────────────────────────────
  const [isCameraOpen, setIsCameraOpen]     = useState(false);
  const [cameraLoading, setCameraLoading]   = useState(false);
  const [cameraError, setCameraError]       = useState(null);
  const [facingMode, setFacingMode]         = useState('environment'); // 'environment' (back) | 'user' (front)
  const [capturedImage, setCapturedImage]   = useState(null);

  const userId = getUserId();

  // ── Stop camera helper ───────────────────────────────────────────────────
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── Camera stream lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    if (!isCameraOpen) return;
    let isActive = true;

    const startLiveCamera = async () => {
      setCameraLoading(true);
      setCameraError(null);
      setCapturedImage(null);
      stopCameraStream();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Live camera is not supported on this browser.');
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to default camera if requested mode fails
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!isActive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (!isActive) return;
        let msg = 'Could not access camera.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera permission was denied. Please allow camera permissions in your browser or use native camera below.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera device found on this system.';
        } else if (err.message) {
          msg = err.message;
        }
        setCameraError(msg);
      } finally {
        if (isActive) setCameraLoading(false);
      }
    };

    startLiveCamera();

    return () => {
      isActive = false;
      stopCameraStream();
    };
  }, [isCameraOpen, facingMode, stopCameraStream]);

  const closeCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedImage(null);
    setCameraError(null);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
    video.pause();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `leaf_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processFile(file);
        closeCamera();
      })
      .catch((err) => {
        console.error('Failed to process captured image:', err);
        setError('Failed to process captured image.');
        closeCamera();
      });
  };


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
    setCapturedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
                        <img
                          src={selectedCrop.image}
                          alt={selectedCrop.label}
                          className="w-6 h-6 rounded-md object-cover border border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
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
                        <img
                          src={crop.image}
                          alt={crop.label}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-sm text-gray-800">{crop.label}</span>
                        {plantName === crop.value && <CheckCircle2 size={14} className="ml-auto text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop zone label & action buttons */}
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Upload Leaf Image</label>
                
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
                    <img src={previewUrl} alt="Selected leaf" className="max-h-56 mx-auto rounded-lg shadow-sm object-contain" />
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="font-medium text-gray-800">{selectedFile?.name || 'Leaf photo ready'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={13} /> Change File
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="text-xs text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Camera size={13} /> Retake with Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400">
                        <ImageIcon size={22} />
                      </div>
                      <div className="text-gray-300 font-light">or</div>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400">
                        <Camera size={22} />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium text-sm">
                        Drag and drop your leaf photo, or choose an option:
                      </p>
                      <div className="flex items-center justify-center gap-2.5 mt-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={13} className="text-gray-500" /> Browse Image
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#052e16] hover:bg-[#06401e] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera size={13} /> Take Photo
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2.5">PNG, JPG, JPEG · Max 10 MB · Supports phone & desktop cameras</p>
                    </div>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />


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
                              <img
                                src={crop.image}
                                alt={crop.label}
                                className="w-8 h-8 rounded-lg object-cover border border-gray-200 flex-shrink-0 mt-0.5"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
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

      {/* ── CAMERA MODAL ──────────────────────────────────────────────── */}
      {isCameraOpen && (

        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">Take Leaf Photo</h3>
                  <p className="text-[11px] text-slate-400">Position leaf in good lighting</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close camera"
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewfinder View */}
            <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {/* Spinner */}
              {cameraLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 gap-2">
                  <Loader2 size={32} className="animate-spin text-emerald-400" />
                  <p className="text-xs text-slate-300">Starting camera...</p>
                </div>
              )}

              {/* Error Screen */}
              {cameraError ? (
                <div className="p-6 text-center max-w-sm">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/20 text-red-400 mx-auto mb-3">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-xs text-red-200 font-medium mb-4">{cameraError}</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeCamera();
                        cameraInputRef.current?.click();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Camera size={15} /> Use Device Camera Directly
                    </button>
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="w-full py-1.5 px-3 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Try switching camera
                    </button>
                  </div>
                </div>
              ) : capturedImage ? (
                /* Captured Frame Preview */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Photo Captured
                  </div>
                </div>
              ) : (
                /* Live Stream Feed */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Visual Guide Box */}
                  <div className="pointer-events-none absolute inset-6 sm:inset-8 border-2 border-dashed border-emerald-400/50 rounded-2xl flex flex-col items-center justify-between p-2">
                    <span className="text-[10px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Focus on diseased leaf area
                    </span>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 rounded-br-sm self-end" />
                  </div>
                </>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              {!cameraError && !capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Flip camera"
                  >
                    <RotateCw size={13} />
                    Flip
                  </button>

                  {/* Circular Shutter Button */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={cameraLoading}
                    className="relative p-1 rounded-full border-4 border-white/80 hover:border-emerald-400 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                    aria-label="Capture photo"
                  >
                    <div className="w-12 h-12 rounded-full bg-white hover:bg-emerald-400 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Open native camera app"
                  >
                    Native App
                  </button>
                </>
              ) : capturedImage ? (
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw size={14} /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={confirmPhoto}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950 cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Use This Photo
                  </button>
                </div>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );

};

export default PlantDiseaseDetection;