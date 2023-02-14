import tkinter as tk
from tkinter import *
from PIL import ImageGrab
import numpy as np
import cv2 as cv
from tensorflow import keras
import pandas as pd
from random import *

import os
import sys
sys.path.append('..')
import fidle.pwk as pwk


"""
Insertion d'une entrée dans un DataFrame pandas
"""
def insert(df, row):
    insert_loc = df.index.max()

    if pd.isna(insert_loc):
        df.loc[0] = row
    else:
        df.loc[insert_loc + 1] = row


def set_zoom(c):
    global cell, cell2, cell4
    global margin, d

    cell = c
    cell2 = cell / 2
    cell4 = cell2 / 2
    margin = 10
    d = cell * 0.1


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
    canvas.create_polygon(pts, fill="white", outline="black", width=3)


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

    canvas.create_polygon(pts, fill="white", outline="black", width=3)


def drawRond(canvas, x, y):
    print("rond")
    canvas.create_oval(x, y, x + cell, y + cell, fill="white", outline="black", width=3)
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

    canvas.create_polygon(pts, fill="white", outline="black", width=3)


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
                      extent=rad2deg(extent1), style=ARC, width=3)

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
                      extent=rad2deg(extent2), style=ARC, width=3)

    canvas.create_line(p12x, p12y, x + cell2, y + cell, fill="black", width=3)
    canvas.create_line(x + cell2, y + cell, p21x, p21y, fill="black", width=3)


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
    canvas.create_polygon(pts, fill="white", outline="black", width=3)


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
    canvas.create_arc(coord1, outline="black", start=espace1, extent=(360. - 2 * espace1), style=ARC, width=3)

    coord2 = c2x - radius2, c2y - radius2, c2x + radius2, c2y + radius2
    alpha = np.arccos((x - c2x) / radius2)
    espace2 = rad2deg(alpha)
    canvas.create_arc(coord2, outline="black", start=espace2, extent=(360. - 2 * espace2), style=ARC, width=3)


def drawD(canvas, x, y):
    print("d")
    canvas.create_line(x + cell2, y, x, y, fill="black", width=3)
    canvas.create_line(x, y, x, y + cell, fill="black", width=3)
    canvas.create_line(x, y + cell, x + cell2, y + cell, fill="black", width=3)
    coord = x, y, x + cell, y + cell
    canvas.create_arc(coord, outline="black", start=-90, extent=180, style=ARC, width=3)


def drawAll(canvas, y):
    for x, drawer in enumerate(draw_forms):
        print(forms[x], x * cell + margin, y)
        drawer(canvas, margin + x * (cell + margin), y)


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


def build_data(data_size, images):
    def f(x):
        sigma = 5
        x = gauss(mu=float(x), sigma=sigma)
        if x < 0: x = 0.
        if x > 255: x = 255.
        return x

    vf = np.vectorize(f)

    shape = images[0].shape
    image_size = len(images)
    frac = 0.8
    first = True
    k = 0
    for i in range(data_size):
        for n, raw_img in enumerate(images):
            if k % 1000 == 0: print("generate data k = ", k)
            k += 1

            # print(raw_img.shape)

            data1 = change_perpective(raw_img)

            data2 = np.ones_like(data1) * 255.
            data2[:, :, 0] = vf(data1[:, :, 0])
            data2[:, :, 1] = vf(data1[:, :, 1])
            data2[:, :, 2] = vf(data1[:, :, 2])

            """
            # visualisation de l'image finale
            cv.imshow("output image", data2)
            cv.waitKey(0)
            """

            # transformation de l'image finale en une matrice de points N&B
            data = np.zeros([data2.shape[0], data2.shape[1]])
            for i in range(3):
                data[:, :] += data2[:, :, i]

            data /= 3

            if first:
                shape = data.shape
                x_data = np.zeros([data_size * image_size, shape[0], shape[1]])
                y_data = np.zeros([data_size * image_size])
                first = False

            x_data[i*image_size + n, :, :] = data
            y_data[i*image_size + n] = n

    x_data = x_data.reshape(-1, shape[0], shape[1], 1)

    index = int(frac*data_size*image_size)

    x_train = x_data[:index, :, :, :]
    y_train = y_data[:index]
    x_test = x_data[index:, :, :, :]
    y_test = y_data[index:]
    print("x_train : ", x_train.shape)
    print("y_train : ", y_train.shape)
    print("x_test : ", x_test.shape)
    print("y_test : ", y_test.shape)

    np.save("./data/x_train.npy", x_train, allow_pickle=True)
    np.save("./data/y_train.npy", y_train, allow_pickle=True)
    np.save("./data/x_test.npy", x_train, allow_pickle=True)
    np.save("./data/y_test.npy", y_train, allow_pickle=True)

    return x_train, y_train, x_test, y_test

def load_data():
    x_train = np.load("./data/x_train.npy", allow_pickle=True)
    y_train = np.load("./data/y_train.npy", allow_pickle=True)
    x_test = np.load("./data/x_test.npy", allow_pickle=True)
    y_test = np.load("./data/y_test.npy", allow_pickle=True)

    return x_train, y_train, x_test, y_test


def prepare_source_images(canvas):
    canvas.delete("all")

    y = margin
    set_zoom(30)
    drawAll(canvas, y)

    canvas.pack()

    images = []

    y = margin
    for form, drawer in enumerate(draw_forms):
        top.update()
        X = margin + form * (cell + margin)
        Y = y
        img = ImageGrab.grab((X - 1,
                              Y - 1,
                              X + cell + 2,
                              Y + cell + 2))

        pix = np.array(img.getdata())

        cvimg = pix.reshape(img.size[0], img.size[1], 3)

        data = np.zeros([img.size[0], img.size[1]])
        for i in range(3):
            data[:, :] += cvimg[:, :, i]

        data /= 3

        images.append(data)

    return images


def build_model(shape, forms):
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

    model.add(keras.layers.Dense(len(forms), activation='softmax'))

    model.summary()

    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    return model


# =================================================================================

set_zoom(50)

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
canvas.pack()

# drawGrille(canvas)

y = margin
drawAll(canvas, y)

images = prepare_source_images(canvas)

os.makedirs("./data", mode=0o750, exist_ok=True)

use_data = True

if not use_data:
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Generating data from images")
    x_train, y_train, x_test, y_test = build_data(1000, images)
else:
    x_train, y_train, x_test, y_test = load_data()

print(type(x_train), x_train.shape)
print('Before normalization : Min={}, max={}'.format(x_train.min(),x_train.max()))

xmax = x_train.max()
x_train = x_train / xmax
x_test  = x_test  / xmax

print('After normalization  : Min={}, max={}'.format(x_train.min(),x_train.max()))

use_model = True

os.makedirs("./run/models", mode=0o750, exist_ok=True)
save_dir = "./run/models/best_model.h5"

if not use_model:
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Build model")
    model = build_model(x_train.shape, draw_forms)

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

    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Evaluate model")

    score = model.evaluate(x_test, y_test, verbose=0)

    print(f'Test loss     : {score[0]:4.4f}')
    print(f'Test accuracy : {score[1]:4.4f}')
else:
    model = keras.models.load_model(save_dir)

print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Predictions")

y_sigmoid = model.predict(x_test)
print(type(y_sigmoid), y_sigmoid.shape)
y_pred    = np.argmax(y_sigmoid, axis=-1)

pwk.plot_images(x_test, y_test, range(0,200), columns=12, x_size=1, y_size=1, y_pred=y_pred, save_as='04-predictions')

errors=[ i for i in range(len(x_test)) if y_pred[i]!=y_test[i] ]
errors=errors[:min(24,len(errors))]
pwk.plot_images(x_test, y_test, errors[:15], columns=6, x_size=2, y_size=2, y_pred=y_pred, save_as='05-some-errors')

pwk.plot_confusion_matrix(y_test,y_pred,range(len(draw_forms)),normalize=True, save_as='06-confusion-matrix')
top.mainloop()

pwk.end()
