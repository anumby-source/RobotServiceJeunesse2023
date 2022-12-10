B'''
NEURALNINE (c) 2019
Drawing Classifier ML Alpha v0.1

This is the very first prototype and the code is not clean at all
Also there may be a couple of bugs
A lot of exceptions are not handled
'''

'''
IMPORTS
'''
import PIL
import pickle
import os
import os.path
import cv2 as cv
import numpy as np
from matplotlib import pyplot as plt
import tkinter.messagebox
import random

from tkinter import *
from tkinter import filedialog
from tkinter import simpledialog
from PIL import Image, ImageDraw
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

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

print(img_list, class_list)

img_list = img_list.reshape(n, 2500)

clf.fit(img_list, class_list)
print("Model successfully trained!")

for k in range(20):
    test = random.randint(0, n-1)

    # print(test, files[test])

    testimg = cv.imread("tuiles/" + files[test])[:, :, 0]
    # print(img.shape)
    testimg = cv.resize(testimg, (50, 50), interpolation=cv.INTER_AREA)
    testimg2 = testimg.reshape(2500)
    # print(testimg2.shape)

    kernel = np.ones((5, 5), np.float32) / 25
    dst = cv.filter2D(testimg, -1, kernel)

    plt.subplot(121), plt.imshow(testimg), plt.title('Original')
    plt.xticks([]), plt.yticks([])
    plt.subplot(122), plt.imshow(dst), plt.title('Averaging')
    plt.xticks([]), plt.yticks([])
    plt.show()

    prediction = clf.predict([testimg2])

    print("predict = ", prediction, files[test])
