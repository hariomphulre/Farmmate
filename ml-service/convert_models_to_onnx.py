"""
Model Conversion Script: PyTorch (.pt) -> ONNX (.onnx)
Exports all YOLO models in ml-service/models to ONNX format (imgsz=480, opset=12)
and saves their class names mapping to JSON.
"""

import os
import json
from pathlib import Path
from ultralytics import YOLO

MODELS_DIR = Path(__file__).resolve().parent / "models"

MODELS = {
    "cotton_leaf": "cotton_leaf.pt",
    "sugarcane_leaf": "sugarcane_leaf.pt",
    "tea_leaf": "tea_leaf.pt",
    "tomato_leaf": "tomato_leaf.pt",
}

def export_all():
    print(f"Starting YOLO -> ONNX export in {MODELS_DIR}...")
    for name, filename in MODELS.items():
        pt_path = MODELS_DIR / filename
        if not pt_path.exists():
            print(f"⚠️ Model file not found: {pt_path}")
            continue

        print(f"\n==========================================")
        print(f"Loading {name} from {pt_path}...")
        model = YOLO(str(pt_path))

        # Save class names mapping
        names = model.names
        classes_file = MODELS_DIR / f"{name}_classes.json"
        with open(classes_file, "w", encoding="utf-8") as f:
            json.dump(names, f, indent=2)
        print(f"Saved class names ({len(names)} classes) to {classes_file}")

        # Export to ONNX
        print(f"Exporting {name} to ONNX (imgsz=480, opset=12)...")
        onnx_file = model.export(
            format="onnx",
            imgsz=480,
            dynamic=False,
            opset=12,
            simplify=False,
        )
        print(f"Successfully exported: {onnx_file}")

    print("\n✅ All models successfully converted to ONNX!")

if __name__ == "__main__":
    export_all()
