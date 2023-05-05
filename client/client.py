import requests
import numpy as np
import cv2 as cv

while True:
    r = requests.get("http://192.168.4.1:80/capture")

    image = np.asarray(bytearray(r.content), dtype=np.uint8)
    cv_image = cv.imdecode(image, cv.IMREAD_COLOR)
    cv.imshow('image', cv_image)
    cv.waitKey(1)
    #print(cv_image.shape)

"""
file = open("capture.jpg", "wb")
file.write(r.content)
file.close()
print("Photo prise")
"""