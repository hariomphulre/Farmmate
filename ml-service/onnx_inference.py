"""
High-Performance ONNX Inference Engine for YOLOv8 & YOLO11 Models
Replaces PyTorch + Ultralytics with lightweight ONNX Runtime (~45MB) and OpenCV NMS.
"""

import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import cv2
import numpy as np

try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except ImportError:
    ort = None
    ORT_AVAILABLE = False

logger = logging.getLogger("onnx_inference")


class YOLOOnnxDetector:
    """
    Lightweight, production-grade YOLOv8/YOLO11 detector powered by ONNX Runtime.
    Handles tensor preprocessing, inference, box conversion, and OpenCV C++ NMS.
    """

    def __init__(
        self,
        model_path: Union[str, Path],
        classes_path: Optional[Union[str, Path]] = None,
        input_size: Tuple[int, int] = (480, 480),
    ):
        if not ORT_AVAILABLE:
            raise RuntimeError("onnxruntime is not installed. Please install onnxruntime.")

        self.model_path = Path(model_path)
        self.input_size = input_size  # (width, height)
        self.class_names: Dict[int, str] = {}

        if not self.model_path.exists():
            raise FileNotFoundError(f"ONNX model file not found: {self.model_path}")

        # Configure session options for high performance on multi-core CPU
        sess_options = ort.SessionOptions()
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        sess_options.intra_op_num_threads = int(os.environ.get("ORT_INTRA_OP_THREADS", "2"))
        sess_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL

        logger.info(f"Loading ONNX model: {self.model_path} with CPUExecutionProvider...")
        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=sess_options,
            providers=["CPUExecutionProvider"],
        )

        # Inspect input & output nodes
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.input_shape = self.session.get_inputs()[0].shape
        self.output_shape = self.session.get_outputs()[0].shape

        # Load class mappings
        self._load_classes(classes_path)
        logger.info(f"Loaded {len(self.class_names)} classes for {self.model_path.name}")

    def _load_classes(self, classes_path: Optional[Union[str, Path]]):
        """Loads class mappings from JSON file or embedded ONNX metadata."""
        # 1. Try explicit classes_path
        if classes_path and Path(classes_path).exists():
            self._parse_class_file(Path(classes_path))
            return

        # 2. Try adjacent <model_name>_classes.json
        auto_path = self.model_path.parent / f"{self.model_path.stem}_classes.json"
        if auto_path.exists():
            self._parse_class_file(auto_path)
            return

        # 3. Try reading embedded ONNX metadata props
        try:
            meta = self.session.get_modelmeta().custom_metadata_map
            if "names" in meta:
                raw_names = json.loads(meta["names"].replace("'", '"'))
                self.class_names = {int(k): str(v) for k, v in raw_names.items()}
                return
        except Exception as e:
            logger.debug(f"Could not read metadata from ONNX model: {e}")

        # 4. Fallback: generate generic class names from output shape
        num_classes = (self.output_shape[1] - 4) if len(self.output_shape) > 1 else 10
        self.class_names = {i: f"class_{i}" for i in range(num_classes)}

    def _parse_class_file(self, path: Path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.class_names = {int(k): str(v) for k, v in data.items()}

    def preprocess(self, image_input: Union[bytes, np.ndarray]) -> Tuple[np.ndarray, Tuple[int, int]]:
        """
        Decodes and prepares input image:
        - Decodes bytes if necessary
        - Resizes to input dimensions (e.g. 480x480)
        - Converts BGR to RGB
        - Normalizes to [0.0, 1.0]
        - Transposes HWC -> CHW and adds batch dim -> (1, 3, H, W)
        """
        if isinstance(image_input, (bytes, bytearray)):
            nparr = np.frombuffer(image_input, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image from provided bytes.")
        elif isinstance(image_input, np.ndarray):
            img = image_input
        else:
            raise TypeError(f"Unsupported image input type: {type(image_input)}")

        orig_h, orig_w = img.shape[:2]
        target_w, target_h = self.input_size

        # Resize to model resolution
        resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LINEAR)

        # BGR -> RGB
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

        # Normalize float32 [0.0, 1.0]
        normalized = rgb.astype(np.float32) / 255.0

        # Transpose HWC -> CHW: (480, 480, 3) -> (3, 480, 480)
        transposed = np.transpose(normalized, (2, 0, 1))

        # Add batch dimension: (1, 3, 480, 480)
        blob = np.expand_dims(transposed, axis=0)

        return blob, (orig_w, orig_h)

    def postprocess(
        self,
        output_tensor: np.ndarray,
        orig_shape: Tuple[int, int],
        conf_threshold: float = 0.5,
        iou_threshold: float = 0.45,
    ) -> List[Dict]:
        """
        Parses YOLO output tensor, filters by confidence, and runs OpenCV NMS.
        Output tensor shape: (1, 4 + num_classes, num_anchors) e.g. (1, 14, 4725).
        """
        # Squeeze batch dimension -> (4 + num_classes, num_anchors)
        preds = output_tensor[0]

        # Transpose to (num_anchors, 4 + num_classes)
        preds = preds.T

        if preds.shape[0] == 0:
            return []

        # Coordinates (cx, cy, w, h) in 480x480 space
        boxes = preds[:, :4]
        # Class probabilities
        scores = preds[:, 4:]

        # Find best class and confidence for each anchor
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)

        # Filter by confidence threshold
        mask = confidences >= conf_threshold
        if not np.any(mask):
            return []

        valid_boxes = boxes[mask]
        valid_confs = confidences[mask]
        valid_classes = class_ids[mask]

        # Convert (cx, cy, w, h) to (xmin, ymin, w, h) for cv2.dnn.NMSBoxes
        cx = valid_boxes[:, 0]
        cy = valid_boxes[:, 1]
        w = valid_boxes[:, 2]
        h = valid_boxes[:, 3]

        xmin = (cx - w / 2.0).astype(int)
        ymin = (cy - h / 2.0).astype(int)
        w_int = w.astype(int)
        h_int = h.astype(int)

        cv_boxes = [[int(x), int(y), int(bw), int(bh)] for x, y, bw, bh in zip(xmin, ymin, w_int, h_int)]
        conf_list = [float(c) for c in valid_confs]

        # Run C++ OpenCV NMS
        indices = cv2.dnn.NMSBoxes(cv_boxes, conf_list, conf_threshold, iou_threshold)

        detections = []
        if len(indices) > 0:
            for idx in indices:
                i = idx[0] if isinstance(idx, (list, tuple, np.ndarray)) else idx
                class_id = int(valid_classes[i])
                conf = float(valid_confs[i])
                x1 = max(0, int(xmin[i]))
                y1 = max(0, int(ymin[i]))
                x2 = min(self.input_size[0], int(xmin[i] + w_int[i]))
                y2 = min(self.input_size[1], int(ymin[i] + h_int[i]))

                detections.append({
                    "class": self.class_names.get(class_id, f"class_{class_id}"),
                    "confidence": round(conf, 4),
                    "bbox": [x1, y1, x2, y2],
                })

        return detections

    def predict(
        self,
        image_input: Union[bytes, np.ndarray],
        conf_threshold: float = 0.5,
        iou_threshold: float = 0.45,
    ) -> List[Dict]:
        """Runs end-to-end inference on image bytes or BGR ndarray."""
        blob, orig_shape = self.preprocess(image_input)
        outputs = self.session.run([self.output_name], {self.input_name: blob})[0]
        return self.postprocess(outputs, orig_shape, conf_threshold, iou_threshold)
