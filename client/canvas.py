import requests

import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import cv2 as cv
import numpy as np

import shutil


# Create an instance of tkinter frame
root = tk.Tk()

# Set the geometry of tkinter frame
root.geometry("800x600")
root.title("Capture")
root.resizable(0, 0)

# button = tk.Button(root, text="Update", command=lambda:update_image())
button = tk.Button(root, text="Update", command=lambda:update_stream())
button.grid(column=0, row=0, columnspan=3)

# Create a canvas widget
canvas = tk.Canvas(root, width=400, height=296)
canvas.grid(column=0, row=1, columnspan=3)

def convert_image(content):
    url_image = np.asarray(bytearray(content), dtype="uint8")
    cv_image = cv.imdecode(url_image, cv.IMREAD_COLOR)
    color_coverted = cv.cvtColor(cv_image, cv.COLOR_BGR2RGB)
    pil_image = Image.fromarray(color_coverted)
    photo = ImageTk.PhotoImage(image=pil_image)
    return photo

def update_image():
    r = requests.get("http://192.168.4.1:80/capture")
    img = convert_image(r.content)
    canvas.itemconfig(container, image=img)
    canvas.image = img

def update_stream():
    r = requests.get("http://192.168.4.1:81/stream", stream=True)

    with open('img.png', 'wb') as out_file:
        shutil.copyfileobj(r.raw, out_file)

    # canvas.itemconfig(container, image=img)
    # canvas.image = img

def save_image():
    text = name.get()
    print("save", text + ".jpg")
    r = requests.get("http://192.168.4.1:80/capture")
    file = open(text + ".jpg", "wb")
    file.write(r.content)
    file.close()
    img = convert_image(r.content)
    canvas.itemconfig(container, image=img)
    canvas.image = img

save = tk.Button(root, text="Sauvegarde", command=lambda:save_image())
save.grid(column=0, row=2)

name = tk.Entry(root)
name.grid(column=1, row=2)

label = tk.Label(root, text="============================================")
label.grid(column=0, row=3, columnspan=3)


# Add image to the Canvas Items
img2 = ImageTk.PhotoImage(Image.open("capture.jpg"))
container = canvas.create_image(
    0, 0, image=img2)
canvas.image = img2

root.mainloop()

"""
while True:
    r = requests.get("http://192.168.4.1:80/capture")
    # img = convert_image(r.content)
    image = np.asarray(bytearray(r.content), dtype="uint8")
    cv_image = cv.imdecode(image, cv.IMREAD_COLOR)
    cv.imshow("image", cv_image)
"""