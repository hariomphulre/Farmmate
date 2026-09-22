import subprocess

subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//disease_trigger.py'])
subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//GEE_trigger.py'])
subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//crop_prediction//trigger_crop_predict.py'])