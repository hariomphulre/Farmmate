"""
Validation Script: Tests YOLOOnnxDetector and FastAPI Endpoints
Tests each crop model against sample images in test-data/
"""

import sys
import glob
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

def test_inference():
    print("==================================================")
    print("Testing ONNX Inference on All Local YOLO Models...")
    print("==================================================")

    from onnx_inference import YOLOOnnxDetector

    test_cases = [
        ("cotton", "models/cotton_leaf.onnx", "test-data/cotton_leaf"),
        ("sugarcane", "models/sugarcane_leaf.onnx", "test-data/sugarcane_leaf"),
        ("tea", "models/tea_leaf.onnx", "test-data/tea_leaf"),
        ("tomato", "models/tomato_leaf.onnx", "test-data/tomato_leaf"),
    ]

    for crop_name, model_rel, test_dir_rel in test_cases:
        model_path = HERE / model_rel
        test_dir = HERE / test_dir_rel
        print(f"\n--- Testing {crop_name.upper()} ({model_rel}) ---")
        assert model_path.exists(), f"Model {model_path} does not exist!"

        detector = YOLOOnnxDetector(model_path)
        print(f"Loaded {len(detector.class_names)} classes: {detector.class_names}")

        # Find test images
        img_files = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.png"))
        if not img_files:
            print(f"⚠️ No test images found in {test_dir}")
            continue

        sample_img = img_files[0]
        print(f"Testing on sample image: {sample_img.name}...")
        img_bytes = sample_img.read_bytes()

        # Run inference with confidence threshold 0.25 (to capture detections)
        detections = detector.predict(img_bytes, conf_threshold=0.25)
        print(f"Found {len(detections)} detection(s):")
        for d in detections:
            print(f"  -> Class: '{d['class']}' | Confidence: {d['confidence']*100:.1f}% | BBox: {d['bbox']}")

        assert isinstance(detections, list), "Detections must be a list"
        for d in detections:
            assert "class" in d and "confidence" in d and "bbox" in d, "Invalid detection format!"
            assert len(d["bbox"]) == 4, "BBox must have 4 coordinates"

    print("\n✅ All 4 local YOLO ONNX models tested successfully!")

def test_fastapi_app():
    print("\n==================================================")
    print("Testing FastAPI Application Endpoints...")
    print("==================================================")

    from fastapi.testclient import TestClient
    from app import app

    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    print("GET /health ->", data)
    assert data["status"] == "ok"
    assert data["inference_engine"] == "onnxruntime"

    # 2. Crop prediction
    crop_params = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
    }
    res = client.post("/api/crop-predict", json=crop_params)
    assert res.status_code == 200, f"Crop predict failed: {res.text}"
    crop_data = res.json()
    print("POST /api/crop-predict -> Top recommendation:", crop_data["Top_5_Crop_Recommendations"][0]["Crop"])
    assert "Top_5_Crop_Recommendations" in crop_data
    assert len(crop_data["Top_5_Crop_Recommendations"]) > 0

    # 3. Disease detection via FastAPI
    tea_img = list((HERE / "test-data/tea_leaf").glob("*.*"))[0]
    with open(tea_img, "rb") as f:
        res = client.post(
            "/api/disease-detect",
            files={"image": (tea_img.name, f, "image/png")},
            data={"plant_name": "tea"},
        )
    assert res.status_code == 200, f"Disease detect failed: {res.text}"
    dis_data = res.json()
    print(f"POST /api/disease-detect (tea) -> Success: {dis_data['success']}, Detections: {dis_data.get('total_detections', 0)}")
    assert dis_data["success"] is True

    print("\n✅ FastAPI application test passed with 100% success!")

if __name__ == "__main__":
    test_inference()
    test_fastapi_app()
