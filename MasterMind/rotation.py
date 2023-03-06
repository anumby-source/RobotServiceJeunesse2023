import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds
import os
from PIL import Image
import cv2 as cv
from pathlib import Path
from pathlib import PurePath
from random import *
import math

from tensorflow.keras import layers

d = os.getcwd()
print(d)

colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (0, 255, 255), (255, 0, 255), (255, 255, 0)]
color_names = ["blue", "green", "red", "yellow", "magenta", "cyan"]

def A1(img):
    # convert the image to grayscale
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    # apply thresholding on the gray image to create a binary image
    ret,thresh = cv.threshold(gray,127,255,0)

    # find the contours
    contours, _ = cv.findContours(thresh,cv.RETR_TREE,cv.CHAIN_APPROX_SIMPLE)

    # take the first contour
    cnt = contours[0]

    # compute the bounding rectangle of the contour
    x,y,w,h = cv.boundingRect(cnt)

    # draw contour
    img = cv.drawContours(img,[cnt],0,(0,255,255),2)

    # draw the bounding rectangle
    img = cv.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)

    # display the image with bounding rectangle drawn on it
    cv.imshow("Bounding Rectangle", img)
    cv.waitKey(0)
    cv.destroyAllWindows()


#=============================================================================================


def A2(img):
    img1 = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    ret, thresh = cv.threshold(img1, 127, 255, cv.THRESH_BINARY)
    contours, _ = cv.findContours(thresh, cv.RETR_TREE,cv.CHAIN_APPROX_SIMPLE)

    print("contours> ", type(contours), len(contours), type(contours[0]))
    for i, contour in enumerate(contours):
        if i != 1: continue
        print("contours> ", i, contour.shape, color_names[i])
        # cv.drawContours(img, contours, -1, colors[i], 3)

        # print("Number of contours detected:", len(contours))

        # compute straight bounding rectangle
        # x,y,w,h = cv.boundingRect(contour)
        # cv.drawContours(img, [x, y, w, h], i, colors[i], 1)
        # cv.rectangle(img, (x,y), (x+w,y+h), colors[i], 1)

        # compute rotated rectangle (minimum area)
        rect = cv.minAreaRect(contour)
        box = cv.boxPoints(rect)
        box = np.int0(box)

        print("box=", box)

        # draw minimum area rectangle (rotated rectangle)
        # cv.drawContours(img, [box], i, colors[i], 1)
        cv.polylines(img, [box], True, colors[i], 2)

    cv.imshow("Bounding Rectangles", img)
    cv.waitKey(0)
    cv.destroyAllWindows()

def A3(img):

    height, width = img.shape[:2]
    # cv.line(img, (int(width*0.25), int(height*0.5)), (int(width*0.75), int(height*0.5)), colors[2], thickness=1)
    # cv.line(img, (int(width*0.5), int(height*0.25)), (int(width*0.5), int(height*0.75)), colors[2], thickness=1)

    center = (width/2, height/2)
    # center = (width, height)

    angle = randrange(360)
    rotate_matrix = cv.getRotationMatrix2D(center=center, angle=angle, scale=1.)

    rad = math.radians(angle)
    sin = math.sin(rad)
    cos = math.cos(rad)
    # b_w = int((height * abs(sin)) + (width * abs(cos)))*4
    # b_h = int((height * abs(cos)) + (width * abs(sin)))*4

    b_w = 500
    b_h = 500

    rotate_matrix[0, 2] += ((b_w / 2) - center[0])
    rotate_matrix[1, 2] += ((b_h / 2) - center[1])

    rotated = cv.warpAffine(src=img, M=rotate_matrix, dsize=(b_w, b_h))

    # -------------------------------------------------------------

    ret, rot_binary = cv.threshold(rotated, 127, 255, cv.THRESH_BINARY)
    ret, rot_inv = cv.threshold(rotated, 127, 255, cv.THRESH_BINARY_INV)
    ret, rot_trunc = cv.threshold(rotated, 127, 255, cv.THRESH_TRUNC)
    ret, rot_tozero = cv.threshold(rotated, 127, 255, cv.THRESH_TOZERO)

    print("change_rotation> ", img.shape, rotated.shape, rot_binary.shape, rot_inv.shape)

    fond_origin = cv.imread('fond.jpg')
    fond = np.zeros_like(rotated)
    print("fond:", fond_origin.shape, fond.shape)
    fond[:,:,:] = fond_origin[:b_w,:b_h,:]

    # height, width = img_finale.shape[:2]
    # cv.line(img_finale, (int(width*0.25), int(height*0.5)), (int(width*0.75), int(height*0.5)), colors[1], thickness=1)
    # cv.line(img_finale, (int(width*0.5), int(height*0.25)), (int(width*0.5), int(height*0.75)), colors[1], thickness=1)


    cv.imshow("rotated", rotated)
    cv.imshow("rot_binary", rot_binary)
    cv.imshow("rot_inv", rot_inv)
    cv.imshow("rot_trunc", rot_trunc)
    cv.imshow("rot_tozero", rot_tozero)
    cv.imshow("fond", fond)
    cv.waitKey(0)
    cv.destroyAllWindows()


# read the input image
img = cv.imread('dataset/Eclair/RawImagesEclair.jpg')
print("img=", img.shape)

scale_percent = 200  # percent of original size
width = int(img.shape[1] * scale_percent / 100)
height = int(img.shape[0] * scale_percent / 100)
# dim = (width, height)
dim = (150, 150)

# resize image
resized = cv.resize(img, dim, interpolation=cv.INTER_AREA)
print("resized=", resized.shape, type(resized), resized.dtype)

"""
big = np.ones_like(resized)
print("big1=", big.shape)

big = np.ones([resized.shape[0]*3, resized.shape[1]*3, 3], np.uint8)*255
print("big2=", big.shape)

big[resized.shape[0]:resized.shape[0]*2, resized.shape[1]:resized.shape[1]*2, :] = resized[:, :, :]

A2(big)
"""

for i in range(20 ):
    x = (resized < 5)*255
    y = x.astype(np.uint8)

    y[:,:,0:2] = 0

    height, width = y.shape[:2]

    cv.rectangle(y,(0,0),(width-1,height-1),(0,255,0),1)

    # cv.imshow("y", y)
    # cv.waitKey(0)

    A3(y)
