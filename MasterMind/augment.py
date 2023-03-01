import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds
import os
from PIL import Image
import cv2 as cv
from pathlib import Path
from pathlib import PurePath

from tensorflow.keras import layers

d = os.getcwd()
print(d)

images = []
for root, dirs, files in os.walk("./dataset/formes/"):
    print("root=", root, "dirs=", dirs, "files=", files)
    p = PurePath(root)
    for f in files:
        filename = root + "/" + f
        print(filename)
        if filename.endswith(".jpg"):
            pic = Image.open(filename)
            image = np.array(pic.getdata(), np.float32).reshape(pic.size[0], pic.size[1], 3)
            # cv.imshow(p.name, image)
            # cv.waitKey()
            images.append((p.name, image))

# print(images)

# dataset = tf.keras.utils.image_dataset_from_directory("./dataset/", labels='inferred')


"""
# create an empty image
img = tf.zeros([1, 20, 20, 3])
# draw a box around the image
box = np.array([0, 0, 1, 1])
boxes = box.reshape([1, 1, 4])
# alternate between red and blue
colors = np.array([[1.0, 0.0, 0.0], [0.0, 0.0, 1.0]])
tf.image.draw_bounding_boxes(img, boxes, colors)

exit()
"""

IMG_SIZE = 43

resize_and_rescale = tf.keras.Sequential([
  # layers.Resizing(IMG_SIZE, IMG_SIZE),
  layers.RandomRotation(0.2),
  # layers.Rescaling(1./255)
])

for i in range(8):
    image = images[i][1]
    print(image.shape)

    """
    result = resize_and_rescale(image).numpy()
    print(result.shape, type(result))
    cv.imshow("F", result)
    cv.waitKey()
    """

    tensor = tf.convert_to_tensor(image)
    print("image tensor=", tf.shape(tensor))

    bb = np.array([0., 0., 1., 1.], dtype=np.float32)
    bbox = bb.reshape([1, 1, 4])
    print("bbox=", bbox, bbox.shape)
    bounding_boxes = tf.convert_to_tensor(bbox)
    print("bounding_boxes.shape=", tf.shape(bounding_boxes))

    # Generate a single distorted bounding box.
    begin, size, bbox_for_draw = tf.image.sample_distorted_bounding_box(
        tf.shape(tensor), bounding_boxes=bounding_boxes, min_object_covered=0.1)

    # Draw the bounding box in an image summary.
    image_with_box = tf.image.draw_bounding_boxes(tf.expand_dims(image, 0),
                                                  bbox_for_draw)
    tf.compat.v1.summary.image('images_with_box', image_with_box)

    # Employ the bounding box to distort the image.
    distorted_image = tf.slice(image, begin, size)
    print(distorted_image.shape)



exit()

(train_ds, val_ds, test_ds), metadata = tfds.load(
    'formes',
    data_dir='.',
    split=['train[:80%]', 'train[80%:90%]', 'train[90%:]'],
    as_supervised=True,
)

