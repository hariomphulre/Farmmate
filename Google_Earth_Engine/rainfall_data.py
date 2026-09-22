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

parameters=["gpm","chirps","trmm","merra2","era5"]

################################   INDEX FUNCTIONS   ###################################

def getGPM(image):
    rainfall = image.select('precipitationCal').rename('gpm')
    return rainfall.copyProperties(image, ['system:time_start'])

def getCHIRPS(image):
    rainfall = image.select('precipitation').rename('chirps')
    return rainfall.copyProperties(image, ['system:time_start'])

def getERA5(image):
    precip = image.select('total_precipitation_sum').multiply(1000).rename('era5_precip')  # mm
    temp = image.select('temperature_2m').subtract(273.15).rename('era5_temp')           # °C
    et = image.select('total_evaporation_sum').multiply(1000).rename('era5_et')         # mm

    # return an image with these three named bands and copy time property
    return image.addBands([precip, temp, et]) \
                .select(['era5_precip', 'era5_temp', 'era5_et']) \
                .copyProperties(image, ['system:time_start'])

def getTRMM(image):
    hours_in_month = ee.Number(image.date().advance(1, 'month').difference(image.date(), 'hour'))
    rainfall = image.select('precipitation').multiply(hours_in_month).rename('trmm')  # mm/month
    return rainfall.copyProperties(image, ['system:time_start'])

def getMERRA2(image):
    rainfall = image.select('Rainf_f_tavg').multiply(86400).rename('merra2')
    return rainfall.copyProperties(image, ['system:time_start'])
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

    ref = db.reference("GEE/climate-data/rain/").child(index_name)
    ref.set(metadata)

    print(f"✅ Stored metadata for {index_name} in Firebase")

#################################################################################################
def create_feature_factory(index_name):
    def create_feature(img):
        mean_dict = img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=10000,   # ERA5 ~9km resolution
            maxPixels=1e9
        )

        centroid = aoi.centroid().coordinates()
        lon = ee.Number(centroid.get(0))
        lat = ee.Number(centroid.get(1))

        if index_name == "era5":
            # use the exact names we created in getERA5()
            return ee.Feature(None, {
                'date': img.date().format('YYYY-MM-dd'),
                'era5_precip': mean_dict.get('era5_precip'),
                'era5_temp': mean_dict.get('era5_temp'),
                'era5_et': mean_dict.get('era5_et'),
                'longitude': lon,
                'latitude': lat
            })
        elif index_name == "merra2":
            return ee.Feature(None, {
                'date': img.date().format('YYYY-MM-dd'),
                'merra2': mean_dict.get('merra2'),
                'longitude': lon,
                'latitude': lat
            })
        else:
            return ee.Feature(None, {
                'date': img.date().format('YYYY-MM-dd'),
                index_name: mean_dict.get(index_name),
                'longitude': lon,
                'latitude': lat
            })
    return create_feature


for index in parameters:
    series=None
    if(index=="gpm"):
        gpm = ee.ImageCollection("NASA/GPM_L3/IMERG_V06") \
                    .filterBounds(aoi) \
                    .filterDate('2025-01-01', '2025-04-01')
        series = gpm.map(getGPM)
    if(index=="chirps"):
        chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY") \
                    .filterBounds(aoi) \
                    .filterDate('2025-01-01', '2025-04-01')
        series = chirps.map(getCHIRPS)

    if index == "era5":
        era5 = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR") \
                    .filterBounds(aoi) \
                    .filterDate('2025-01-01', '2025-04-01')
        series = era5.map(getERA5)

    if index=="trmm":
        trmm = ee.ImageCollection("TRMM/3B43V7") \
                    .filterBounds(aoi) \
                    .filterDate('2010-01-01', '2014-12-31')  # TRMM ended 2015
        series = trmm.map(getTRMM)

    if index == "merra2":
        merra2 = ee.ImageCollection("NASA/GLDAS/V021/NOAH/G025/T3H") \
            .filterBounds(aoi) \
            .filterDate('2023-01-01', '2023-04-01')
        series = merra2.map(getMERRA2)

    if(series is None):
        print("Series not found")
        break

    feature_collection = ee.FeatureCollection(series.map(create_feature_factory(index)))

    GCS_FILE_NAME = index
    file_path = f'rain/{GCS_FILE_NAME}-00000-of-00001.csv' 

    print(f"\nStarting export to Google Cloud Storage bucket: '{GCS_BUCKET_NAME}'...")
    task_gcs = ee.batch.Export.table.toCloudStorage(
        collection=feature_collection,
        description='Export_Index_to_GCS',
        bucket=GCS_BUCKET_NAME,
        fileNamePrefix=f"rain/{GCS_FILE_NAME}",
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

            blobs = list(storage_client.list_blobs(GCS_BUCKET_NAME, prefix=f"rain/{GCS_FILE_NAME}"))
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


