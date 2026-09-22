FROM python:3.11-slim AS production

# Minimal system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all GEE scripts
COPY jobs.py vegetation_data.py soil_data.py weather_data.py \
     water_data.py rainfall_data.py fire_data.py ./

# Non-root user
RUN useradd -m -u 1001 geeuser && chown -R geeuser:geeuser /app
USER geeuser

# Default job — override via docker compose `command:` or env var JOB_NAME
ENV JOB_NAME=vegetation_data

HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=2 \
    CMD python -c "import sys; sys.exit(0)"

CMD ["sh", "-c", "python jobs.py --job ${JOB_NAME}"]