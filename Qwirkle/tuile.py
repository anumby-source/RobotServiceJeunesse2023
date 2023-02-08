import tkinter as tk
from PIL import ImageGrab
import numpy as np

cell = 20
cell2 = cell/2
margin = 10
d = cell * 0.1

def drawRond(canvas, color, x, y):
    print("rond")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")
    canvas.create_oval(x + d, y + d, x + cell - d, y + cell - d, fill=color)


def drawSquare(canvas, color, x, y):
    print("square")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")
    canvas.create_rectangle(x + d, y + d, x + cell - d, y + cell - d, fill=color)

def drawLosange(canvas, color, x, y):
    print("losange")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")

    pts = [(x + d, y + cell2),         # 1
           (x + cell2, y + d),         # 2
           (x + cell - d, y + cell2),  # 3
           (x + cell2, y + cell - d),  # 4
           (x + d, y + cell2)]
    canvas.create_polygon(pts, fill=color)


def drawCross(canvas, color, x, y):
    print("cross")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")

    radius = cell2 * 0.3
    pts = [(x + d, y + d),                       # 1
           (x + cell2, y + cell2 - radius),      # 2
           (x + cell - d, y + d),                # 3
           (x + cell2 + radius, y + cell2),      # 4
           (x + cell - d, y + cell - d),         # 5
           (x + cell2, y + cell2 + radius),      # 6
           (x + d, y + cell - d),                # 7
           (x + cell2 - radius, y + cell2),      # 8
           (x + d, y + d)]                       # 1
    canvas.create_polygon(pts, fill=color)


def drawTrefle(canvas, color, x, y):
    print("trefle")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")

    core = cell2 * 0.3
    canvas.create_rectangle(x + cell2 - core, y + cell2 - core, x + cell2 + core, y + cell2 + core, fill=color, outline=color)

    leaf_center = cell2 * 0.50
    leaf_size = cell2 * 0.32

    for side in range(4):
       alpha = side * np.pi/2
       cx = x + cell2 + leaf_center * np.cos(alpha)
       cy = y + cell2 + leaf_center * np.sin(alpha)
       # console.log(alpha, leaf * Math.cos(alpha), leaf * Math.sin(alpha))
       canvas.create_oval(cx - leaf_size, cy - leaf_size, cx + leaf_size, cy + leaf_size, fill=color, outline=color)


def drawStar(canvas, color, x, y):
    print("star")
    canvas.create_rectangle(x, y, x + cell, y + cell, fill="black")

    radius = cell*0.15
    a = (cell2 - margin)/np.sqrt(2.)

    pts = []
    small = False
    for dalpha in range(17):
      alpha = dalpha * np.pi/8
      r = 0

      if small:
        r = radius
        small = False
      else:
        r = cell2 - d
        small = True

      px = x + cell2 + r * np.cos(alpha)
      py = y + cell2 + r * np.sin(alpha)

      # console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py)

      pts.append((px, py))

    canvas.create_polygon(pts, fill=color)


top = tk.Tk()
top.overrideredirect(1) # FRAMELESS CANVAS WINDOW

canvas = tk.Canvas(top, bg="white", height=6*(cell+margin) + margin, width=6*(cell+margin) + margin)

purecolors = ["red", "blue", "green", "cyan", "magenta", "yellow"]
colors = ["red", "dodger blue", "green3", "cyan", "magenta", "yellow"]
draw_forms = [drawRond, drawSquare, drawLosange, drawCross, drawTrefle, drawStar]
forms = ["Rond", "Square", "Losange", "Cross", "Trefle", "Star"]

for x, color in enumerate(colors):
    for y, drawer in enumerate(draw_forms):

        print(color, x * cell + margin, y * cell + margin)
        drawer(canvas, color, margin + x * (cell + margin), margin + y * (cell + margin))

canvas.pack()

for x, color in enumerate(colors):
    for y, drawer in enumerate(draw_forms):
        top.update()
        X = margin + x * (cell + margin)
        Y = margin + y * (cell + margin)
        ImageGrab.grab((X,
                        Y,
                        X + cell,
                        Y + cell)).save('tuiles/image_{}_{}.jpg'.format(forms[y], purecolors[x]))
top.mainloop()

