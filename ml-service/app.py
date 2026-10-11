"""
ML Microservice — FastAPI
Exposes:
  GET  /health                  — liveness probe
  POST /api/crop-predict        — sklearn crop recommendation
  POST /api/disease-detect      — YOLO / Roboflow disease detection on uploaded image
"""

import io
import json
import os
import shutil
import tempfile
import traceback
import importlib
from pathlib import Path

try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    cv2 = None
    np = None
    CV2_AVAILABLE = False

try:
    import joblib
except ImportError:
    joblib = None

try:
    import pandas as pd
except ImportError:
    pd = None

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from onnx_inference import YOLOOnnxDetector
    ONNX_AVAILABLE = True
except ImportError:
    YOLOOnnxDetector = None
    ONNX_AVAILABLE = False

# ──────────────────────────────────────────────────────────────────────────────
# Roboflow crop scripts — dynamically loaded from scripts/<crop>.py
# Each script exposes run_model(image_bytes) → dict
# ──────────────────────────────────────────────────────────────────────────────
ROBOFLOW_CROPS = ["banana", "turmeric", "corn", "wheat"]

# ──────────────────────────────────────────────────────────────────────────────
# Paths (all relative to /app inside container, env-override friendly)
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR          = Path(os.environ.get("APP_BASE_DIR", "/app"))
CROP_DATA_DIR     = Path(os.environ.get("CROP_DATA_PATH",  str(BASE_DIR / "crop_prediction" / "crop_data")))
CROP_MODEL_PATH   = Path(os.environ.get("CROP_MODEL_PATH", str(BASE_DIR / "crop_prediction" / "crop_recommendation.pkl")))
MODELS_DIR        = Path(os.environ.get("MODELS_DIR",      str(BASE_DIR / "models")))
MIN_CONFIDENCE    = float(os.environ.get("YOLO_MIN_CONF", "0.5"))

# ──────────────────────────────────────────────────────────────────────────────
# Load crop model at startup
# ──────────────────────────────────────────────────────────────────────────────
crop_model = None
crop_info: dict = {}
fertilizer_info: dict = {}

def load_crop_artifacts():
    global crop_model, crop_info, fertilizer_info
    if joblib and CROP_MODEL_PATH.exists():
        crop_model = joblib.load(str(CROP_MODEL_PATH))
    info_path = CROP_DATA_DIR / "crop_info.json"
    fert_path = CROP_DATA_DIR / "fertilizer_schedule.json"
    if info_path.exists():
        crop_info = json.loads(info_path.read_text(encoding="utf-8"))
    if fert_path.exists():
        fertilizer_info = json.loads(fert_path.read_text(encoding="utf-8"))

load_crop_artifacts()

# ──────────────────────────────────────────────────────────────────────────────
# ONNX YOLO model cache  { "tea": <YOLOOnnxDetector>, ... }
# ──────────────────────────────────────────────────────────────────────────────
_yolo_cache: dict = {}

PLANT_MODEL_MAP = {
    "tea":       "tea_leaf.onnx",
    "tomato":    "tomato_leaf.onnx",
    "cotton":    "cotton_leaf.onnx",
    "sugarcane": "sugarcane_leaf.onnx",
}

def get_yolo_model(plant_name: str):
    if not ONNX_AVAILABLE or YOLOOnnxDetector is None:
        return None
    key = plant_name.lower().strip()
    if key in _yolo_cache:
        return _yolo_cache[key]
    model_file = PLANT_MODEL_MAP.get(key)
    if not model_file:
        return None
    model_path = MODELS_DIR / model_file
    if not model_path.exists():
        return None
    detector = YOLOOnnxDetector(model_path)
    _yolo_cache[key] = detector
    return detector

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Farmmate ML Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "crop_model_loaded": crop_model is not None,
        "available_yolo_models": list(PLANT_MODEL_MAP.keys()),
        "available_roboflow_models": ROBOFLOW_CROPS,
        "inference_engine": "onnxruntime",
    }


# ──────────────────────────────────────────────────────────────────────────────
# Crop Prediction
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/crop-predict")
def crop_predict(parameters: dict):
    if crop_model is None:
        raise HTTPException(status_code=503, detail="Crop model not loaded")
    try:
        input_df = pd.DataFrame([parameters])
        probs = crop_model.predict_proba(input_df)[0]
        crop_classes = crop_model.classes_
        crop_scores = (
            pd.DataFrame({"Crop": crop_classes, "Probability": probs})
            .sort_values("Probability", ascending=False)
        )
        output = {"Top_5_Crop_Recommendations": []}
        for _, row in crop_scores.head(5).iterrows():
            name = row["Crop"]
            entry = {"Crop": name, "Probability": float(row["Probability"])}
            if name in crop_info:
                entry["Info"] = crop_info[name]
            if name in fertilizer_info:
                entry["Fertilizer_Schedule"] = fertilizer_info[name]
            output["Top_5_Crop_Recommendations"].append(entry)
        out_file = CROP_DATA_DIR / "output.json"
        out_file.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
        return JSONResponse(content=output)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────────────────────
# Disease Detection
#
# Flow:
#   1. Read uploaded image bytes
#   2. If plant_name is in ROBOFLOW_CROPS → dynamically import
#      scripts/<plant_name>.py and call run_model(bytes)
#   3. Else if plant_name has a local YOLO model → run YOLO inference
#   4. Else → return mock "no model" response
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/disease-detect")
async def disease_detect(
    image: UploadFile = File(...),
    plant_name: str = Form("unknown"),
):
    key = plant_name.lower().strip()
    contents = await image.read()

    # ── Route 1: Roboflow cloud models via per-crop scripts ──────────────
    if key in ROBOFLOW_CROPS:
        try:
            # Dynamic import: scripts/banana.py, scripts/corn.py, etc.
            module = importlib.import_module(f"scripts.{key}")

            # Each script exposes run_model(image_data) → dict
            result_raw = module.run_model(contents)

            # Normalise the Roboflow response into our standard shape
            detections = []
            predictions = result_raw.get("predictions", [])

            if isinstance(predictions, list):
                for p in predictions:
                    if isinstance(p, dict) and "class" in p and "confidence" in p:
                        detections.append({
                            "class": p["class"],
                            "confidence": round(float(p["confidence"]), 4),
                        })
            elif isinstance(predictions, dict):
                for cls_name, data in predictions.items():
                    if isinstance(data, dict) and "confidence" in data:
                        detections.append({
                            "class": cls_name,
                            "confidence": round(float(data["confidence"]), 4),
                        })

            # If classification model returns top/predicted_classes but no predictions list
            if not detections and "predicted_classes" in result_raw:
                for cls_name in result_raw["predicted_classes"]:
                    detections.append({"class": cls_name, "confidence": 1.0})

            # Also handle single top class
            if not detections and "top" in result_raw:
                detections.append({
                    "class": result_raw["top"],
                    "confidence": round(float(result_raw.get("confidence", 0)), 4),
                })

            return JSONResponse({
                "success": True,
                "plant": key,
                "detections": detections,
                "total_detections": len(detections),
            })

        except Exception as exc:
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Roboflow script error ({key}): {str(exc)}",
            )

    # ── Route 2: Local ONNX YOLO models (tea, tomato, cotton, sugarcane) ─
    detector = get_yolo_model(key)
    if detector is None:
        return JSONResponse({
            "success": True,
            "mock": True,
            "plant": key,
            "detections": [],
            "message": f"No model available for '{key}'. Returning empty.",
        })

    try:
        detections = detector.predict(contents, conf_threshold=MIN_CONFIDENCE)
        return JSONResponse({
            "success": True,
            "plant": key,
            "total_detections": len(detections),
            "detections": detections,
        })

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
