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

parameters=["ndvi","evi","gci","psri","ndre","cri1"]

################################   INDEX FUNCTIONS   ###################################

def getNDVI(image):
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('ndvi')
    return ndvi.copyProperties(image, ['system:time_start'])

def getEVI(image):
    nir = image.select('B8')
    red = image.select('B4')
    blue = image.select('B2')

    evi = nir.subtract(red) \
        .multiply(2.5) \
        .divide(nir.add(red.multiply(6)).subtract(blue.multiply(7.5)).add(1)) \
        .rename('evi')

    return evi.copyProperties(image, ['system:time_start'])

def getCRI1(image):
    blue = image.select('B2').divide(10000)
    green = image.select('B3').divide(10000)
    
    cri1 = ee.Image(1).divide(blue).subtract(ee.Image(1).divide(green)).rename('cri1')
    return cri1.copyProperties(image, ['system:time_start'])

def getGCI(image):
    nir = image.select('B8')
    green = image.select('B3')

    gci = nir.divide(green).subtract(1).rename('gci')
    return gci.copyProperties(image, ['system:time_start'])

def getPSRI(image):
    red = image.select('B4')
    blue = image.select('B2')
    red_edge = image.select('B5')
    
    psri = red.subtract(blue).divide(red_edge).rename('psri')
    return psri.copyProperties(image, ['system:time_start'])

def getNDRE(image):
    nir = image.select('B8')
    red_edge = image.select('B5')

    ndre = nir.subtract(red_edge).divide(nir.add(red_edge)).rename('ndre')
    return ndre.copyProperties(image, ['system:time_start'])

#######################################  Save to firebase DB #########################################

def upload_csv_blob_to_firebase(bucket_name, blob_name, index_name):
    # bucket = storage_client.bucket(bucket_name)
    # blob = bucket.blob(blob_name)

    # # Read blob into memory
    # data_str = blob.download_as_text()
    # reader = csv.DictReader(io.StringIO(data_str))
    # data = list(reader)

    # # Push to Firebase under /vegetation/{index_name}
    # ref = db.reference("vegetation").child(index_name)
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

    ref = db.reference("GEE/climate-data/vegetation/").child(index_name)
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
    if(index=="ndvi"):
        series=s2.map(getNDVI)
    if(index=="evi"):
        series=s2.map(getEVI)
    if(index=="gci"):
        series=s2.map(getGCI)
    if(index=="psri"):
        series=s2.map(getPSRI)
    if(index=="ndre"):
        series=s2.map(getNDRE)
    if(index=="cri1"):
        series=s2.map(getCRI1)
    
    if(series is None):
        print("Series not found")
        break

    feature_collection = ee.FeatureCollection(series.map(create_feature_factory(index)))

    GCS_FILE_NAME = index
    file_path = f'vegetation/{GCS_FILE_NAME}-00000-of-00001.csv' 

    print(f"\nStarting export to Google Cloud Storage bucket: '{GCS_BUCKET_NAME}'...")
    task_gcs = ee.batch.Export.table.toCloudStorage(
        collection=feature_collection,
        description='Export_Index_to_GCS',
        bucket=GCS_BUCKET_NAME,
        fileNamePrefix=f"vegetation/{GCS_FILE_NAME}",
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

            # blobs = list(bucket.list_blobs(prefix=f"vegetation/{GCS_FILE_NAME}"))
            # if not blobs:
            #     print(f"❌ No files found in bucket with prefix: vegetation/{GCS_FILE_NAME}")
            #     # exit()

            blobs = list(storage_client.list_blobs(GCS_BUCKET_NAME, prefix=f"vegetation/{GCS_FILE_NAME}"))
            for blob in blobs:
                if blob.name.endswith(".csv"):
                    upload_csv_blob_to_firebase(GCS_BUCKET_NAME, blob.name, index)

                    LOCAL_DIR = r"I:\Projects\Climate-Resilient-Agriculture\System\client\local_csv"   # 🔹 change this to your preferred folder

                    os.makedirs(LOCAL_DIR, exist_ok=True)   

                    local_filename = os.path.basename(blob.name)
                    destination_file_path = os.path.join(LOCAL_DIR, local_filename)

                    blob.download_to_filename(destination_file_path)

                    print(f"✅ File downloaded locally: {destination_file_path}")

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


