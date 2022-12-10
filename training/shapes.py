import numpy as np
import cv2 as cv

img = cv.imread('shapes.jpg')

imgray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
ret, thresh = cv.threshold(imgray, 127, 255, 0)
contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
print(">", contours)
for c in contours:
    s = c.shape
    if s[0] > 20:
        c1 = c[0]
        s1 = c1.shape
        c2 = c1[0]
        s2 = c2.shape

        cv.drawContours(img, c, -1, (0,255,0), 3)

cv.imshow("shapes", img)

cv.waitKey(0)

# closing all open windows
cv.destroyAllWindows()