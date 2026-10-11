# ─────────────────────────────────────────────────────────────────────────────
# ML Microservice — FastAPI + ONNX Runtime + scikit-learn
# Production-hardened image (<400MB vs legacy 3.3GB PyTorch)
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /build

# Build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment and install lightweight dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Clean up tests and cache to minimize layer size
RUN find /opt/venv -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
RUN find /opt/venv -name "*.pyc" -delete

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS production

# System deps: libgomp1, libglib2.0-0, libgl1 needed for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 \
        libglib2.0-0 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy ONNX models & class mappings (lightweight, ~90MB total)
COPY models/*.onnx ./models/
COPY models/*_classes.json ./models/

# Copy crop recommendation artifacts
COPY crop_prediction/crop_recommendation.pkl ./crop_prediction/crop_recommendation.pkl
COPY crop_prediction/crop_data/ ./crop_prediction/crop_data/
COPY crop_disease_info.json ./crop_disease_info.json

# Copy application scripts + FastAPI app + ONNX inference engine
COPY crop_prediction/crop_predict.py ./crop_prediction/crop_predict.py
COPY scripts/ ./scripts/
COPY onnx_inference.py ./
COPY app.py ./

# Non-root user
RUN useradd -m -u 1001 mluser && chown -R mluser:mluser /app
USER mluser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
