import cv2 as cv
import numpy as np

import requests

'''
INFO SECTION
- if you want to monitor raw parameters of ESP32CAM, open the browser and go to http://192.168.x.x/status
- command can be sent through an HTTP get composed in the following way http://192.168.x.x/control?var=VARIABLE_NAME&val=VALUE (check varname and value in status)
'''

#
# ESP32 URL
URLSTREAM = "http://192.168.4.1:81/stream"
URLSTATUS = "http://192.168.4.1:80/status"
AWB = True

def set_resolution(url: str, index: int=1, verbose: bool=False):
    try:
        if verbose:
            resolutions = "10: UXGA(1600x1200)\n9: SXGA(1280x1024)\n8: XGA(1024x768)\n7: SVGA(800x600)\n6: VGA(640x480)\n5: CIF(400x296)\n4: QVGA(320x240)\n3: HQVGA(240x176)\n0: QQVGA(160x120)"
            print("available resolutions\n{}".format(resolutions))

        if index in [10, 9, 8, 7, 6, 5, 4, 3, 0]:
            requests.get(url + "/control?var=framesize&val={}".format(index))
        else:
            print("Wrong index")
    except:
        print("SET_RESOLUTION: something went wrong")

def set_quality(url: str, value: int=1, verbose: bool=False):
    try:
        if value >= 10 and value <=63:
            requests.get(url + "/control?var=quality&val={}".format(value))
    except:
        print("SET_QUALITY: something went wrong")

def set_awb(url: str, awb: int=1):
    try:
        awb = not awb
        requests.get(url + "/control?var=awb&val={}".format(1 if awb else 0))
    except:
        print("SET_QUALITY: something went wrong")
    return awb

if __name__ == '__main__':
    while True:
        r = requests.get("http://192.168.4.1:80/capture")

        image = np.asarray(bytearray(r.content), dtype=np.uint8)
        cv_image = cv.imdecode(image, cv.IMREAD_COLOR)
        cv.imshow('image', cv_image)
        key = cv.waitKey(1)
        if key == ord('r'):
            idx = int(input("Select resolution index: "))
            set_resolution(URL, index=idx, verbose=True)

        elif key == ord('q'):
            val = int(input("Set quality (10 - 63): "))
            set_quality(URL, value=val)

        elif key == ord('a'):
            AWB = set_awb(URL, AWB)

        elif key == 27:
            break

    cv.destroyAllWindows()
