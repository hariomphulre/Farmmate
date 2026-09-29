# ─────────────────────────────────────────────────────────────────────────────
# ML Microservice — FastAPI + YOLO + scikit-learn
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim AS production

# System deps: OpenCV headless needs libGL + libGLib; YOLO needs libgomp
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 \
        libglib2.0-0 \
        libgl1 \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the virtual environment from the builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy ML models
COPY models/ ./models/

# Copy crop prediction data + model
COPY crop_prediction/crop_recommendation.pkl ./crop_prediction/crop_recommendation.pkl
COPY crop_prediction/crop_data/ ./crop_prediction/crop_data/

# Copy application scripts + FastAPI app
COPY crop_prediction/crop_predict.py ./crop_prediction/crop_predict.py
COPY scripts/ ./scripts/
COPY app.py ./

# Non-root user
RUN useradd -m -u 1001 mluser && chown -R mluser:mluser /app
USER mluser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
