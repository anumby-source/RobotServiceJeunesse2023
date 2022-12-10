import cv2 as cv
import os.path
import numpy as np
from matplotlib import pyplot as plt
import random

img = cv.imread("../Qwirkle/qwirkle.jpg")
# print(img.shape)

w, h, d = img.shape

dw = int(w/6)
dh = int(h/6)

print("dw=", dw, "dh=", dh)

fig, axes = plt.subplots(6, 6)
plt.xticks([])
plt.yticks([])

for c in range(6):
    x = c*dw
    for r in range(6):
        y = r*dh
        # print("x=", x, "y=", y)
        t = img[x:x+dw,y:y+dh,:]
        # t = cv.resize(t, (50, 50), interpolation=cv.INTER_AREA)
        axes[c, r].imshow(t)

plt.show()
