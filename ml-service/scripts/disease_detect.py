import os
import sys
import glob
import time

import cv2
import numpy as np
from ultralytics import YOLO

# ---------------------------
# User settings
# ---------------------------
model_path = r"I:/Projects/Climate-Resilient-Agriculture/System/server/tea1.pt"
img_source = r"I:/Projects/Climate-Resilient-Agriculture/System/server/crop_imgs/disease/tea/img.png"
output_dir = r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/disease/tea"
min_thresh = 0.5
user_res = "480x480"
# ---------------------------

# Check if model exists
if not os.path.exists(model_path):
    print('ERROR: Model path is invalid or not found.')
    sys.exit(0)

# Load YOLO model
model = YOLO(model_path, task='detect')
labels = model.names

# Detect source type
img_ext_list = ['.jpg','.JPG','.jpeg','.JPEG','.png','.PNG','.bmp','.BMP']
vid_ext_list = ['.avi','.mov','.mp4','.mkv','.wmv']

if os.path.isdir(img_source):
    source_type = 'folder'
elif os.path.isfile(img_source):
    _, ext = os.path.splitext(img_source)
    if ext in img_ext_list:
        source_type = 'image'
    elif ext in vid_ext_list:
        source_type = 'video'
    else:
        print(f'File extension {ext} not supported.')
        sys.exit(0)
else:
    print(f'Input {img_source} is invalid.')
    sys.exit(0)

# Parse resolution
resize = False
if user_res:
    resize = True
    resW, resH = map(int, user_res.split('x'))

# Prepare output directory
os.makedirs(output_dir, exist_ok=True)

# Load image list
if source_type == 'image':
    imgs_list = [img_source]
elif source_type == 'folder':
    imgs_list = [f for f in glob.glob(img_source + '/*') if os.path.splitext(f)[1] in img_ext_list]

# Colors for bounding boxes
bbox_colors = [(164,120,87), (68,148,228), (93,97,209), (178,182,133), (88,159,106), 
              (96,202,231), (159,124,168), (169,162,241), (98,118,150), (172,176,184)]

# Process each image
for idx, img_filename in enumerate(imgs_list):
    t_start = time.perf_counter()

    frame = cv2.imread(img_filename)
    if frame is None:
        print(f"Could not load {img_filename}, skipping...")
        continue

    if resize:
        frame = cv2.resize(frame, (resW, resH))

    # Run inference
    results = model(frame, verbose=False)
    detections = results[0].boxes

    object_count = 0
    for det in detections:
        xyxy = det.xyxy.cpu().numpy().squeeze().astype(int)
        xmin, ymin, xmax, ymax = xyxy
        classidx = int(det.cls.item())
        classname = labels[classidx]
        conf = det.conf.item()

        if conf > min_thresh:
            color = bbox_colors[classidx % 10]
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

            label = f'{classname}: {int(conf*100)}%'
            labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            label_ymin = max(ymin, labelSize[1] + 10)
            cv2.rectangle(frame, (xmin, label_ymin-labelSize[1]-10),
                          (xmin+labelSize[0], label_ymin+baseLine-10), color, cv2.FILLED)
            cv2.putText(frame, label, (xmin, label_ymin-7),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1)

            object_count += 1

    cv2.putText(frame, f'Objects: {object_count}', (10,40),
                cv2.FONT_HERSHEY_SIMPLEX, .7, (0,255,255), 2)

    # Save result
    save_path = os.path.join(output_dir, f"result_{idx+1}.png")
    cv2.imwrite(save_path, frame)
    print(f"Saved: {save_path}")

    # FPS calculation (optional)
    t_stop = time.perf_counter()
    fps = 1 / (t_stop - t_start)
    print(f"Processed {img_filename} | Objects: {object_count} | FPS: {fps:.2f}")

print("✅ Processing complete. All results saved.")
