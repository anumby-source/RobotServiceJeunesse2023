import requests

# Import the required Libraries
from tkinter import *
from PIL import Image, ImageTk

# Create an instance of tkinter frame
root = Tk()

# Set the geometry of tkinter frame
root.geometry("800x600")
root.title("Capture")
root.resizable(0, 0)

button = Button(root, text="Update", command=lambda:update_image())
button.grid(column=0, row=0, columnspan=3)


# Create a canvas widget
canvas= Canvas(root, width=400, height=296)
canvas.grid(column=0, row=1, columnspan=3)

def update_image():
    r = requests.get("http://192.168.4.1:80/capture")
    file = open("capture.jpg", "wb")
    file.write(r.content)
    file.close()
    img = ImageTk.PhotoImage(Image.open("capture.jpg"))
    canvas.itemconfig(container, image=img)
    canvas.image = img

def save_image():
    text = name.get()
    print("save", text + ".jpg")
    r = requests.get("http://192.168.4.1:80/capture")
    file = open(text + ".jpg", "wb")
    file.write(r.content)
    file.close()
    img = ImageTk.PhotoImage(Image.open(text + ".jpg"))
    canvas.itemconfig(container, image=img)
    canvas.image = img

save = Button(root, text="Sauvegarde", command=lambda:save_image())
save.grid(column=0, row=2)

name = Entry(root)
name.grid(column=1, row=2)

label = Label(root, text="============================================")
label.grid(column=0, row=3, columnspan=3)


# Add image to the Canvas Items
img2 = ImageTk.PhotoImage(Image.open("capture.jpg"))
container = canvas.create_image(100, 100, image=img2)
canvas.image = img2

root.mainloop()
