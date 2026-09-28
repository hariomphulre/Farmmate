import requests
import base64
import os

API_KEY = os.environ.get("ROBOFLOW_API_KEY", "8J1d1XoYS8LbF5B2HDQD")
API_URL = "https://detect.roboflow.com"
MODEL_ID = "corn-disease-hg92o/1"

def run_model(image_data):
    """Runs the corn disease detection model using pure requests."""
    url = f"{API_URL}/{MODEL_ID}?api_key={API_KEY}"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    if isinstance(image_data, bytes):
        b64_img = base64.b64encode(image_data).decode("ascii")
    else:
        with open(image_data, 'rb') as f:
            b64_img = base64.b64encode(f.read()).decode("ascii")
            
    response = requests.post(url, data=b64_img, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()
