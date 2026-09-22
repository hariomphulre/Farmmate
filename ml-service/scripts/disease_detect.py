"""
Disease Detection Script (headless / batch mode)
Runs YOLO inference on an image file and saves the annotated result.

All paths are driven by environment variables — no hardcoded Windows paths.
"""

import glob
import os
import sys
import time
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

# ─── Path resolution ──────────────────────────────────────────────────────────
_here     = Path(__file__).resolve().parent
_base     = _here.parent                          # /app or project root

MODEL_PATH  = os.environ.get("DISEASE_MODEL_PATH",  str(_base / "models" / "tea1.pt"))
IMG_SOURCE  = os.environ.get("DISEASE_IMG_SOURCE",  str(_base / "crop_imgs" / "disease"))
OUTPUT_DIR  = os.environ.get("DISEASE_OUTPUT_DIR",  str(_base / "detect_results" / "disease"))
MIN_THRESH  = float(os.environ.get("YOLO_MIN_CONF", "0.5"))
USER_RES    = os.environ.get("YOLO_RESOLUTION",     "480x480")

# ─── Validate model ───────────────────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    print(f"ERROR: Model not found at {MODEL_PATH}")
    sys.exit(1)

model  = YOLO(MODEL_PATH, task="detect")
labels = model.names

# ─── Detect source type ───────────────────────────────────────────────────────
IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".JPG", ".JPEG", ".PNG", ".BMP"}

if os.path.isdir(IMG_SOURCE):
    imgs_list = [f for f in glob.glob(os.path.join(IMG_SOURCE, "*"))
                 if Path(f).suffix in IMG_EXTS]
elif os.path.isfile(IMG_SOURCE):
    if Path(IMG_SOURCE).suffix not in IMG_EXTS:
        print(f"Unsupported file type: {Path(IMG_SOURCE).suffix}")
        sys.exit(1)
    imgs_list = [IMG_SOURCE]
else:
    print(f"Invalid source: {IMG_SOURCE}")
    sys.exit(1)

# ─── Setup ───────────────────────────────────────────────────────────────────
os.makedirs(OUTPUT_DIR, exist_ok=True)

resize = False
if USER_RES:
    resize = True
    resW, resH = map(int, USER_RES.split("x"))

BBOX_COLORS = [
    (164, 120, 87), (68, 148, 228), (93, 97, 209), (178, 182, 133),
    (88, 159, 106), (96, 202, 231), (159, 124, 168), (169, 162, 241),
    (98, 118, 150), (172, 176, 184),
]

# ─── Process images ───────────────────────────────────────────────────────────
for idx, img_path in enumerate(imgs_list):
    t_start = time.perf_counter()

    frame = cv2.imread(img_path)
    if frame is None:
        print(f"Could not load {img_path}, skipping...")
        continue

    if resize:
        frame = cv2.resize(frame, (resW, resH))

    results    = model(frame, verbose=False)
    detections = results[0].boxes

    object_count = 0
    for det in detections:
        xyxy     = det.xyxy.cpu().numpy().squeeze().astype(int)
        xmin, ymin, xmax, ymax = xyxy
        classidx = int(det.cls.item())
        classname = labels[classidx]
        conf     = det.conf.item()

        if conf > MIN_THRESH:
            color = BBOX_COLORS[classidx % 10]
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

            label = f"{classname}: {int(conf * 100)}%"
            labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            label_ymin = max(ymin, labelSize[1] + 10)
            cv2.rectangle(
                frame,
                (xmin, label_ymin - labelSize[1] - 10),
                (xmin + labelSize[0], label_ymin + baseLine - 10),
                color, cv2.FILLED,
            )
            cv2.putText(frame, label, (xmin, label_ymin - 7),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            object_count += 1

    cv2.putText(frame, f"Objects: {object_count}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    save_path = os.path.join(OUTPUT_DIR, f"result_{idx + 1}.png")
    cv2.imwrite(save_path, frame)

    fps = 1 / (time.perf_counter() - t_start)
    print(f"Saved: {save_path} | Objects: {object_count} | FPS: {fps:.2f}")

print("✅ Processing complete. All results saved.")
