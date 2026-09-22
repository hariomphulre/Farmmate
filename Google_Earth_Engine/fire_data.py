import csv
import ee
import time
import os
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import io
import base64
import json
import firebase_admin
from google.cloud import storage
from google.oauth2 import service_account
from firebase_admin import credentials
from firebase_admin import db
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
load_dotenv()

try:
    ee.Initialize(project=os.getenv("EE_PROJECT"),opt_url=os.getenv("EE_OPT_URL"))
    print("Google Earth Engine initialized successfully.")
except ee.EEException as e:
    print(f"Error initializing Earth Engine: {e}")
    print("Please make sure you have authenticated via 'earthengine authenticate'.")
    exit()


firebase_key_b64 = os.getenv("FIREBASE_KEY_BASE64")
firebase_key_json = base64.b64decode(firebase_key_b64).decode('utf-8')
firebase_cred_dict = json.loads(firebase_key_json)

firebase_cred = credentials.Certificate(firebase_cred_dict)
firebase_admin.initialize_app(firebase_cred, {
    'databaseURL': os.getenv("FIREBASE_REALTIME_DB")
})


# firebase_cred = credentials.Certificate(
#     "C:/Users/hario/OneDrive/Coding - Workspace/Service Account KEYs/Firebase/climate-resilient-agriculture-firebase-adminsdk-fbsvc-44b4271bbf.json"
# )
# firebase_admin.initialize_app(firebase_cred, {
#     'databaseURL': os.getenv("FIREBASE_REALTIME_DB")
# })

gcs_key_b64 = os.getenv("GCS_KEY_BASE64")
gcs_key_json = base64.b64decode(gcs_key_b64).decode('utf-8')
gcs_cred_dict = json.loads(gcs_key_json)

gcs_credentials = service_account.Credentials.from_service_account_info(gcs_cred_dict)
storage_client = storage.Client(credentials=gcs_credentials, project=os.getenv("EE_PROJECT"))

# gcs_credentials = service_account.Credentials.from_service_account_file(
#     "C:/Users/hario/OneDrive/Coding - Workspace/Service Account KEYs/GCP Service acc keys/climate-resilient-agriculture-918f7e7e1952.json"
# )
# storage_client = storage.Client(credentials=gcs_credentials, project="climate-resilient-agriculture")

GCS_BUCKET_NAME = 'earth-engine-climate-data'
# storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET_NAME)


aoi = ee.Geometry.Rectangle([73.70, 18.65, 73.71, 18.66])

s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
    .filterBounds(aoi) \
    .filterDate('2025-01-01', '2025-04-01') \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))

parameters = ["modis_fire", "viirs_fire", "burned_area", "frp", "fwi"]

################################   INDEX FUNCTIONS   ###################################

def getMODIS_Fire(image):
    # FireMask: 0=not processed, 2=low, 3=nominal, 4=high confidence
    fire = image.select('FireMask').rename('modis_fire')
    frp = image.select('MaxFRP').rename('modis_frp')  # Fire Radiative Power (MW)
    return image.addBands([fire, frp]).copyProperties(image, ['system:time_start'])

def getVIIRS_Fire(image):
    fire = image.select('FireMask').rename('viirs_fire')
    frp = image.select('MaxFRP').rename('viirs_frp')  # Fire Radiative Power
    return image.addBands([fire, frp]).copyProperties(image, ['system:time_start'])

def getBurnedArea(image):
    burned = image.select('BurnDate').rename('burned_area')
    return image.addBands(burned).copyProperties(image, ['system:time_start'])

def getFRP(image):
    # Use FRP from MODIS/VIIRS directly
    return image.select('MaxFRP').rename('frp').copyProperties(image, ['system:time_start'])

def getFWI(image):
    # Fire Weather Index must be computed (simplified placeholder example)
    # Inputs: wind speed, temp, humidity, precipitation (from ERA5)
    temp = image.select('temperature_2m')  # K
    wind = image.select('u_component_of_wind_10m')
    rh = image.select('relative_humidity_2m')  # %
    precip = image.select('total_precipitation')

    # Placeholder: Higher temp + wind + lower humidity -> higher fire risk
    fwi = temp.multiply(0.02).add(wind.abs()).subtract(rh.multiply(0.01)).subtract(precip.multiply(10))
    return fwi.rename('fwi').copyProperties(image, ['system:time_start'])

#######################################  Save to firebase DB #########################################

def upload_csv_blob_to_firebase(bucket_name, blob_name, index_name):
    # bucket = storage_client.bucket(bucket_name)
    # blob = bucket.blob(blob_name)

    # # Read blob into memory
    # data_str = blob.download_as_text()
    # reader = csv.DictReader(io.StringIO(data_str))
    # data = list(reader)

    # # Push to Firebase under /fire/{index_name}
    # ref = db.reference("fire").child(index_name)
    # ref.set(data)   # overwrites only this index node


    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    IST = timezone(timedelta(hours=5, minutes=30))
    date = datetime.now(IST).strftime("%d-%m-%Y")
    time = datetime.now(IST).strftime("%H:%M:%S")
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(hours=24),
        method="GET"
    )
    metadata = {
        "file_name": os.path.basename(blob_name),
        "url": url,
        "date": date,
        "time": time
    }

    ref = db.reference("GEE/climate-data/fire/").child(index_name)
    ref.set(metadata)

    print(f"✅ Stored metadata for {index_name} in Firebase")

#################################################################################################
def create_feature_factory(index_name):
    def create_feature(img):
        mean_dict = img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=10,
            maxPixels=1e9
        )

        centroid = aoi.centroid().coordinates()
        lon = ee.Number(centroid.get(0))
        lat = ee.Number(centroid.get(1))

        index_value = ee.Number(mean_dict.get(index_name))

        return ee.Feature(None, {
            'date': img.date().format('YYYY-MM-dd'),
            index_name : index_value,
            'longitude': lon,
            'latitude': lat
        })
    return create_feature

series=None
for index in parameters:
    if index == "modis_fire":
        s = ee.ImageCollection("MODIS/061/MOD14A1") \
                .filterBounds(aoi) \
                .filterDate('2025-01-01', '2025-04-01')
        series = s.map(getMODIS_Fire)

    if index == "viirs_fire":
        s = ee.ImageCollection("NOAA/VIIRS/001/VNP14A1") \
                .filterBounds(aoi) \
                .filterDate('2025-01-01', '2025-04-01')
        series = s.map(getVIIRS_Fire)

    if index == "burned_area":
        s = ee.ImageCollection("MODIS/061/MCD64A1") \
                .filterBounds(aoi) \
                .filterDate('2025-01-01', '2025-04-01')
        series = s.map(getBurnedArea)

    if index == "frp":
        s = ee.ImageCollection("NOAA/VIIRS/001/VNP14A1") \
                .filterBounds(aoi) \
                .filterDate('2025-01-01', '2025-04-01')
        series = s.map(getFRP)

    if index == "fwi":
        s = ee.ImageCollection("ECMWF/ERA5/DAILY") \
                .filterBounds(aoi) \
                .filterDate('2025-01-01', '2025-04-01')
        series = s.map(getFWI)
    
    if(series is None):
        print("Series not found")
        break

    feature_collection = ee.FeatureCollection(series.map(create_feature_factory(index)))

    GCS_FILE_NAME = index
    file_path = f'fire/{GCS_FILE_NAME}-00000-of-00001.csv' 

    print(f"\nStarting export to Google Cloud Storage bucket: '{GCS_BUCKET_NAME}'...")
    task_gcs = ee.batch.Export.table.toCloudStorage(
        collection=feature_collection,
        description='Export_Index_to_GCS',
        bucket=GCS_BUCKET_NAME,
        fileNamePrefix=f"fire/{GCS_FILE_NAME}",
        fileFormat='CSV'
    )
    task_gcs.start()

    while task_gcs.active():
        print(f"Polling for task status... (Current status: {task_gcs.status()['state']})")
        time.sleep(2)

    status = task_gcs.status()
    if status['state'] == 'COMPLETED':
        print(f"✅ Stored in GCS Bucket '{GCS_BUCKET_NAME}', filename '{GCS_FILE_NAME}.csv'")
        # time.sleep(10)
        try:

            # blobs = list(bucket.list_blobs(prefix=f"fire/{GCS_FILE_NAME}"))
            # if not blobs:
            #     print(f"❌ No files found in bucket with prefix: fire/{GCS_FILE_NAME}")
            #     # exit()

            blobs = list(storage_client.list_blobs(GCS_BUCKET_NAME, prefix=f"fire/{GCS_FILE_NAME}"))
            for blob in blobs:
                if blob.name.endswith(".csv"):
                    upload_csv_blob_to_firebase(GCS_BUCKET_NAME, blob.name, index)

                    # filename = os.path.basename(blob.name)
                    # destination_file_name = os.path.join(r"I:\Projects\Climate-Resilient-Agriculture\System\server",filename)

                    # blob.download_to_filename(destination_file_name)
                    # print(f"✅ File downloaded to: {os.path.abspath(destination_file_name)}")
                    # file_path = destination_file_name

                    break

            else:
                print("❌ No CSV file found in the exported blobs.")

        except ImportError:
            print("\nTo automatically download the file, please install the GCS client library:")
            print("pip install google-cloud-storage")
        except Exception as e:
            print(f"\nAn error occurred during download: {e}")

    else:
        print(f"Export task failed or was cancelled. Final status: {status['state']}")
        print(f"Error message: {status.get('error_message', 'No error message provided.')}")
        # exit() # Exit the script if the export failed/
        break


