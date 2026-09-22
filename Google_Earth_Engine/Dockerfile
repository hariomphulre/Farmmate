FROM python:3.10-slim

WORKDIR /Google_Earth_Engine

# Install system dependencies for GEE, firebase, gcs
RUN apt-get update && apt-get install -y \
    git curl wget && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all scripts
COPY jobs.py vegetation_data.py soil_data.py weather_data.py water_data.py rainfall_data.py fire_data.py ./

# Default job (can override)
CMD ["python", "jobs.py", "--job", "vegetation_data"]