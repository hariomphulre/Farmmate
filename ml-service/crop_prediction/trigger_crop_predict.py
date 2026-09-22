import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

class FolderHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:   # only trigger for files
            self.run_task(event.src_path)

    def run_task(self, filepath):
        if filepath.endswith(".json"):
            subprocess.Popen(['python', r'I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_predict.py'])

if __name__ == "__main__":
    folder_to_watch = r"I:\Projects\Climate-Resilient-Agriculture\System\server\crop_prediction\crop_data"

    event_handler = FolderHandler()
    observer = Observer()
    observer.schedule(event_handler, path=folder_to_watch, recursive=False)
    observer.start()

    print(f"👀 Watching folder: {folder_to_watch}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()