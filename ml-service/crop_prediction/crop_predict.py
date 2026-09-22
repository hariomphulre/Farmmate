# import pandas as pd
# import numpy as np
# import joblib
# import json

# # Load trained model
# model = joblib.load("I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_recommendation.pkl")

# # Load input parameters from JSON file
# with open(r"I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_data", "r", encoding="utf-8") as file:
#     manual_data = json.load(file)

# # Convert to DataFrame
# input_df = pd.DataFrame([manual_data])

# # Predict probabilities
# probs = model.predict_proba(input_df)[0]
# crop_classes = model.classes_

# # Create a DataFrame of crop recommendations
# crop_scores = pd.DataFrame({
#     'Crop': crop_classes,
#     'Probability': probs
# }).sort_values(by='Probability', ascending=False)

# # Load crop info JSON
# with open("crop_data/crop_info.json", "r", encoding="utf-8") as f:
#     crop_info = json.load(f)

# # Load fertilizer schedule JSON
# with open("crop_data/fertilizer_schedule.json", "r", encoding="utf-8") as f:
#     fertilizer_info = json.load(f)

# # Prepare final output
# output_data = {"Top_5_Crop_Recommendations": []}

# top_crops = crop_scores.head(3)

# for index, row in top_crops.iterrows():
#     crop_name = row['Crop']
#     probability = float(row['Probability'])  # Convert numpy float to normal float
    
#     crop_entry = {
#         "Crop": crop_name,
#         "Probability": probability
#     }
    
#     # Crop info
#     if crop_name in crop_info:
#         crop_entry["Info"] = crop_info[crop_name]
    
#     # Fertilizer info
#     if crop_name in fertilizer_info:
#         crop_entry["Fertilizer_Schedule"] = fertilizer_info[crop_name]
    
#     output_data["Top_5_Crop_Recommendations"].append(crop_entry)

# # Save to JSON file
# with open("crop_data/output.json", "w", encoding="utf-8") as out_file:
#     json.dump(output_data, out_file, ensure_ascii=False, indent=4)

# print(" Results saved to crop_data/output.json")


import pandas as pd
import joblib
import json
import os

# Base path for all crop data files
BASE_PATH = r"I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_data"

# Load trained model
model = joblib.load(
    r"I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_recommendation.pkl"
)

# Load input parameters (JSON file)
with open(os.path.join(BASE_PATH, "parameters.json"), "r", encoding="utf-8") as file:
    manual_data = json.load(file)

# Convert to DataFrame
input_df = pd.DataFrame([manual_data])

# Predict probabilities
probs = model.predict_proba(input_df)[0]
crop_classes = model.classes_

# Create a DataFrame of crop recommendations
crop_scores = pd.DataFrame({
    "Crop": crop_classes,
    "Probability": probs
}).sort_values(by="Probability", ascending=False)

# Load crop info JSON
with open(os.path.join(BASE_PATH, "crop_info.json"), "r", encoding="utf-8") as f:
    crop_info = json.load(f)

# Load fertilizer schedule JSON
with open(os.path.join(BASE_PATH, "fertilizer_schedule.json"), "r", encoding="utf-8") as f:
    fertilizer_info = json.load(f)

# Prepare final output
output_data = {"Top_5_Crop_Recommendations": []}

# Take top 5 crops (not just 3)
top_crops = crop_scores.head(5)

for _, row in top_crops.iterrows():
    crop_name = row["Crop"]
    probability = float(row["Probability"])  # Convert numpy float to normal float

    crop_entry = {
        "Crop": crop_name,
        "Probability": probability
    }

    # Crop info
    if crop_name in crop_info:
        crop_entry["Info"] = crop_info[crop_name]

    # Fertilizer info
    if crop_name in fertilizer_info:
        crop_entry["Fertilizer_Schedule"] = fertilizer_info[crop_name]

    output_data["Top_5_Crop_Recommendations"].append(crop_entry)

# Save to JSON file
with open(os.path.join(BASE_PATH, "output.json"), "w", encoding="utf-8") as out_file:
    json.dump(output_data, out_file, ensure_ascii=False, indent=4)

print("✅ Results saved to:", os.path.join(BASE_PATH, "output.json"))
