import tkinter as tk
from tkinter import *
from PIL import ImageGrab
import numpy as np

def set_zoom(c):
    global cell, cell2, cell4
    global margin, d

    cell = c
    cell2 = cell / 2
    cell4 = cell2 / 2
    margin = 10
    d = cell * 0.1

set_zoom(50)

def rad2deg(alpha):
    return 180*alpha/np.pi

def deg2rad(alpha):
    return np.pi*alpha/180

def drawGrille(canvas):
    for row in range(11):
        canvas.create_line(margin, row*cell/10 + margin,
                           margin + cell, row*cell/10 + margin,
                           fill="red")
        for col in range(11):
            canvas.create_line(col*cell/10 + margin, margin,
                               col*cell/10 + margin, margin + cell,
                               fill="red")


def drawPolygone(canvas, pointes, x, y):
    radius = cell2
    pts = []
    for dalpha in range(pointes + 1):
      alpha = dalpha * 2*np.pi/pointes
      r = radius

      px = x + cell2 + r * np.cos(alpha - np.pi/2)
      py = y + cell2 + r * np.sin(alpha - np.pi/2)

      # console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py)

      pts.append((px, py))
    canvas.create_polygon(pts, fill="white", outline="black")


def drawStar(canvas, pointes, x, y):
    radius = cell*0.15

    pts = []
    small = False
    for dalpha in range(2*pointes + 1):
      alpha = dalpha * np.pi/pointes
      r = 0

      if small:
        r = radius
        small = False
      else:
        r = cell2
        small = True

      px = x + cell2 + r * np.cos(alpha - np.pi/2)
      py = y + cell2 + r * np.sin(alpha - np.pi/2)

      # console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py)

      pts.append((px, py))

    canvas.create_polygon(pts, fill="white", outline="black")


def drawRond(canvas, x, y):
    print("rond")
    canvas.create_oval(x, y, x + cell, y + cell, fill="white", outline="black")
    print("rond")


def drawSquare(canvas, x, y):
    print("square")
    drawPolygone(canvas, 4, x, y)

def drawTriangle(canvas, x, y):
    print("triangle")
    drawPolygone(canvas, 3, x, y)

def drawStar5(canvas, x, y):
    print("star5")
    drawStar(canvas, 5, x, y)

def drawStar4(canvas, x, y):
    print("star4")
    drawStar(canvas, 4, x, y)

def drawHexagone(canvas, x, y):
    print("hexagone")
    drawPolygone(canvas, 6, x, y)

def drawPentagone(canvas, x, y):
    print("pentagone")
    drawPolygone(canvas, 5, x, y)

def drawLogo(canvas, x, y):
    print("logo")
    pointes = 4
    radius = cell2
    pts = []

    cx = x + cell2
    cy = y + cell2

    dalpha = np.pi/10
    dr = cell * 0.18

    for nalpha in range(pointes):
      alpha = nalpha * 2*np.pi/pointes + np.pi/4
      r = radius

      px = cx + r * np.cos(alpha - dalpha)
      py = cy + r * np.sin(alpha - dalpha)
      pts.append((px, py))

      px = cx + (r - dr) * np.cos(alpha)
      py = cy + (r - dr) * np.sin(alpha)
      pts.append((px, py))

      px = cx + r * np.cos(alpha + dalpha)
      py = cy + r * np.sin(alpha + dalpha)
      pts.append((px, py))

    canvas.create_polygon(pts, fill="white", outline="black")



def drawCoeur(canvas, x, y):
    print("coeur")

    radius = cell4

    c1x = x + cell4
    c1y = y + cell4

    start1 = 0
    extent1 = np.pi * 1.23
    p12x = c1x + radius * np.cos(start1 + extent1)
    p12y = c1y - radius * np.sin(start1 + extent1)

    canvas.create_arc(c1x - cell4, c1y - cell4,
                      c1x + cell4, c1y + cell4,
                      start=rad2deg(start1),
                      extent=rad2deg(extent1), style=ARC)

    c2x = x + cell2 + cell4
    c2y = c1y

    start2 = np.pi - (start1 + extent1)
    extent2 = extent1

    print(start1, start2, extent1)

    p21x = c2x + radius * np.cos(start2)
    p21y = c2y - radius * np.sin(start2)

    canvas.create_arc(c2x - cell4, c2y - cell4,
                      c2x + cell4, c2y + cell4,
                      start=rad2deg(start2),
                      extent=rad2deg(extent2), style=ARC)

    canvas.create_line(p12x, p12y, x + cell2, y + cell, fill="black")
    canvas.create_line(x + cell2, y + cell, p21x, p21y, fill="black")


def drawEclair(canvas, x, y):
    print("éclair")

    #canvas.create_line(x, y + cell*0.2, x + cell, y + cell*0.8, fill="green")
    #canvas.create_line(x, y + cell*0.55, x + cell, y, fill="green")

    pts = []
    pts.append((x, y + cell*0.2))                 # 1
    pts.append((x + cell*0.305, y + cell*0.38))   # 2
    pts.append((x + cell*0.22, y + cell*0.43))    # 3
    pts.append((x + cell*0.53, y + cell*0.63))    # 4
    pts.append((x + cell*0.44, y + cell*0.69))    # 5

    pts.append((x + cell, y + cell))              # 6

    pts.append((x + cell*0.595, y + cell*0.60))    # 7
    pts.append((x + cell*0.67, y + cell*0.55))   # 8
    pts.append((x + cell*0.43, y + cell*0.31))     # 9
    pts.append((x + cell*0.515, y + cell*0.265))    # 10
    pts.append((x + cell*0.35, y + cell*0.01))     # 11
    pts.append((x, y + cell*0.2))                  # 1
    canvas.create_polygon(pts, fill="white", outline="black")


def drawLune(canvas, x, y):
    print("lune")

    first = True

    def intersection(x1, y1, r1, x0, r0):
        """
        y0 = y1
        C1 => r0^2 = (x0 - x)^2 + (y0 - y)^2
        C2 => r1^2 = (x1 - x)^2 + (y0 - y)^2

        r0^2 = x0^2 + x^2 - 2*x0*x + y0^2 + y^2 - 2*y0*y
        r1^2 = x1^2 + x^2 - 2*x1*x + y0^2 + y^2 - 2*y0*y

        r1^2 - r0^2 = x1^2 + x^2 - 2*x1*x + y0^2 + y^2 - 2*y0*y - (x0^2 + x^2 - 2*x0*x + y0^2 + y^2 - 2*y0*y)
        r1^2 - r0^2 = x1^2 + x^2 - 2*x1*x + y0^2 + y^2 - 2*y0*y - x0^2 - x^2 + 2*x0*x - y0^2 - y^2 + 2*y0*y
        r1^2 - r0^2 = (x1^2 - x0^2) - 2*x1*x + 2*x0*x + x^2 + (y0^2 - y0^2) - 2*y0*y + 2*y0*y + y^2 - x^2 - y^2
        r1^2 - r0^2 = (x1^2 - x0^2) - 2*x1*x + 2*x0*x + x^2 + y^2 - x^2 - y^2
        r1^2 - r0^2 - (x1^2 - x0^2) - 2*x*(x1 - x0) = 0

        x = (r1^2 - r0^2 - x1^2 + x0^2) / 2*(x1 - x0)

        C1 => r1^2 = (x1 - x)^2 + (y1 - y)^2
        0 = (x1 - x)^2 + (y1 - y)^2 - r1^2
        0 = x1^2 + x^2 + 2*x1*x + y1^2 + y^2 - 2*y1*y - r1^2
        0 = y^2 - 2*y1*y + (x1^2 + x^2 - 2*x1*x + y1^2 - r1^2)
        """
        y0 = y1
        x = (r1*r1 - r0*r0 - x1*x1 + x0*x0) / (2*(x0 - x1))
        A = 1
        B = -2*y1
        C = x1*x1 + x*x - 2*x1*x + y1*y1 - r1*r1
        D = B*B - 4*A*C

        # print("r1, r0, x1, x0=", r1, r0, x1, x0, "r1^2, r0^2, x1^2, x0^2=", r1*r1, r0*r0, x1*x1, x0*x0, "n=", (r1*r1 - r0*r0 - x1*x1 + x0*x0), "d=", 2*(x0 - x1), "x=", x)
        # print("intersection= x1, y1, r1, x0, r0, x = ", x1, y1, r1, x0, r0, x, " A=", A, "B=", B, "C=", C, "D=", D)

        y1, y2 = 0, 0
        try:
            f = lambda e: (-B + e * np.sqrt(D))/2*A
            y1 = f(1)
            y2 = f(-1)

            print("intersection= A", x, y1, y2)
        except:
            pass

        return x, y1, y2


    radius1 = cell2
    c1x = x + radius1
    c1y = y + radius1

    radius2 = cell2 * 0.8
    c2x = c1x + cell2*0.6
    c2y = c1y

    x, y1, y2 = intersection(c1x, c1y, radius1, c2x, radius2)

    alpha = np.arccos((x - c1x) / radius1)
    espace1 = rad2deg(alpha)

    coord1 = c1x - radius1, c1y - radius1, c1x + radius1, c1y + radius1
    canvas.create_arc(coord1, outline="black", start=espace1, extent=(360. - 2 * espace1), style=ARC)

    coord2 = c2x - radius2, c2y - radius2, c2x + radius2, c2y + radius2
    alpha = np.arccos((x - c2x) / radius2)
    espace2 = rad2deg(alpha)
    canvas.create_arc(coord2, outline="black", start=espace2, extent=(360. - 2 * espace2), style=ARC)


def drawD(canvas, x, y):
    print("d")
    canvas.create_line(x + cell2, y, x, y, fill="black")
    canvas.create_line(x, y, x, y + cell, fill="black")
    canvas.create_line(x, y + cell, x + cell2, y + cell, fill="black")
    coord = x, y, x + cell, y + cell
    canvas.create_arc(coord, outline="black", start=-90, extent=180, style=ARC)


def drawAll(canvas, y):
    for x, drawer in enumerate(draw_forms):
        print(forms[x], x * cell + margin, y)
        drawer(canvas, margin + x * (cell + margin), y)


top = tk.Tk()
top.overrideredirect(1) # FRAMELESS CANVAS WINDOW

draw_forms = [drawRond, drawSquare, drawTriangle, drawStar5,
              drawStar4, drawHexagone, drawLogo, drawPentagone,
              drawCoeur, drawEclair, drawLune, drawD]
forms = ["Rond", "Square", "Triangle", "Star5",
         "Star4", "Hexagone", "Logo", "Pentagone",
         "Coeur", "Eclair", "Lune", "D"]

canvas = tk.Canvas(top, bg="white",
                   height=3*(cell + margin) + margin,
                   width=len(forms) * (cell + margin) + margin)

# drawGrille(canvas)

y = margin
set_zoom(50)
drawAll(canvas, y)

y += cell + margin
set_zoom(20)
drawAll(canvas, y)

y += cell + margin
set_zoom(10)
drawAll(canvas, y)

canvas.pack()

canvas.delete("all")

y = margin
set_zoom(20)
drawAll(canvas, y)

y = margin
for x, drawer in enumerate(draw_forms):
    top.update()
    X = margin + x * (cell + margin)
    Y = y
    ImageGrab.grab((X - 1,
                    Y - 1,
                    X + cell + 2,
                    Y + cell + 2)).save('formes/image_{}.jpg'.format(forms[x]))

top.mainloop()
