import os.path
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt
import tkinter.messagebox
import random
from sklearn.svm import LinearSVC

clf = LinearSVC()


files = os.listdir("tuiles")

img_list = np.array([])
class_list = np.array([])

n = len(files)
for f in files:
    classe = f[:-4]

    img = cv.imread("tuiles/" + f)[:, :, 0]
    # print(img.shape)
    img = cv.resize(img, (50, 50), interpolation=cv.INTER_AREA)
    img = img.reshape(2500)
    # print(img.shape)
    img_list = np.append(img_list, [img])
    class_list = np.append(class_list, classe)

# print(img_list, class_list)

img_list = img_list.reshape(n, 2500)

clf.fit(img_list, class_list)
print("Model successfully trained!")



img = cv.imread('shapes.jpg')

originalshape = img.shape

s = 400
img = cv.resize(img, (s, s), 0, 0, cv.INTER_AREA)


def apply_brightness_contrast(input_img, brightness=0, contrast=0):
    if brightness != 0:
        if brightness > 0:
            shadow = brightness
            highlight = 255
        else:
            shadow = 0
            highlight = 255 + brightness
        alpha_b = (highlight - shadow) / 255
        gamma_b = shadow

        buf = cv.addWeighted(input_img, alpha_b, input_img, 0, gamma_b)
    else:
        buf = input_img.copy()

    if contrast != 0:
        f = 131 * (contrast + 127) / (127 * (131 - contrast))
        alpha_c = f
        gamma_c = 127 * (1 - f)

        buf = cv.addWeighted(buf, alpha_c, buf, 0, gamma_c)

    return buf

def contours(img):
    imgray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, thresh = cv.threshold(imgray, 127, 255, 0)
    contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    for c in contours:
        s = c.shape
        m = cv.moments(c)
        area = cv.contourArea(c)
        perimeter = cv.arcLength(c, True)
        epsilon = 0.01 * cv.arcLength(c, True)
        approx = cv.approxPolyDP(c, epsilon, True)
        A = len(approx)
        forme = ""
        if A >= 15:
            forme = "rond"
        if A == 4:
            forme = "carre"
        k = cv.isContourConvex(c)
        x, y, w, h = cv.boundingRect(c)
        #if area > 200 and area < 2000:
        if w > 30 and w < 50 and h > 30 and h < 50:
            cv.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)
            print(">>>>", s, "area=", area, "per=", perimeter, "conv=", k, "w=", w, "h=", h, "approx=", len(approx))
            cv.drawContours(img, c, -1, (0, 255, 0), 2)
            cv.putText(out, "{}".format(A), (x+10, y+20), font, .4, (0, 0, 0), 1, cv.LINE_AA)

            # extraction de la forme détectée
            zone = img[x:x+w-1, y:y+h-1, :]
            testimg = cv.resize(zone, (50, 50, 3), interpolation=cv.INTER_AREA)
            testimg2 = testimg.reshape(7500)
            prediction = clf.predict([testimg2])
            print("predict = ", prediction)


    """
    imgray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    ret, thresh = cv.threshold(imgray, 127, 255, 0)
    contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
    print("", contours)
    cv.drawContours(img, contours, -1, (0, 255, 0), 1)
    """


font = cv.FONT_HERSHEY_SIMPLEX
fcolor = (0, 0, 0)

blist = [0, -127, 127, 0, 0, 64]  # list of brightness values
clist = [0, 0, 0, -64, 64, 64]  # list of contrast values

out = np.zeros((s * 2, s * 3, 3), dtype=np.uint8)

for i, b in enumerate(blist):
    c = clist[i]
    print('b, c:  ', b, ', ', c)
    row = s * int(i / 3)
    col = s * (i % 3)

    print('row, col:   ', row, ', ', col)

    out[row:row + s, col:col + s] = apply_brightness_contrast(img, b, c)
    # out[row:row + s, col:col + s] = 0
    msg = 'b %d' % b
    cv.putText(out, msg, (col, row + s - 22), font, .7, fcolor, 1, cv.LINE_AA)
    msg = 'c %d' % c
    cv.putText(out, msg, (col, row + s - 4), font, .7, fcolor, 1, cv.LINE_AA)

    cv.putText(out, 'OpenCV', (260, 30), font, 1.0, fcolor, 2, cv.LINE_AA)

    #contours(out)

# cv2.imwrite('out.png', out)


cv.imshow("shapes", out)

cv.waitKey(0)

# closing all open windows
cv.destroyAllWindows()

