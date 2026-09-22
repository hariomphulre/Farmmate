"""
Crop Prediction Script
Loads parameters.json → runs sklearn model → writes output.json

All paths are resolved from environment variables so this script works
both locally and inside Docker containers (no hardcoded Windows paths).
"""

import json
import os
from pathlib import Path

import joblib
import pandas as pd

# ─── Path resolution (env-var first, then defaults relative to this file) ───
_here = Path(__file__).resolve().parent

CROP_DATA_DIR = Path(os.environ.get("CROP_DATA_PATH",  str(_here / "crop_data")))
MODEL_PATH    = Path(os.environ.get("CROP_MODEL_PATH", str(_here / "crop_recommendation.pkl")))

# ─── Load model ──────────────────────────────────────────────────────────────
print(f"Loading model from: {MODEL_PATH}")
model = joblib.load(str(MODEL_PATH))

# ─── Load input parameters ───────────────────────────────────────────────────
params_file = CROP_DATA_DIR / "parameters.json"
print(f"Loading parameters from: {params_file}")
with open(params_file, "r", encoding="utf-8") as f:
    manual_data = json.load(f)

input_df = pd.DataFrame([manual_data])

# ─── Predict ─────────────────────────────────────────────────────────────────
probs       = model.predict_proba(input_df)[0]
crop_classes = model.classes_

crop_scores = pd.DataFrame({
    "Crop":        crop_classes,
    "Probability": probs,
}).sort_values(by="Probability", ascending=False)

# ─── Load info JSONs ──────────────────────────────────────────────────────────
with open(CROP_DATA_DIR / "crop_info.json", "r", encoding="utf-8") as f:
    crop_info = json.load(f)

with open(CROP_DATA_DIR / "fertilizer_schedule.json", "r", encoding="utf-8") as f:
    fertilizer_info = json.load(f)

# ─── Build output ─────────────────────────────────────────────────────────────
output_data: dict = {"Top_5_Crop_Recommendations": []}

for _, row in crop_scores.head(5).iterrows():
    crop_name   = row["Crop"]
    probability = float(row["Probability"])

    crop_entry: dict = {"Crop": crop_name, "Probability": probability}

    if crop_name in crop_info:
        crop_entry["Info"] = crop_info[crop_name]

    if crop_name in fertilizer_info:
        crop_entry["Fertilizer_Schedule"] = fertilizer_info[crop_name]

    output_data["Top_5_Crop_Recommendations"].append(crop_entry)

# ─── Write output ─────────────────────────────────────────────────────────────
out_path = CROP_DATA_DIR / "output.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=4)

print(f"✅ Results saved to: {out_path}")
