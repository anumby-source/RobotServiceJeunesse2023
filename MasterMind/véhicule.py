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

        self.image = np.zeros((self.height, self.width, 3), np.float32)

    def draw(self):
        cv.imshow("Table", self.image)

    def add_images(self, raw_images):

        def test_occupé(w, h, x, y):
            margin = 20
            for zone in self.zones:
                xx, yy, _ = zone
                if (x > (xx - margin) and x < (xx + w + margin)) and (y > (yy - margin) and y < (yy + h + margin)): return True
            return False

        self.zones = []
        for img in raw_images:
            w, h = img.shape[0:2]
            print(img.shape, w, h)

            center = (w / 2, h / 2)

            # print("change_rotation> ", height, width, center)

            rotate_matrix = cv.getRotationMatrix2D(center=center, angle=randrange(360), scale=1.)
            img2 = cv.warpAffine(src=img, M=rotate_matrix, dsize=(w, h))

            while True:
                x = randrange(self.width - caméra.width - w) + int(caméra.width/2 + w/2)
                y = randrange(self.height - caméra.height - h) + int(caméra.height/2 + h/2)

                if not test_occupé(w, h, x, y): break

            self.zones.append((x, y, img2))
            print(self.image.shape, img2.shape, w, h, x, y)
            self.image[y-int(h/2):y+int(h/2)+1, x-int(h/2):x+int(w/2)+1, :] = img2[:, :, :]

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

        raw_w, raw_h = raw_images[0].shape[0:2]
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
        t = table.image[y0 - 10:y1 + 11, x0 - 10:x1 + 11, :]
        # caméra = np.zeros((self.height + 2*10 + 1, self.width + 2*10 + 1, 3))
        caméra = np.zeros((self.height + 2*10 + 1, self.width + 2*10 + 1, 3), np.uint8)


        xf = randrange(self.fond.shape[1] - self.width - 2*10)
        yf = randrange(self.fond.shape[0] - self.height - 2*10)
        xf0 = xf
        yf0 = yf
        xf1 = xf0 + self.width + 2*10
        yf1 = yf0 + self.height + 2*10
        print("fond", self.fond.shape, "xf=", xf, "yf=", yf,
              "xf0=", xf0, "yf0=", yf0, "xf1=", xf1, "yf1=", yf1,
              "wf=", self.width + 2*10,
              "hf=", self.height + 2*10)
        ff = self.fond[yf0:yf1 + 1, xf0:xf1 + 1, :]
        # fond = np.zeros_like(ff, np.float32)
        fond = np.zeros_like(ff)
        fond[:,:,:] = ff[:,:,:]
        # cv.imshow("fond", fond)

        cv.circle(img=table.image, center=(int(x), int(y)), radius=3, color=R, lineType=cv.FILLED)

        print("extract from table>  (x0, y0)=", x0, y0, "(x1, y1)=", x1, y1, "w=", x1 - x0, "h=", y1 - y0, " t.shape=", t.shape, "caméra.shape=", caméra.shape, "fond.shape=", fond.shape)

        caméra = fond[:self.height + 2*10 + 1, :self.width + 2*10 + 1, :]
        cv.circle(img=caméra, center=(int(self.w2 + 10), int(self.h2 + 10)), radius=3, color=R, lineType=cv.FILLED)

        shape = t.shape
        # t = table.image[y0 - 10:y1 + 11, x0 - 10:x1 + 11, :]
        caméra[:,:,:] += t.astype(np.uint8)

        z1 = (t == 255)*255
        z2 = (t != 255)*1*t
        Z = z1 + z2
        Zff = fond*z2

        cv.imshow("ff", Zff)

        """
            self.zones.append((x, y, img2))
            self.image[y-int(h/2):y+int(h/2)+1, x-int(h/2):x+int(w/2)+1, :] = img2[:, :, :]
        """

        cv.rectangle(caméra, (10, 10), (10 + self.width, 10 + self.height), G, 1)

        cv.imshow("extract", caméra)
        # cv.waitKey()
        return

        self.src_gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)
        self.src_gray = cv.blur(self.src_gray, (3, 3))
        # Create Window
        source_window = 'Source'
        cv.namedWindow(source_window)
        cv.imshow(source_window, src)
        max_thresh = 255
        thresh = 100  # initial threshold
        cv.createTrackbar('Canny Thresh:', source_window, thresh, max_thresh, self.thresh_callback)
        self.thresh_callback(thresh)

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
caméra = Caméra()
help = Help()

cv.rectangle(table.image, (caméra.w2, caméra.h2), (table.width - caméra.w2, table.height - caméra.h2), Y, 1)

table.add_images(raw_images)

x = table.width/2.
y = table.height/2.

alpha = 0
v = 0
a = 1
t = 0
dt = 1
d = 1

raw_w, raw_h = raw_images[0].shape[0:2]
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

