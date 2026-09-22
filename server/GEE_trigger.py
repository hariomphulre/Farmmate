import json
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
from dotenv import load_dotenv

JSON_FILE_PATH = r"I:\Projects\Climate-Resilient-Agriculture\System\server\field_corrdinates\manipal.json"
WATCH_DIRECTORY = os.path.dirname(JSON_FILE_PATH)


class JSONFileHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()

    def on_modified(self, event):
        if event.src_path.endswith("manipal.json"):
            self.process_json()

    # def on_created(self, event):
    #     print("hh")
    #     if event.src_path.endswith("manipal.json"):
    #         self.process_json()

    def process_json(self):
        try:
            with open(JSON_FILE_PATH, 'r') as file:
                data = json.load(file)
                coordinates_list = [tuple(coord) for coord in data.values()]
                # print("Updated Coordinates List:")
                # print(coordinates_list)

                load_dotenv()
                env_path="I:\Projects\Climate-Resilient-Agriculture\System\server\.env"
                json_string = json.dumps(coordinates_list)

                if os.path.exists(env_path):
                    with open(env_path, "r") as file:
                        lines = file.readlines()
                else:
                    lines = []

                key = "COORDINATES"
                updated = False

                for i, line in enumerate(lines):
                    if line.strip().startswith(f"{key}="):
                        lines[i] = f'{key}={json_string}\n'
                        updated = True
                        break

                if not updated:
                    lines.append(f'{key}={json_string}\n')

                with open(env_path, "w") as file:
                    file.writelines(lines)

                print("COORDINATES updated in .env")

                subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//Google_Earth_Engine//vegetation_data.py'])
                subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//Google_Earth_Engine//water_data.py'])
                subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//Google_Earth_Engine/rainfall_data.py'])
                # subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//Google_Earth_Engine//fire_data.py'])
                subprocess.Popen(['python', 'I://Projects//Climate-Resilient-Agriculture//System//server//Google_Earth_Engine//soil_data.py'])

        except Exception as e:
            print(f"Error reading JSON: {e}")


if __name__ == "__main__":
    event_handler = JSONFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=WATCH_DIRECTORY, recursive=False)

    print(f"Watching for changes in {JSON_FILE_PATH}...")
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


