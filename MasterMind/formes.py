import time
import datetime
import tkinter as tk
from tkinter import *
from PIL import ImageGrab
import numpy as np
import cv2 as cv
from tensorflow import keras
import pandas as pd
from random import *

import re
import os
import sys
sys.path.append('..')
import fidle.pwk as pwk
from IPython.core.display import display


"""
Insertion d'une entrée dans un DataFrame pandas
"""
def insert(df, row):
    insert_loc = df.index.max()

    if pd.isna(insert_loc):
        df.loc[0] = row
    else:
        df.loc[insert_loc + 1] = row


def rad2deg(alpha):
    return 180 * alpha / np.pi


def deg2rad(alpha):
    return np.pi * alpha / 180


class Figures(object):
    def __init__(self):
        self.top = tk.Tk()
        self.top.overrideredirect(1)  # FRAMELESS CANVAS WINDOW

        self.draw_forms = [self.drawRond, self.drawSquare, self.drawTriangle, self.drawStar5,
                           self.drawStar4, self.drawEclair, self.drawCoeur, self.drawLune,
                           self.drawHexagone, self.drawPentagone, self.drawLogo, self.drawD]
        self.forms = ["Rond", "Square", "Triangle", "Star5",
                      "Star4", "Eclair", "Coeur", "Lune",
                      "Hexagone", "Pentagone", "Logo", "D"]
        self.line_width = 4

    def run(self):
        self.top.mainloop()

    def set_zoom(self, c):
        self.cell = c
        self.cell2 = self.cell / 2
        self.cell4 = self.cell2 / 2
        self.margin = 10


    def set_canvas(self, form_number):
        self.canvas = tk.Canvas(self.top, bg="white",
                                height=3 * (self.cell + self.margin) + self.margin,
                                width=form_number * (self.cell + self.margin) + self.margin)
        self.canvas.pack()


    def drawGrille(self):
        for row in range(11):
            self.canvas.create_line(self.margin, row*self.cell/10 + self.margin,
                                    self.margin + self.cell, row*self.cell/10 + self.margin,
                                    fill="red")
            for col in range(11):
                self.canvas.create_line(col*self.cell/10 + self.margin, self.margin,
                                        col*self.cell/10 + self.margin, self.margin + self.cell,
                                        fill="red")


    def drawPolygone(self, pointes, x, y):
        radius = self.cell2
        pts = []
        for dalpha in range(pointes + 1):
            alpha = dalpha * 2*np.pi/pointes
            r = radius

            px = x + self.cell2 + r * np.cos(alpha - np.pi/2)
            py = y + self.cell2 + r * np.sin(alpha - np.pi/2)

            # console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py)

            pts.append((px, py))

        self.canvas.create_polygon(pts, fill="white", outline="black", width=self.line_width)


    def drawStar(self, pointes, x, y):
        radius = self.cell * 0.15

        pts = []
        small = False
        for dalpha in range(2*pointes + 1):
            alpha = dalpha * np.pi/pointes
            r = 0

            if small:
                r = radius
                small = False
            else:
                r = self.cell2
                small = True

            px = x + self.cell2 + r * np.cos(alpha - np.pi/2)
            py = y + self.cell2 + r * np.sin(alpha - np.pi/2)

            # console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py)

            pts.append((px, py))

        self.canvas.create_polygon(pts, fill="white", outline="black", width=self.line_width)


    def drawRond(self, x, y):
        # print("rond")
        self.canvas.create_oval(x, y, x + self.cell, y + self.cell, fill="white", outline="black", width=self.line_width)


    def drawSquare(self, x, y):
        # print("square")
        self.drawPolygone(4, x, y)


    def drawTriangle(self, x, y):
        # print("triangle")
        self.drawPolygone(3, x, y)


    def drawStar5(self, x, y):
        # print("star5")
        self.drawStar(5, x, y)


    def drawStar4(self, x, y):
        # print("star4")
        self.drawStar(4, x, y)


    def drawHexagone(self, x, y):
        # print("hexagone")
        self.drawPolygone(6, x, y)


    def drawPentagone(self, x, y):
        # print("pentagone")
        self.drawPolygone(5, x, y)


    def drawLogo(self, x, y):
        # print("logo")
        pointes = 4
        radius = self.cell2
        pts = []

        cx = x + self.cell2
        cy = y + self.cell2

        dalpha = np.pi/10
        dr = self.cell * 0.18

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

        self.canvas.create_polygon(pts, fill="white", outline="black", width=self.line_width)


    def drawCoeur(self, x, y):
        # print("coeur")

        radius = self.cell4

        c1x = x + self.cell4
        c1y = y + self.cell4

        start1 = 0
        extent1 = np.pi * 1.23
        p12x = c1x + radius * np.cos(start1 + extent1)
        p12y = c1y - radius * np.sin(start1 + extent1)

        self.canvas.create_arc(c1x - self.cell4, c1y - self.cell4,
                          c1x + self.cell4, c1y + self.cell4,
                          start=rad2deg(start1),
                          extent=rad2deg(extent1), style=ARC, width=self.line_width)

        c2x = x + self.cell2 + self.cell4
        c2y = c1y

        start2 = np.pi - (start1 + extent1)
        extent2 = extent1

        # print(start1, start2, extent1)

        p21x = c2x + radius * np.cos(start2)
        p21y = c2y - radius * np.sin(start2)

        self.canvas.create_arc(c2x - self.cell4, c2y - self.cell4,
                               c2x + self.cell4, c2y + self.cell4,
                               start=rad2deg(start2),
                               extent=rad2deg(extent2), style=ARC, width=self.line_width)

        self.canvas.create_line(p12x, p12y, x + self.cell2, y + self.cell, fill="black", width=self.line_width)
        self.canvas.create_line(x + self.cell2, y + self.cell, p21x, p21y, fill="black", width=self.line_width)


    def drawEclair(self, x, y):
        # print("éclair")

        #self.canvas.create_line(x, y + self.cell*0.2, x + self.cell, y + self.cell*0.8, fill="green")
        #self.canvas.create_line(x, y + self.cell*0.55, x + self.cell, y, fill="green")

        pts = []
        pts.append((x, y + self.cell*0.2))                 # 1
        pts.append((x + self.cell*0.305, y + self.cell*0.38))   # 2
        pts.append((x + self.cell*0.22, y + self.cell*0.43))    # 3
        pts.append((x + self.cell*0.53, y + self.cell*0.63))    # 4
        pts.append((x + self.cell*0.44, y + self.cell*0.69))    # 5

        pts.append((x + self.cell, y + self.cell))              # 6

        pts.append((x + self.cell*0.595, y + self.cell*0.60))    # 7
        pts.append((x + self.cell*0.67, y + self.cell*0.55))   # 8
        pts.append((x + self.cell*0.43, y + self.cell*0.31))     # 9
        pts.append((x + self.cell*0.515, y + self.cell*0.265))    # 10
        pts.append((x + self.cell*0.35, y + self.cell*0.01))     # 11
        pts.append((x, y + self.cell*0.2))                  # 1
        self.canvas.create_polygon(pts, fill="white", outline="black", width=self.line_width)


    def drawLune(self, x, y):
        # print("lune")

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

                # print("intersection= A", x, y1, y2)
            except:
                pass

            return x, y1, y2


        radius1 = self.cell2
        c1x = x + radius1
        c1y = y + radius1

        radius2 = self.cell2 * 0.8
        c2x = c1x + self.cell2*0.6
        c2y = c1y

        x, y1, y2 = intersection(c1x, c1y, radius1, c2x, radius2)

        alpha = np.arccos((x - c1x) / radius1)
        espace1 = rad2deg(alpha)

        coord1 = c1x - radius1, c1y - radius1, c1x + radius1, c1y + radius1
        self.canvas.create_arc(coord1, outline="black",
                               start=espace1, extent=(360. - 2 * espace1), style=ARC,
                               width=self.line_width)

        coord2 = c2x - radius2, c2y - radius2, c2x + radius2, c2y + radius2
        alpha = np.arccos((x - c2x) / radius2)
        espace2 = rad2deg(alpha)
        self.canvas.create_arc(coord2, outline="black",
                               start=espace2, extent=(360. - 2 * espace2), style=ARC,
                               width=self.line_width)


    def drawD(self, x, y):
        # print("d")
        self.canvas.create_line(x + self.cell2, y, x, y, fill="black", width=self.line_width)
        self.canvas.create_line(x, y, x, y + self.cell, fill="black", width=self.line_width)
        self.canvas.create_line(x, y + self.cell, x + self.cell2, y + self.cell, fill="black", width=self.line_width)
        coord = x, y, x + self.cell, y + self.cell
        self.canvas.create_arc(coord, outline="black", start=-90, extent=180, style=ARC, width=self.line_width)


    def drawAll(self, y, form_number=None):
        for x, drawer in enumerate(self.draw_forms):
            if form_number is not None and x >= form_number: break
            # print(self.forms[x], x * self.cell + self.margin, y)
            drawer(self.margin + x * (self.cell + self.margin), y)


    def prepare_source_images(self, zoom, form_number=None):
        if form_number is None: form_number = len(self.forms)

        self.set_zoom(zoom)
        self.set_canvas(form_number)

        self.canvas.delete("all")

        # self.drawGrille()

        y = self.margin
        self.drawAll(y, form_number)

        images = []

        y = self.margin
        for form, drawer in enumerate(self.draw_forms):
            if form >= form_number: break
            self.top.update()
            X = self.margin + form * (self.cell + self.margin)
            Y = y
            img = ImageGrab.grab((X - 1,
                                  Y - 1,
                                  X + self.cell + 2,
                                  Y + self.cell + 2))

            pix = np.array(img.getdata())

            cvimg = pix.reshape((img.size[0], img.size[1], 3)).astype(np.float32)

            """
            black = np.zeros((img.size[0], img.size[1]), np.float32)
            print(cvimg.shape, black.shape)

            for c in range(2):
                black += cvimg[:,:,0]
            black /= 3.0
            # black = black.astype(np.int8)

            bbb = (black < 255.0)*1*black
            """

            # print(cvimg[0:3, 0:3, :])
            os.makedirs("./dataset/{}".format(self.forms[form]), mode=0o750, exist_ok=True)
            filename = "./dataset/{}/RawImages{}.jpg".format(self.forms[form], self.forms[form])
            cv.waitKey()
            cv.imshow(filename, cvimg)
            cv.waitKey()
            cv.imwrite(filename, cvimg)
            # cv.imwrite("BlackImages{}.jpg".format(self.forms[form]), black)

            data = np.zeros([img.size[0], img.size[1]])
            for i in range(3):
                data[:, :] += cvimg[:, :, i]

            data /= 3.0

            images.append(data)

        return images


def change_perpective(image):
    def f(x, y, width, height):
        sigma = 1.3
        xx = x + gauss(mu=float(0), sigma=sigma)
        if xx < 0: xx = 0
        if xx >= width: xx = width - 1
        yy = y + gauss(mu=float(0), sigma=sigma)
        if yy < 0: yy = 0
        if yy >= height: yy = height - 1
        # print(x, y, xx, yy)
        return xx, yy

    def setmin(v, vmin):
        if vmin is None or v < vmin: return v
        return vmin

    def setmax(v, vmax):
        if vmax is None or v > vmax: return v
        return vmax

    # on va étendre l'image pour accepter la déformation causée par la transformation
    extend = 1
    full_extend = extend*2 + 1

    # on installe l'image à transformer au centre de l'image étendue
    width, height = image.shape
    img = np.ones((full_extend * height, full_extend * width, 3)) * 255.
    for c in range(3):
        img[extend*width:(extend+1)*width, extend*height:(extend+1)*height, c] = image[:, :]


    # pour construire la matrice de transformation, on dessine 4 points qui sont les 4 coins d'un carré autour de la figure
    offset = 10
    pts1 = np.array([[-offset, -offset],
                     [width+offset, -offset],
                     [-offset, height+offset],
                     [width+offset, height+offset]], np.float32)

    R = (0, 0, 255)
    G = (0, 255, 0)
    B = (255, 0, 0)
    M = (255, 0, 255)
    colors = [R, G, B, M]
    for x in range(0, 4):
        cv.circle(img, (extend * width + int(pts1[x][0]), extend * height + int(pts1[x][1])), 3, colors[x], cv.FILLED)

    # cv.imshow("original image", img)

    # pour définir la transformation, on déplace aléatoirement ces 4 points autour de leur position initiale
    pts2 = np.zeros_like(pts1)

    for x in range(0, 4):
        pts2[x][0], pts2[x][1] = f(pts1[x][0], pts1[x][1], width=full_extend*width, height=full_extend*height)

    # application de la transformation de perspective. On garde la taille de l'image transformée identique
    matrix = cv.getPerspectiveTransform(pts1, pts2)
    width = full_extend*width
    height = full_extend*height
    img2 = cv.warpPerspective(img, matrix, (width, height))

    # lors de la transformation, l'image fait aparaître des zones noires correspondant aux limites de l'image d'origine
    # Pour éliminer ces zones noires, on repère les 4 points de référence (qui sont colorés) dans l'image transformée
    # comme on sait que le carré de référence entoure exactement la figure , on peut découper la zone de référence
    # et la déplacer dans une nouvelle image complètement blanche
    xmin = None
    xmax = None
    ymin = None
    ymax = None
    for x in range(width):
        for y in range(height):
            r = img2[y, x, 0]
            g = img2[y, x, 1]
            b = img2[y, x, 2]
            t = False
            if (r == 0 and g == 0 and b == 255):
                t = True
                # print("R", x, y, r, g, b)
            elif (r == 0 and g == 255 and b == 0):
                t = True
                # print("G", x, y, r, g, b)
            elif (r == 255 and g == 0 and b == 0):
                t = True
                # print("B", x, y, r, g, b)
            elif (r == 255 and g == 0 and b == 255):
                t = True
                # print("M", x, y, r, g, b)
            if t:
                # on efface les points de référence
                img2[y, x, 0] = 255
                img2[y, x, 1] = 255
                img2[y, x, 2] = 255
                # on met à jour les limites de la zone de référence
                xmin = setmin(x, xmin)
                xmax = setmax(x, xmax)
                ymin = setmin(y, ymin)
                ymax = setmax(y, ymax)

    # print(height, width, img2.shape, ymin, ymax, xmin, xmax)
    # nouvelle image
    img_finale = np.ones((height, width, 3)) * 255.
    # insertion de la zone de référence transformée qui contient la figure
    img_finale[ymin:ymax, xmin:xmax, :] = img2[ymin:ymax, xmin:xmax, :]

    # img_finale = np.zeros((60, 60, 3))
    # img_finale[:, :, :] = img2[20:80, 20:80, :]

    return img_finale


def change_rotation(image):
    height, width = image.shape[:2]
    center = (width/2, height/2)

    # print("change_rotation> ", height, width, center)

    rotate_matrix = cv.getRotationMatrix2D(center=center, angle=randrange(360), scale=1.)
    img_finale = cv.warpAffine(src=image, M=rotate_matrix, dsize=(width, height))

    return img_finale


def build_data(data_size, images):
    # on sauvegarde les data non normlisées

    def f(x):
        sigma = 5
        x = gauss(mu=float(x), sigma=sigma)
        if x < 0: x = 0.
        if x > 255: x = 255.
        return x

    vf = np.vectorize(f)

    shape = images[0].shape
    image_size = len(images)
    frac = 0.85
    first = True
    k = 0
    for i in range(data_size):
        for n, raw_img in enumerate(images):
            if k % 1000 == 0: print("generate data k = ", k)
            k += 1

            # print(raw_img.shape)

            data1 = change_rotation(raw_img)
            data2 = change_perpective(data1)

            """
            data2 = np.ones_like(data2) * 255.
            data2[:, :, 0] = vf(data1[:, :, 0])
            data2[:, :, 1] = vf(data1[:, :, 1])
            data2[:, :, 2] = vf(data1[:, :, 2])
            """

            """
            # visualisation de l'image finale
            cv.imshow("output image", data2)
            cv.waitKey(0)
            """

            # transformation de l'image finale en une matrice de points N&B
            data = np.zeros([data2.shape[0], data2.shape[1]])
            for j in range(3):
                data[:, :] += data2[:, :, j]

            data /= 3

            if first:
                shape = data.shape
                x_data = np.zeros([data_size * image_size, shape[0], shape[1], 1])
                y_data = np.zeros([data_size * image_size])
                first = False

            p = i*image_size + n
            x_data[p, :, :, 0] = data[:, :]
            y_data[p] = n

            # print("build_data> p={} x_data={}".format(p, x_data[p, :, :, 0]))
            # print("build_data> p={} y_data={}".format(p, y_data[p]))


    # x_data = x_data.reshape(-1, shape[0], shape[1], 1)

    index = int(frac*data_size*image_size)

    print("build_data> x_data.shape=", x_data.shape, "index=", index)

    # print("----------------------------------------------------------------------------------------------")
    # print("build_data> x_data={}".format(x_data[:, :, :, :]))
    # print("build_data> y_data={}".format(y_data[:]))
    # print("----------------------------------------------------------------------------------------------")

    x_train = x_data[:index, :, :, :]
    y_train = y_data[:index]
    x_test = x_data[index:, :, :, :]
    y_test = y_data[index:]
    print("build_data> x_train : ", x_train.shape)
    print("build_data> y_train : ", y_train.shape)
    print("build_data> x_test : ", x_test.shape)
    print("build_data> y_test : ", y_test.shape)

    np.save("./data/x_train.npy", x_train, allow_pickle=True)
    np.save("./data/y_train.npy", y_train, allow_pickle=True)
    np.save("./data/x_test.npy", x_test, allow_pickle=True)
    np.save("./data/y_test.npy", y_test, allow_pickle=True)

    return x_train, y_train, x_test, y_test

"""
relecture de mean/std par rapport à un modèle déjà entraîné
"""
def get_mean_std():
    with open("./run/models/mean_std.txt", "r") as f:
        lines = f.readlines()

    m = re.match("(\d+.\d+)", lines[0])
    mean = float(m.group(1))
    m = re.match("(\d+.\d+)", lines[1])
    std = float(m.group(1))

    return mean, std

"""
relecture de mean/std par rapport à un modèle déjà entraîné
"""
def get_xmax():
    with open("./run/models/xmax.txt", "r") as f:
        lines = f.readlines()

    m = re.match("(\d+.\d+)", lines[0])
    xmax = float(m.group(1))

    return xmax

def load_data():
    x_train = np.load("./data/x_train.npy", allow_pickle=True)
    y_train = np.load("./data/y_train.npy", allow_pickle=True)
    x_test = np.load("./data/x_test.npy", allow_pickle=True)
    y_test = np.load("./data/y_test.npy", allow_pickle=True)

    return x_train, y_train, x_test, y_test


def build_model_v1(shape, form_number):
    model = keras.models.Sequential()

    model.add(keras.layers.Input((shape[1], shape[2], 1)))

    model.add(keras.layers.Conv2D(8, (3, 3), activation='relu'))
    model.add(keras.layers.MaxPooling2D((2, 2)))
    model.add(keras.layers.Dropout(0.2))

    model.add(keras.layers.Conv2D(16, (3, 3), activation='relu'))
    model.add(keras.layers.MaxPooling2D((2, 2)))
    model.add(keras.layers.Dropout(0.2))

    model.add(keras.layers.Flatten())
    model.add(keras.layers.Dense(100, activation='relu'))
    model.add(keras.layers.Dropout(0.5))

    model.add(keras.layers.Dense(form_number, activation='softmax'))

    model.summary()

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  # loss='mse',
                  metrics=['accuracy'])

    return model


def build_model_v2(shape):
    print("build_model_v2> shape=", shape)

    shape = (shape[1], shape[2])

    model = keras.models.Sequential()
    model.add(keras.layers.Input(shape, name="InputLayer"))
    model.add(keras.layers.Dense(50, activation="relu", name="Dense_n1"))
    model.add(keras.layers.Dense(50, activation="relu", name="Dense_n2"))
    model.add(keras.layers.Dense(50, activation="relu", name="Dense_n3"))
    model.add(keras.layers.Dense(1, name="Output"))

    model.compile(optimizer="rmsprop",
                  loss="mse",
                  metrics=["mae", "mse"])

    return model


def run(figures, form_number, zoom, data_size, version, rebuild_data, rebuild_model):
    figures.set_zoom(zoom)

    os.makedirs("./data", mode=0o750, exist_ok=True)

    if rebuild_data:
        rebuild_model = True

        images = figures.prepare_source_images(zoom, form_number)

        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Generating data from images")
        x_train, y_train, x_test, y_test = build_data(data_size, images)
    else:
        x_train, y_train, x_test, y_test = load_data()

    print("run> x_train : ", x_train.shape)
    print("run> y_train : ", y_train.shape)
    print("run> x_test : ", x_test.shape)
    print("run> y_test : ", y_test.shape)
    print("run> x_train : ", y_train[10:20, ])

    print('Before normalization : Min={}, max={}'.format(x_train.min(), x_train.max()))

    xmax = x_train.max()

    x_train = x_train / xmax
    x_test = x_test / xmax

    print('After normalization  : Min={}, max={}'.format(x_train.min(), x_train.max()))

    os.makedirs("./run/models", mode=0o750, exist_ok=True)
    save_dir = "./run/models/best_model.h5"

    if rebuild_model:
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Build model")

        if version == "v1":
            model = build_model_v1(x_train.shape, form_number)
        else:
            model = build_model_v2(x_train.shape)

        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Start training")
        batch_size  = 512
        epochs      =  16

        savemodel_callback = keras.callbacks.ModelCheckpoint(filepath=save_dir, verbose=0, save_best_only=True)

        fit_verbosity = 1
        history = model.fit(x_train, y_train,
                            batch_size      = batch_size,
                            epochs          = epochs,
                            verbose         = fit_verbosity,
                            validation_data = (x_test, y_test),
                            callbacks = [savemodel_callback])

        pwk.plot_history(history, figsize=(form_number, 4), save_as='03-history')

    else:
        model = keras.models.load_model(save_dir)

    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Evaluate model")
    score = model.evaluate(x_test, y_test, verbose=0)

    if version == "v1":
        print(f'Test loss     : {score[0]:4.4f}')
        print(f'Test accuracy : {score[1]:4.4f}')
    else:
        print("x_test / loss  : {:5.4f}".format(score[0]))
        print("x_test / mae   : {:5.4f}".format(score[1]))
        print("x_test / mse   : {:5.4f}".format(score[2]))

        print("min(val_mae)   : {:.4f}".format(min(history.history["val_mae"])))

    return model, x_train, y_train, x_test, y_test


# ===================================================================================================================

figures = Figures()

# ============ generlal parameters=================
os.makedirs("./data", mode=0o750, exist_ok=True)

images = figures.prepare_source_images(zoom=40, form_number=8)

exit()

version = "v1"
# version = "v2"

model, x_train, y_train, x_test, y_test = run(figures,
                                              form_number = 8,
                                              zoom = 20,
                                              data_size = 7500,
                                              version=version,
                                              rebuild_data = True,
                                              rebuild_model = False)

# figures.run()

# pwk.plot_images(x_train, y_train, [27], x_size=5, y_size=5, colorbar=True, save_as='01-one-digit')
pwk.plot_images(x_train, y_train, range(0,64), columns=8, save_as='02-many-digits')

print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Predictions")

test_number = 10
x_test = x_test[0:test_number+1, :, :, :]
y_test = y_test[0:test_number+1]

now = datetime.datetime.now()
y_sigmoid = model.predict(x_test, verbose=2)
y_pred    = np.argmax(y_sigmoid, axis=-1)
t = datetime.datetime.now() - now

print("durée=", t)

# print(y_pred)

# pwk.plot_images(x_test, y_test, range(0,200), columns=8, x_size=1, y_size=1, y_pred=y_pred, save_as='04-predictions')

print("len(x_test)=", len(x_test))
errors=[i for i in range(len(x_test)) if y_pred[i] != y_test[i] ]
errors=errors[:min(24,len(errors))]
# pwk.plot_images(x_test, y_test, errors[:15], columns=8, x_size=2, y_size=2, y_pred=y_pred, save_as='05-some-errors')

pwk.plot_confusion_matrix(y_test, y_pred, range(8), normalize=True, save_as='06-confusion-matrix')
pwk.end()

exit()

