import numpy as np
import cv2 as cv
import os
import random as rng

ratio = 3
kernel_size = 3

class Mesure:
    def __init__(self, src):
        self.src = src
        self.A = 1
        self.A_init = int(self.A)
        self.A_max = 300
        cv.namedWindow('A')
        cv.createTrackbar('A', 'A', self.A_init, self.A_max, self.on_A_trackbar)

    def contour(self, c):
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
        # if w > 30 and w < 50 and h > 30 and h < 50:
        r = w/h
        if r > 0.8 and r < 1.2 and w > 1:
            # cv.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)
            print(">>>>", s, "area=", area, "per=", perimeter, "conv=", k, "w=", w, "h=", h, "approx=", len(approx), "r=", r)
            # cv.drawContours(img, c, -1, (0, 255, 0), 2)
            # cv.putText(out, "{}".format(A), (x+10, y+20), font, .4, (0, 0, 0), 1, cv.LINE_AA)
            return True
        return False

    def canny(self):
        src_gray = cv.cvtColor(self.src, cv.COLOR_BGR2GRAY)
        low_threshold = self.A
        img_blur = cv.blur(src_gray, (3, 3))
        detected_edges = cv.Canny(img_blur, low_threshold, low_threshold * ratio, kernel_size)
        contours, hierarchy = cv.findContours(detected_edges, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
        drawing = np.zeros((detected_edges.shape[0], detected_edges.shape[1], 3), dtype=np.uint8)
        print("contrours=", len(contours))

        for c in contours:
            draw = self.contour(c)
            if draw:
                c1 = c[0]
                s1 = c1.shape
                c2 = c1[0]
                s2 = c2.shape

                color = (rng.randint(0, 256), rng.randint(0, 256), rng.randint(0, 256))
                cv.drawContours(drawing, c, -1, color, 1)

                # cv.drawContours(drawing, contours, i, color, 2, cv.LINE_8, hierarchy, 0)

        # mask = detected_edges != 0
        # dst = self.src * (mask[:, :, None].astype(src.dtype))
        # cv.imshow("canny", dst)

        cv.imshow("contours", drawing)
        cv.waitKey(0)

    def on_A_trackbar(self, val):
        self.A = val
        print("A=", self.A)
        self.canny()


files = os.listdir("../mesures/")
n = len(files)
for f in files:
    if f[-3:] == "jpg" and f[:3] == "IMG":
        name = "../mesures/" + f
        print("name=", name)
        src_full = cv.imread(name)
        src = cv.resize(src_full, (0, 0), fx=0.2, fy=0.2)
        mesure = Mesure(src)
        # cv.imshow("shapes", src)
        mesure.canny()
        # CannyThreshold(src, A)

# closing all open windows
cv.destroyAllWindows()

"""
alpha = 1.0
alpha_max = 500
beta = 0
beta_max = 200
gamma = 1.0
gamma_max = 200

def basicLinearTransform():
    res = cv.convertScaleAbs(img_original, alpha=alpha, beta=beta)
    img_corrected = cv.hconcat([img_original, res])
    cv.imshow("Brightness and contrast adjustments", img_corrected)

def gammaCorrection():
    ## [changing-contrast-brightness-gamma-correction]
    lookUpTable = np.empty((1,256), np.uint8)
    for i in range(256):
        lookUpTable[0,i] = np.clip(pow(i / 255.0, gamma) * 255.0, 0, 255)

    res = cv.LUT(img_original, lookUpTable)
    ## [changing-contrast-brightness-gamma-correction]

    img_gamma_corrected = cv.hconcat([img_original, res])
    cv.imshow("Gamma correction", img_gamma_corrected)

def on_linear_transform_alpha_trackbar(val):
    global alpha
    alpha = val / 100
    basicLinearTransform()

def on_linear_transform_beta_trackbar(val):
    global beta
    beta = val - 100
    basicLinearTransform()

def on_gamma_correction_trackbar(val):
    global gamma
    gamma = val / 100
    gammaCorrection()

cv.namedWindow('Brightness and contrast adjustments')
cv.namedWindow('Gamma correction')

alpha_init = int(alpha *100)
cv.createTrackbar('Alpha gain (contrast)', 'Brightness and contrast adjustments', alpha_init, alpha_max, on_linear_transform_alpha_trackbar)
beta_init = beta + 100
cv.createTrackbar('Beta bias (brightness)', 'Brightness and contrast adjustments', beta_init, beta_max, on_linear_transform_beta_trackbar)
gamma_init = int(gamma * 100)
cv.createTrackbar('Gamma correction', 'Gamma correction', gamma_init, gamma_max, on_gamma_correction_trackbar)

on_linear_transform_alpha_trackbar(alpha_init)
on_gamma_correction_trackbar(gamma_init)
"""