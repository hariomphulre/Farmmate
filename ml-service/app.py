"""
ML Microservice — FastAPI
Exposes:
  GET  /health                  — liveness probe
  POST /api/crop-predict        — sklearn crop recommendation
  POST /api/disease-detect      — YOLO disease detection on uploaded image
"""

import io
import json
import os
import shutil
import tempfile
import traceback
from pathlib import Path

import cv2
import joblib
import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO

# ──────────────────────────────────────────────────────────────────────────────
# Paths (all relative to /app inside container, env-override friendly)
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR          = Path(os.environ.get("APP_BASE_DIR", "/app"))
CROP_DATA_DIR     = Path(os.environ.get("CROP_DATA_PATH",  str(BASE_DIR / "crop_prediction" / "crop_data")))
CROP_MODEL_PATH   = Path(os.environ.get("CROP_MODEL_PATH", str(BASE_DIR / "crop_prediction" / "crop_recommendation.pkl")))
MODELS_DIR        = Path(os.environ.get("MODELS_DIR",      str(BASE_DIR / "models")))
MIN_CONFIDENCE    = float(os.environ.get("YOLO_MIN_CONF", "0.5"))

# ──────────────────────────────────────────────────────────────────────────────
# Load crop model at startup (fail fast if missing)
# ──────────────────────────────────────────────────────────────────────────────
crop_model = None
crop_info: dict = {}
fertilizer_info: dict = {}

def load_crop_artifacts():
    global crop_model, crop_info, fertilizer_info
    if CROP_MODEL_PATH.exists():
        crop_model = joblib.load(str(CROP_MODEL_PATH))
    info_path = CROP_DATA_DIR / "crop_info.json"
    fert_path = CROP_DATA_DIR / "fertilizer_schedule.json"
    if info_path.exists():
        crop_info = json.loads(info_path.read_text(encoding="utf-8"))
    if fert_path.exists():
        fertilizer_info = json.loads(fert_path.read_text(encoding="utf-8"))

load_crop_artifacts()

# ──────────────────────────────────────────────────────────────────────────────
# YOLO model cache  { "tea": <YOLO>, "tomato": <YOLO> }
# ──────────────────────────────────────────────────────────────────────────────
_yolo_cache: dict = {}

PLANT_MODEL_MAP = {
    "tea":    "tea1.pt",
    "tomato": "tomato_leaf.pt",
}

def get_yolo_model(plant_name: str) -> YOLO | None:
    key = plant_name.lower()
    if key in _yolo_cache:
        return _yolo_cache[key]
    model_file = PLANT_MODEL_MAP.get(key)
    if not model_file:
        return None
    model_path = MODELS_DIR / model_file
    if not model_path.exists():
        return None
    model = YOLO(str(model_path), task="detect")
    _yolo_cache[key] = model
    return model

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ex-Farmer ML Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # The Node server is the only caller; restrict further if needed
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "crop_model_loaded": crop_model is not None,
        "available_yolo_models": list(PLANT_MODEL_MAP.keys()),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Crop Prediction
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/crop-predict")
def crop_predict(parameters: dict):
    """
    Body: { "N": 90, "P": 42, "K": 43, "temperature": 20.8,
            "humidity": 82, "ph": 6.5, "rainfall": 202.9 }
    Returns top-5 crop recommendations with info + fertilizer schedule.
    """
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

        # Persist output.json so server can also serve it via /api/crop/output
        out_file = CROP_DATA_DIR / "output.json"
        out_file.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

        return JSONResponse(content=output)

    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────────────────────
# Disease Detection
# ──────────────────────────────────────────────────────────────────────────────
@app.post("/api/disease-detect")
async def disease_detect(
    image: UploadFile = File(...),
    plant_name: str = Form("unknown"),
):
    """
    Accepts a plant leaf image, runs YOLO inference, returns detection results.
    plant_name: "tea" | "tomato"  (determines which model to load)
    """
    model = get_yolo_model(plant_name)
    if model is None:
        # Fall back to mock response if no model exists for this plant
        return JSONResponse({
            "success": True,
            "mock": True,
            "plant": plant_name,
            "detections": [],
            "message": f"No YOLO model available for '{plant_name}'. Returning mock.",
        })

    try:
        # Read image bytes
        contents = await image.read()
        img_array = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        # Resize to 480×480 for consistent inference
        frame = cv2.resize(frame, (480, 480))

        # Run inference
        results = model(frame, verbose=False)
        detections = results[0].boxes
        labels = model.names

        found = []
        for det in detections:
            conf = float(det.conf.item())
            if conf < MIN_CONFIDENCE:
                continue
            xyxy = det.xyxy.cpu().numpy().squeeze().astype(int).tolist()
            classidx = int(det.cls.item())
            found.append({
                "class": labels[classidx],
                "confidence": round(conf, 4),
                "bbox": xyxy,
            })

        return JSONResponse({
            "success": True,
            "plant": plant_name,
            "total_detections": len(found),
            "detections": found,
        })

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
