# import time
# import os
# import sys
# import glob
# import json
# import cv2
# import numpy as np
# from ultralytics import YOLO
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler

# WATCH_FOLDER = r"I:/Projects/SmartAgri/server/crop_imgs/disease"

# def safe_read_image(file_path, timeout=10, delay=0.5):
#     """
#     Keep trying to read image until successful or timeout.
#     """
#     start = time.time()
#     while time.time() - start < timeout:
#         try:
#             frame = cv2.imread(file_path)
#             if frame is not None:
#                 return frame
#         except Exception as e:
#             print(f"⚠️ Error reading {file_path}: {e}")
#         time.sleep(delay)
#     return None

# class ImageEventHandler(FileSystemEventHandler):
#     def on_modified(self, event):
#         # if not event.is_directory:
#         #     crops=["tea","tomato","rice"]
#         #     for crop in crops:
#         #         if event.src_path.lower().endswith((f'{crop}.png', f'{crop}.jpg', f'{crop}.jpeg')):
#         #             print(f"Image modified: {event.src_path}")
#         #             self.trigger_action(event.src_path, crop)
#         if not event.is_directory:
#             time.sleep(1.0)  # wait for writer to finish
#             crops = ["tea", "tomato", "rice"]
#             for crop in crops:
#                 if event.src_path.lower().endswith((f'{crop}.png', f'{crop}.jpg', f'{crop}.jpeg')):
#                     print(f"Image modified: {event.src_path}")
#                     self.trigger_action(event.src_path, crop)
                    


#     # def on_created(self, event):
#     #     if not event.is_directory:
#     #         crops=["tea","tomato","rice"]
#     #         for crop in crops:
#     #             if event.src_path.lower().endswith((f'{crop}.png', f'{crop}.jpg', f'{crop}.jpeg')):
#     #                 print(f"Image created: {event.src_path}")
#     #                 self.trigger_action(event.src_path, crop)

#     def trigger_action(self, file_path, crop):

#         time.sleep(5)

#         with open(r"I:/Projects/SmartAgri/server/detect_results/suggest.json", "r") as file:
#             data = json.load(file)
#         data["result"]=False

#         with open("I:/Projects/SmartAgri/server/detect_results/suggest.json", "w") as file:
#             json.dump(data, file, indent=4)

#         if(crop=="tea"):
#             model_path = r"I:/Projects/SmartAgri/server/tea1.pt"
#             img_source = file_path
#             output_dir = r"I:/Projects/SmartAgri/server/detect_results/disease"
#         if(crop=="tomato"):
#             model_path = r"I:/Projects/SmartAgri/server/tomato_leaf.pt"
#             img_source = file_path
#             output_dir = r"I:/Projects/SmartAgri/server/detect_results/disease"

#         min_thresh = 0.5
#         user_res = "480x480"

#         if not os.path.exists(model_path):
#             print('ERROR: Model path is invalid or not found.')
#             sys.exit(0)

#         model = YOLO(model_path, task='detect')
#         labels = model.names

#         img_ext_list = ['.jpg','.JPG','.jpeg','.JPEG','.png','.PNG','.bmp','.BMP']
#         vid_ext_list = ['.avi','.mov','.mp4','.mkv','.wmv']

#         if os.path.isdir(img_source):
#             source_type = 'folder'
#         elif os.path.isfile(img_source):
#             _, ext = os.path.splitext(img_source)
#             if ext in img_ext_list:
#                 source_type = 'image'
#             elif ext in vid_ext_list:
#                 source_type = 'video'
#             else:
#                 print(f'File extension {ext} not supported.')
#                 sys.exit(0)
#         else:
#             print(f'Input {img_source} is invalid.')
#             sys.exit(0)

#         resize = False
#         if user_res:
#             resize = True
#             resW, resH = map(int, user_res.split('x'))

#         os.makedirs(output_dir, exist_ok=True)

#         if source_type == 'image':
#             imgs_list = [img_source]
#         elif source_type == 'folder':
#             imgs_list = [f for f in glob.glob(img_source + '/*') if os.path.splitext(f)[1] in img_ext_list]

#         bbox_colors = [(164,120,87), (68,148,228), (93,97,209), (178,182,133), (88,159,106), 
#                     (96,202,231), (159,124,168), (169,162,241), (98,118,150), (172,176,184)]

#         for idx, img_filename in enumerate(imgs_list):
#             t_start = time.perf_counter()

#             # frame = cv2.imread(img_filename)
#             # if frame is None:
#             #     print(f"Could not load {img_filename}, skipping...")
#             #     continue
#             frame = safe_read_image(img_filename)
#             if frame is None:
#                 print(f"❌ Could not load {img_filename} after retries, skipping...")
#                 continue

#             if resize:
#                 frame = cv2.resize(frame, (resW, resH))

#             results = model(frame, verbose=False)
#             detections = results[0].boxes

#             object_count = 0
#             for det in detections:
#                 xyxy = det.xyxy.cpu().numpy().squeeze().astype(int)
#                 xmin, ymin, xmax, ymax = xyxy
#                 classidx = int(det.cls.item())
#                 classname = labels[classidx]
#                 conf = det.conf.item()

#                 if conf > min_thresh:
#                     color = bbox_colors[classidx % 10]
#                     cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

#                     label = f'{classname}: {int(conf*100)}%'
#                     labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
#                     label_ymin = max(ymin, labelSize[1] + 10)
#                     cv2.rectangle(frame, (xmin, label_ymin-labelSize[1]-10),
#                                 (xmin+labelSize[0], label_ymin+baseLine-10), color, cv2.FILLED)
#                     cv2.putText(frame, label, (xmin, label_ymin-7),
#                                 cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1)

#                     object_count += 1

#                     with open(r"I:/Projects/SmartAgri/server/detect_results/suggest.json", "r") as file:
#                         data = json.load(file)

#                     if(classname=="brown blight" and crop=="tea"):
#                         data["content"]="Caused by fungus Colletotrichum camelliae. Favors high humidity, rainfall, poor air circulation. Leads to brown spots → leaf blight → yield loss."
#                         data["result"]=True
#                         print("✅ Processing complete. All results saved.")

#                     elif(classname=="Tomato Early blight"):
#                         data["content"]="tomato suggestions"
#                         print("✅ Processing complete. All results saved.")

#                     else:
#                         data["content"]="Not available"
#                         data["result"]=False
#                         print("❌ Not detected")

#                     with open(r"I:/Projects/SmartAgri/server/detect_results/suggest.json", "w") as file:
#                         json.dump(data, file, indent=4)

#             cv2.putText(frame, f'Objects: {object_count}', (10,40),
#                         cv2.FONT_HERSHEY_SIMPLEX, .7, (0,255,255), 2)

#             save_path = os.path.join(output_dir, f"result_{crop}.png")
#             # cv2.imwrite(save_path, frame)

#             t_stop = time.perf_counter()
#             fps = 1 / (t_stop - t_start)

# def start_watching():
#     event_handler = ImageEventHandler()
#     observer = Observer()
#     observer.schedule(event_handler, WATCH_FOLDER, recursive=False)
#     observer.start()
#     print(f"Start Trigger...")

#     try:
#         while True:
#             time.sleep(1)
#     except KeyboardInterrupt:
#         observer.stop()
#     observer.join()

# if __name__ == "__main__":
#     start_watching()
import time
import os
import sys
import glob
import json
import cv2
import numpy as np
from ultralytics import YOLO
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCH_FOLDER = r"I:/Projects/Climate-Resilient-Agriculture/System/server/crop_imgs/disease"


def safe_read_image(file_path, timeout=10, delay=0.5):
    """
    Keep trying to read image until successful or timeout.
    """
    start = time.time()
    while time.time() - start < timeout:
        try:
            frame = cv2.imread(file_path)
            if frame is not None:
                return frame
        except Exception as e:
            print(f"⚠️ Error reading {file_path}: {e}")
        time.sleep(delay)
    return None


def atomic_imwrite(path, frame):
    """
    Save an image atomically:
    1. Write to temp file (path + '.part')
    2. Rename to final file
    """
    tmp_path = path + ".part"
    success = cv2.imwrite(tmp_path, frame)
    if success:
        os.replace(tmp_path, path)  # atomic rename
    else:
        raise IOError(f"❌ Failed to write temp file {tmp_path}")


class ImageEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            # wait a bit to avoid incomplete writes
            time.sleep(1.0)
            crops = ["tea", "tomato", "rice"]
            for crop in crops:
                if event.src_path.lower().endswith(
                    (f'{crop}.png', f'{crop}.jpg', f'{crop}.jpeg')
                ):
                    print(f"Image modified: {event.src_path}")
                    self.trigger_action(event.src_path, crop)

    def trigger_action(self, file_path, crop):
        time.sleep(1.0)  # extra delay for safety

        # Reset suggest.json
        with open(r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/suggest.json", "r") as file:
            data = json.load(file)
        data["result"] = False
        with open(r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/suggest.json", "w") as file:
            json.dump(data, file, indent=4)

        # Select model based on crop
        if crop == "tea":
            model_path = r"I:/Projects/Climate-Resilient-Agriculture/System/server/tea1.pt"
            img_source = file_path
            output_dir = r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/disease"
        elif crop == "tomato":
            model_path = r"I:/Projects/Climate-Resilient-Agriculture/System/server/tomato_leaf.pt"
            img_source = file_path
            output_dir = r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/disease"
        else:
            print(f"⚠️ No model defined for crop {crop}, skipping...")
            return

        min_thresh = 0.5
        user_res = "480x480"

        if not os.path.exists(model_path):
            print("ERROR: Model path is invalid or not found.")
            sys.exit(0)

        model = YOLO(model_path, task="detect")
        labels = model.names

        img_ext_list = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG", ".bmp", ".BMP"]
        vid_ext_list = [".avi", ".mov", ".mp4", ".mkv", ".wmv"]

        if os.path.isdir(img_source):
            source_type = "folder"
        elif os.path.isfile(img_source):
            _, ext = os.path.splitext(img_source)
            if ext in img_ext_list:
                source_type = "image"
            elif ext in vid_ext_list:
                source_type = "video"
            else:
                print(f"File extension {ext} not supported.")
                sys.exit(0)
        else:
            print(f"Input {img_source} is invalid.")
            sys.exit(0)

        resize = False
        if user_res:
            resize = True
            resW, resH = map(int, user_res.split("x"))

        os.makedirs(output_dir, exist_ok=True)

        if source_type == "image":
            imgs_list = [img_source]
        elif source_type == "folder":
            imgs_list = [
                f
                for f in glob.glob(img_source + "/*")
                if os.path.splitext(f)[1] in img_ext_list
            ]

        bbox_colors = [
            (164, 120, 87),
            (68, 148, 228),
            (93, 97, 209),
            (178, 182, 133),
            (88, 159, 106),
            (96, 202, 231),
            (159, 124, 168),
            (169, 162, 241),
            (98, 118, 150),
            (172, 176, 184),
        ]

        for idx, img_filename in enumerate(imgs_list):
            t_start = time.perf_counter()

            frame = safe_read_image(img_filename)
            if frame is None:
                print(f"❌ Could not load {img_filename} after retries, skipping...")
                continue

            if resize:
                frame = cv2.resize(frame, (resW, resH))

            results = model(frame, verbose=False)
            detections = results[0].boxes

            object_count = 0
            for det in detections:
                xyxy = det.xyxy.cpu().numpy().squeeze().astype(int)
                xmin, ymin, xmax, ymax = xyxy
                classidx = int(det.cls.item())
                classname = labels[classidx]
                conf = det.conf.item()

                if conf > min_thresh:
                    color = bbox_colors[classidx % 10]
                    cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

                    label = f"{classname}: {int(conf*100)}%"
                    labelSize, baseLine = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
                    )
                    label_ymin = max(ymin, labelSize[1] + 10)
                    cv2.rectangle(
                        frame,
                        (xmin, label_ymin - labelSize[1] - 10),
                        (xmin + labelSize[0], label_ymin + baseLine - 10),
                        color,
                        cv2.FILLED,
                    )
                    cv2.putText(
                        frame,
                        label,
                        (xmin, label_ymin - 7),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 0, 0),
                        1,
                    )

                    object_count += 1

                    with open(
                        r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/suggest.json", "r"
                    ) as file:
                        data = json.load(file)

                    if classname == "brown blight" and crop == "tea":
                        data[
                            "content"
                        ] = "Caused by fungus Colletotrichum camelliae. Favors high humidity, rainfall, poor air circulation. Leads to brown spots → leaf blight → yield loss."
                        data["result"] = True
                        print("✅ Processing complete. All results saved.")

                    elif classname == "Tomato Early blight":
                        data["content"] = "tomato suggestions"
                        data["result"] = True
                        print("✅ Processing complete. All results saved.")

                    else:
                        data["content"] = "Not available"
                        data["result"] = False
                        print("❌ Not detected")

                    with open(
                        r"I:/Projects/Climate-Resilient-Agriculture/System/server/detect_results/suggest.json", "w"
                    ) as file:
                        json.dump(data, file, indent=4)

            cv2.putText(
                frame,
                f"Objects: {object_count}",
                (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2,
            )

            save_path = os.path.join(output_dir, f"result_{crop}.png")
            atomic_imwrite(save_path, frame)  # atomic save for result

            t_stop = time.perf_counter()
            fps = 1 / (t_stop - t_start)


def start_watching():
    event_handler = ImageEventHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_FOLDER, recursive=False)
    observer.start()
    print("Start Trigger...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    start_watching()
