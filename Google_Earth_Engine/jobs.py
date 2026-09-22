# jobs.py
import argparse
import subprocess
import sys

def run_job(job_name: str):
    # Each branch calls the dedicated script.
    # Use sys.executable to ensure the same Python in container is used.
    if job_name == "vegetation_data":
        subprocess.run([sys.executable, "vegetation_data.py"], check=True)
    elif job_name == "soil_data":
        subprocess.run([sys.executable, "soil_data.py"], check=True)
    elif job_name == "weather_data":
        subprocess.run([sys.executable, "weather_data.py"], check=True)
    elif job_name == "water_data":
        subprocess.run([sys.executable, "water_data.py"], check=True)
    elif job_name == "rainfall_data":
        subprocess.run([sys.executable, "rainfall_data.py"], check=True)
    elif job_name == "fire_data":
        subprocess.run([sys.executable, "fire_data.py"], check=True)
    else:
        raise ValueError(f"Unknown job: {job_name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Job Runner for GEE Pipelines")
    parser.add_argument("--job", type=str, required=True,
                        help="vegetation_data | soil_data | weather_data | water_data | rainfall_data | fire_data")
    args = parser.parse_args()
    run_job(args.job.lower())
