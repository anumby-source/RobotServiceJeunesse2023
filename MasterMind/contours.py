import cv2 as cv
import numpy as np
import random as rng
rng.seed(12345)

top = None

def AspectRatio(cnt):
    try:
        x, y, w, h = cv.boundingRect(cnt)
        aspect_ratio = float(w) / h
    except:
        aspect_ratio = 0
    return aspect_ratio

def Extent(cnt):
    try:
        area = cv.contourArea(cnt)
        x, y, w, h = cv.boundingRect(cnt)
        rect_area = w * h
    except:
        area = 0
        rect_area = 0
    return area, rect_area

def Solidity(cnt):
    try:
        area = cv.contourArea(cnt)
        hull = cv.convexHull(cnt)
        hull_area = cv.contourArea(hull)
        solidity = float(area) / hull_area
    except:
        solidity = 0
    return solidity

def EquivalentDiameter(cnt):
    try:
        area = cv.contourArea(cnt)
        equi_diameter = np.sqrt(4 * area / np.pi)
    except:
        equi_diameter = 0
    return equi_diameter

def Orientation(cnt):
    (x,y),(MA,ma),angle = cv.fitEllipse(cnt)


def MaskandPixelPoints(cnt, imgray):
    mask = np.zeros(imgray.shape, np.uint8)
    cv.drawContours(mask, [cnt], 0, 255, -1)
    pixelpoints = np.transpose(np.nonzero(mask))
    # pixelpoints = cv.findNonZero(mask)

def MaximumValueMinimumValueLocations(imgray, mask):
    min_val, max_val, min_loc, max_loc = cv.minMaxLoc(imgray, mask = mask)

def MeanColorMeanIntensity(im, mask):
    mean_val = cv.mean(im, mask = mask)

def ExtremePoints(cnt):
    leftmost = tuple(cnt[cnt[:, :, 0].argmin()][0])
    rightmost = tuple(cnt[cnt[:, :, 0].argmax()][0])
    topmost = tuple(cnt[cnt[:, :, 1].argmin()][0])
    bottommost = tuple(cnt[cnt[:, :, 1].argmax()][0])

class TopHElement(object):
    def __init__(self):
        self.id = -1
        self.previous = -1
        self.first = -1
        self.parent = None
        self.level = 0

        self.list = dict()

    def print(self):
        tab = "__"*self.level
        print(tab, "next=", self.id, "previous=", self.previous, "first=", self.first, "parent=", self.parent.id)

    def print_all(self):
        tab = "  "*self.level
        print(tab, self.id)
        for id in self.list:
            e = self.list[id]
            e.print_all()

    def add_to_parent(self):
        if self.parent is not None:
            self.parent.list[self.id] = self

top = TopHElement()

class HElement(TopHElement):
    def __init__(self, id, next_id, previous_id, first_id, parent_id):
        if id == 458:
            print("458")
        self.id = id
        self.next = next_id
        self.previous = previous_id
        self.first = first_id
        self.parent_id = parent_id
        self.list = dict()
        self.parent = self.find_element_from_top(parent_id)
        self.add_to_parent()
        try:
            self.level = self.parent.level + 1
        except:
            self.parent.print()
            self.print()
            pass

    def find_element_from_top(self, id):
        if id == -1:
            return top

        t = top
        if id in top.list:
            return top.list[id]

        for subid in top.list:
            e = top.list[subid]
            if e.find_element(id) is not None:
                return e

        return None

    def find_element(self, id):
        if id in self.list:
            return self.list[id]

        for subid in self.list:
            e = self.list[subid]
            if e.find_element(id) is not None:
                return e

        return None

    def add(self, element):
        self.list[element.id] = element

def draw_text(img, text, x, y, color):
    coordinates = (x, y)
    font = cv.FONT_HERSHEY_SIMPLEX
    fontScale = 0.5

    thickness = 1
    cv.putText(img, text, coordinates, font, fontScale, color, thickness, cv.LINE_AA)

src = cv.imread("Ecran.jpg")

src_gray = cv.cvtColor(src, cv.COLOR_BGR2GRAY)
src_gray = cv.blur(src_gray, (3,3))

# cv.imshow('Contours', src_gray)

threshold = 60
# Detect edges using Canny
print("src_gray.shape=", src_gray.shape)
# canny_output = cv.Canny(src_gray, threshold, threshold * 2)

ret, thresh = cv.threshold(src_gray, 200, 255, cv.THRESH_BINARY)
contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

# Find contours
# contours, hierarchy = cv.findContours(canny_output, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

for i, cnt in enumerate(contours):
    # print(i, "next=", h[0], "previous=", h[1], "first=", h[2], "parent=", h[3])

    x, y, w, h = cv.boundingRect(cnt)


    c = (0, 0, 255)
    v1 = AspectRatio(cnt)
    if v1 > 1.1: continue
    if v1 < 0.9: c = (255, 0, 0)

    area, rect_area = Extent(cnt)
    if area < 2000: continue
    if area > 3000: continue

    v3 = Solidity(cnt)
    v4 = EquivalentDiameter(cnt)
    # v5 = Orientation(h)
    # v6 = MaskandPixelPoints(cnt, imgray)
    # v7 = MaximumValueMinimumValueLocations(imgray, mask)
    # v8 = MeanColorMeanIntensity(im, mask)
    # v9 = ExtremePoints(h)

    print(i, "AspectRatio=", "{:2.2f}".format(v1), "area", area, "rect_area", rect_area, "solidity", v3, "diam", v4, x, y, w, h)

    color = (rng.randint(0 ,256), rng.randint(0 ,256), rng.randint(0 ,256))
    # cv.drawContours(src, contours, i, color, 2)
    m = 20
    cv.rectangle(src, (x - m, y - m), (x + w + m, y + h + m), color, 2)
    draw_text(src, "({:d},{:2.2f})".format(i, v1), x - m, y - m, color)

    pass

"""
for data in contours:
    print("The contours have this data ", data)

cv.drawContours(src,contours,-1,(0,255,0),1)
"""

cv.imshow('output', src)
cv.waitKey()


exit()

# Draw contours
drawing = np.zeros((canny_output.shape[0], canny_output.shape[1], 3), dtype=np.uint8)
for i in range(len(contours)):
    color = (rng.randint(0 ,256), rng.randint(0 ,256), rng.randint(0 ,256))
    cv.drawContours(drawing, contours, i, color, 1, cv.LINE_8, hierarchy, 0)
    print(contours[i])
# Show in a window
cv.imshow('Contours', drawing)
cv.waitKey()
