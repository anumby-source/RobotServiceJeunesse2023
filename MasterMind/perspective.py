import cv2 as cv
import numpy as np
from random import *

width, height = 30, 45

img = np.ones((5*height, 5*width, 3))*255.

pts1 = np.array([[0,0],[width,0],[0, height],[width,height]], np.float32)
print(pts1.shape)

colors = [(0,0,255), (0,255,0), (255,0,0), (255,0,255)]

for x in range(0, 4):
    cv.circle(img, (2*width + int(pts1[x][0]), 2*height + int(pts1[x][1])), 5, colors[x], cv.FILLED)

cv.circle(img, (2 * width + int(width/2), 2 * height + int(height/2)), width-5, colors[x], cv.FILLED)

cv.imshow("original image", img)

def f(x, y):
    sigma = 0.9
    xx = x + gauss(mu=float(0), sigma=sigma)
    yy = y + gauss(mu=float(0), sigma=sigma)
    print(x, y, xx, yy)
    return xx, yy

def setmin(v, vmin):
    if vmin is None or v < vmin: return v
    return vmin

def setmax(v, vmax):
    if vmax is None or v > vmax: return v
    return vmax

for t in range(10):
    pts2 = np.zeros_like(pts1)
    print(pts2.shape)

    xmin = None
    xmax = None
    ymin = None
    ymax = None
    for x in range(0, 4):
        pts2[x][0], pts2[x][1] = f(pts1[x][0], pts1[x][1])
        xmin = setmin(pts2[x][0], xmin)
        xmax = setmax(pts2[x][0], xmax)
        ymin = setmin(pts2[x][1], ymin)
        ymax = setmax(pts2[x][1], ymax)

    print(pts1)
    print(pts2)

    matrix = cv.getPerspectiveTransform(pts1, pts2)
    imgOutput = cv.warpPerspective(img, matrix, (5*int((xmax - xmin)), 5*int((ymax - ymin))))

    cv.imshow("output image{}".format(t), imgOutput)

    """
    for x in range(0, 4):
        print(pts2[x][0], pts2[x][1])
        cv.circle(imgOutput, (int(pts2[x][0]), int(pts2[x][1])), 5, colors[x], cv.FILLED)
    """

cv.waitKey(0)
