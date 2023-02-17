import numpy as np
import cv2 as cv
from random import *

R = (0, 0, 255)
G = (0, 255, 0)
B = (255, 0, 0)
M = (255, 0, 255)
C = (255, 255, 0)
Y = (0, 255, 255)


def rad2deg(alpha):
    return 180 * alpha / np.pi


def deg2rad(alpha):
    return np.pi * alpha / 180


class Help(object):
    def __init__(self):
        self.cell = 60
        self.margin = 5
        self.width = self.margin*2 + self.cell*3
        self.height = self.margin*2 + self.cell*3

        self.image = np.zeros((self.height, self.width, 3), np.float32)
        for row in range(4):
            y = row*self.cell + self.margin
            cv.line(self.image, (self.margin, y), (self.margin + self.cell*3, y), color=G)
            for col in range(4):
                x = col * self.cell + self.margin
                cv.line(self.image, (x, self.margin), (x, self.margin + self.cell*3), color=G)

        def draw_text(text, row, col):
            text_width, text_height = cv.getTextSize(text=text, fontFace=cv.FONT_HERSHEY_SIMPLEX, fontScale=0.4, thickness=1)[0]
            cv.putText(img=self.image, text=text, org=(self.xy(row, col, text_height, text_width)),
                       fontFace=cv.FONT_HERSHEY_SIMPLEX, fontScale=0.4, color=Y)

        draw_text("Gauche", 1, 0)
        draw_text("Droite", 1, 2)
        draw_text("Stop", 1, 1)

        draw_text("V+", 0, 1)
        draw_text("V-", 2, 1)

        draw_text("A-", 0, 0)
        draw_text("A+", 0, 2)

    def xy(self, row, col, dy, dx):
        y = row * self.cell + self.margin + int(self.cell/2)
        x = col * self.cell + self.margin + int((self.cell - dx) / 2)
        return x, y

    def draw(self):
        cv.imshow("Help", self.image)

class Table(object):
    def __init__(self):
        self.width = 500
        self.height = 200

        self.image = np.zeros((self.height, self.width, 3), np.float32)

    def draw(self):
        cv.imshow("Table", self.image)

    def add_images(self, raw_images):

        def test_occupé(zones, w, h, x, y):
            margin = 20
            for zone in zones:
                xx, yy = zone
                if (x > (xx - margin) and x < (xx + w + margin)) and (y > (yy - margin) and y < (yy + h + margin)): return True
            return False

        zones = []
        for img in raw_images:
            w, h = img.shape[0:2]
            print(img.shape, w, h)

            center = (w / 2, h / 2)

            # print("change_rotation> ", height, width, center)

            rotate_matrix = cv.getRotationMatrix2D(center=center, angle=randrange(360), scale=1.)
            img2 = cv.warpAffine(src=img, M=rotate_matrix, dsize=(w, h))

            while True:
                x = randrange(self.width - w)
                y = randrange(self.height - h)

                if not test_occupé(zones, w, h, x, y): break

            zones.append((x, y))
            print(self.image.shape, img2.shape, w, h, x, y)
            self.image[y:y+h, x:x+w, :] = img2[:, :, :]

class Caméra(object):
    def __init__(self):
        self.width = 80
        self.height = 80

        self.fond = cv.imread("fond.jpg", cv.IMREAD_COLOR)

    def draw(self, table, x, y):
        x = randrange(self.fond.shape[1] - self.width)
        y = randrange(self.fond.shape[0] - self.height)
        print("fond", self.fond.shape, "x=", x, "y=", y)
        self.image = self.fond[y:y+self.height, x:x+self.width, :]
        cv.imshow("Caméra", self.image)


forms = ["Rond", "Square", "Triangle", "Star5",
         "Star4", "Eclair", "Coeur", "Lune"]

raw_images = []

for n, form in enumerate(forms):
    raw_images.append(cv.imread("RawImages{}.jpg".format(form), cv.IMREAD_COLOR))

table = Table()
table.add_images(raw_images)

caméra = Caméra()
help = Help()

x = table.width/2.
y = table.height/2.

alpha = 0
v = 0
a = 1
t = 0
dt = 1

while True:
    cv.circle(img=table.image, center=(int(x), int(y)), radius=3, color=R, lineType=cv.FILLED)

    k = cv.waitKey(0)
    print("k=", k)

    zéro = 48
    if k == zéro + 4: alpha -= 10
    elif k == zéro + 6: alpha += 10

    if k == zéro + 7: a -= 1
    elif k == zéro + 9: a += 1
    if a < 0 : a = 0

    if k == zéro + 8: v += a
    elif k == zéro + 2: v -= a

    if k == zéro + 5:
        a = 1
        v = 0

    if v > 0:
        x += v * dt * np.cos(deg2rad(alpha))
        if x < 0 : x = 0
        if x >= table.width: x = table.width - 1

        y += v * dt * np.sin(deg2rad(alpha))
        if y < 0 : y = 0
        if y >= table.height: y = table.height - 1

    print("t=", t, "(x, y)=", x, y, "v=", v, "alpha=", alpha, "a=", a)
    table.draw()
    caméra.draw(table, x, y)
    help.draw()

    t += dt
    if k == 27: break
    if k == 113: break

cv.destroyAllWindows()

