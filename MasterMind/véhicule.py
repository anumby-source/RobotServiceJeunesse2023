import numpy as np
import cv2 as cv
from random import *
import math

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


def tuple_sum(t):
    return np.sum(t)


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

        draw_text("Avance", 2, 2)
        draw_text("Recule", 2, 0)

    def xy(self, row, col, dy, dx):
        y = row * self.cell + self.margin + int(self.cell/2)
        x = col * self.cell + self.margin + int((self.cell - dx) / 2)
        return x, y

    def draw(self):
        cv.imshow("Help", self.image)

class Table(object):
    def __init__(self):
        self.width = 800
        self.height = 600

        self.reset_image()
        self.zones = []

    def reset_image(self):
        self.zones = []
        fond_origin = cv.imread('fond.jpg')
        self.image = np.zeros((self.height, self.width, 3), np.uint8)
        self.image[:, :, :] = fond_origin[:self.height, :self.width, :]
        return self.image

    def draw(self):
        cv.imshow("Table", self.image)

    def test_occupé(self, W, H):
        margin = 40
        if len(self.zones) == 0:
            self.zones.append((W, H))
            return True

        for i, zone in enumerate(self.zones):
            Wz, Hz = zone
            # print("test_occupé> ", i, W, H, Wz, Hz)
            ok = True
            if (W > (Wz - margin) and W <= (Wz + margin)) and (H > (Hz - margin) and H <= (Hz + margin)):
                ok = False
                break

        if ok:
            self.zones.append((W, H))
            return True

        return False


def crop(to_img, pos, img, seuil):
    to_height, to_width = to_img.shape[:2]
    height, width = img.shape[:2]

    # print("crop> ", to_height, to_width, height, width)

    seuil = tuple_sum(seuil)

    y0, x0 = pos
    y0 -= int(height/2)
    x0 -= int(width/2)
    if y0 < 0: y0 = 0
    if x0 < 0: x0 = 0

    y1 = y0 + int(height)
    if y1 >= to_height: y1 = to_height - 1
    x1 = x0 + int(width)
    if x1 >= to_width: x1 = to_width - 1

    mask = np.zeros_like(img)
    mask[:,:,:] = img[:,:,:]

    for y in range(y0, y1):
        for x in range(x0, x1):
            color = tuple_sum(mask[y-y0, x-x0, :])
            if color > seuil:
                mask[y-y0, x-x0, :] = 255
                # res[y, x, :] = 0
                c0 = img[y-y0, x-x0, 0]
                c1 = img[y-y0, x-x0, 1]
                c2 = img[y-y0, x-x0, 2]
                if c0 < 5 and c1 < 5 and c2 > 5:
                    table.image[y, x, :] = 0
                else:
                    table.image[y, x, :] = img[y-y0, x-x0, :]

    return mask


def install_form(form, image_origin):
    height, width = image_origin.shape[:2]

    # image = image_origin

    x = (image_origin < 5) * 255
    image_red = x.astype(np.uint8)

    image_red[:, :, 0:2] = 0

    # cv.rectangle(image_red, (0, 0), (width - 1, height - 1), (0, 255, 0), 1)

    image = np.zeros_like(image_red)
    image[:, :, :] = image_red[:, :, :]

    for y in range(height):
        for x in range(width):
            color = tuple_sum(image_red[y, x, :])
            if color < 3*5:
                image[y, x, :] = 255
            else:
                image[y, x, :] = image_red[y, x, :]

    center = (int(height / 2), int(width / 2))

    while True:
        angle = randrange(360)
        rotate_matrix = cv.getRotationMatrix2D(center=center, angle=angle, scale=1.)
        rad = math.radians(angle)
        sin = math.sin(rad)
        cos = math.cos(rad)
        b_w = int((height * abs(sin)) + (width * abs(cos)))*2
        b_h = int((height * abs(cos)) + (width * abs(sin)))*2

        # print("b_w, b_h=", b_w, b_h, "center=", center)

        rotate_matrix[0, 2] += ((b_w / 2) - center[0])
        rotate_matrix[1, 2] += ((b_h / 2) - center[1])

        rotated = cv.warpAffine(src=image, M=rotate_matrix, dsize=(b_w, b_h))

        margin = 50
        H = randrange(margin, table.height - margin)
        W = randrange(margin, table.width - margin)
        # print("fond size=", table.height, table.width, "H, W=", H, W, "b_w, b_h=", b_w, b_h, "center=", center)

        test = table.test_occupé(W, H)
        if test: break

    # cv.rectangle(table.image, (W-center[0], H-center[0]), (W+center[0], H+center[0]), (0, 255, 255), 1)

    crop(table.image, pos=(H, W), img=rotated, seuil=np.array([5, 5, 5]))

    # cv.imshow("fond", table.image)
    # cv.imshow("image_origin", image_origin)
    # cv.imshow("image_red", image_red)
    # cv.imshow("image", image)
    # cv.imshow("rotated", rotated)
    # cv.imshow("mask", mask)
    # cv.imshow("table".format(form), table.image)

class Caméra(object):
    def __init__(self):
        self.width = 120
        self.height = 120
        self.margin = 60
        self.w2 = int(self.width/2)
        self.h2 = int(self.height/2)

        self.fond = cv.imread("fond.jpg", cv.IMREAD_COLOR)

    def thresh_callback(self, val):
        threshold = val
        # Detect edges using Canny
        canny_output = cv.Canny(self.src_gray, threshold, threshold * 2)
        # Find contours
        contours, hierarchy = cv.findContours(canny_output, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
        # Draw contours
        drawing = np.zeros((canny_output.shape[0], canny_output.shape[1], 3), dtype=np.uint8)
        for i in range(len(contours)):
            color = (randint(0, 256), randint(0, 256), randint(0, 256))
            cv.drawContours(drawing, contours, i, color, 2, cv.LINE_8, hierarchy, 0)
        # Show in a window
        cv.imshow('Contours', drawing)

    def draw(self, table, x, y):

        raw_w, raw_h = images[0].shape[0:2]
        raw_w2 = int(raw_w / 2)
        raw_h2 = int(raw_h / 2)

        x0 = int(x - self.width/2)
        if x0 < 0 : x0 = 0
        x1 = int(x + self.width/2)
        if x1 >= table.width: x1 = table.width - 1
        y0 = int(y - self.height/2)
        if y0 < 0 : y0 = 0
        y1 = int(y + self.height/2)
        if y1 >= table.height: y1 = table.height - 1

        cv.circle(img=table.image, center=(int(x), int(y)), radius=3, color=R, lineType=cv.FILLED)

        caméra = np.zeros((self.height + 2*10 + 1, self.width + 2*10 + 1, 3), np.uint8)
        caméra[:,:,:] = table.image[y0 - 10:y1 + 11, x0 - 10:x1 + 11, :]

        print("extract from table>  (x0, y0)=", x0, y0, "(x1, y1)=", x1, y1, "w=", x1 - x0, "h=", y1 - y0, "caméra.shape=", caméra.shape)

        # cv.circle(img=caméra, center=(int(self.w2 + 10), int(self.h2 + 10)), radius=3, color=R, lineType=cv.FILLED)

        cv.rectangle(caméra, (10, 10), (10 + self.width, 10 + self.height), G, 1)

        cv.imshow("extract", caméra)
        # cv.waitKey()
        return


forms = ["Rond", "Square", "Triangle", "Star5",
         "Star4", "Eclair", "Coeur", "Lune"]

table = Table()
caméra = Caméra()
help = Help()

images = []
for form in forms:
    image = cv.imread('dataset/{}/RawImages{}.jpg'.format(form, form))
    images.append(image)

table.reset_image()

m = 20
cv.rectangle(table.image, (20, 20), (table.width - 21, table.height - 21), (0, 255, 255), 1)

for f, form in enumerate(forms):
    install_form(form, images[f])

# cv.waitKey()

x = table.width/2.
y = table.height/2.

alpha = 0
v = 0
a = 1
t = 0
dt = 1
d = 1

raw_w, raw_h = images[0].shape[0:2]
raw_w2 = int(raw_w/2)
raw_h2 = int(raw_h/2)

while True:
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

    if k == zéro + 1: d = -1
    elif k == zéro + 3: d = 1

    if k == zéro + 5:
        a = 1
        v = 0

    if v > 0:
        x += d * v * dt * np.cos(deg2rad(alpha))
        if x < (caméra.w2 + raw_w2) : x = caméra.w2 + raw_w2
        if x >= table.width - caméra.w2 - raw_w2: x = table.width - caméra.w2 - raw_w2 - 1

        y += d * v * dt * np.sin(deg2rad(alpha))
        if y < (caméra.h2 + raw_h2) : y = caméra.h2 + raw_h2
        if y >= table.height - caméra.h2 - raw_h2: y = table.height - caméra.h2 - raw_h2 - 1

    print("t=", t, "(x, y)=", x, y, "v=", v, "alpha=", alpha, "a=", a)
    table.draw()
    caméra.draw(table, x, y)

    help.draw()

    t += dt
    if k == 27: break
    if k == 113: break

cv.destroyAllWindows()

