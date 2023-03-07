import numpy as np
import cv2 as cv
from random import *
import math

# les couleurs de base
R = (0, 0, 255)
G = (0, 255, 0)
B = (255, 0, 0)
M = (255, 0, 255)
C = (255, 255, 0)
Y = (0, 255, 255)


# conversion Radians -> degrés
def rad2deg(angle):
    return 180 * angle / np.pi


# conversion degrés -> Radians
def deg2rad(angle):
    return np.pi * angle / 180


# Somme des éléments d'un tuple
def tuple_sum(x):
    return np.sum(x)


# Montrer les commandes actionnées par le clavier numérique
class Help(object):
    def __init__(self):
        # cet affichage se présente sous forme d'une grille 3 x 3 représentant
        # le clavier numérique
        self.cell = 60
        self.margin = 5
        self.width = self.margin*2 + self.cell*3
        self.height = self.margin*2 + self.cell*3

        # La grille
        self.image = np.zeros((self.height, self.width, 3), np.float32)
        for row in range(4):
            y = row*self.cell + self.margin
            cv.line(self.image, (self.margin, y), (self.margin + self.cell*3, y), color=G)
            for col in range(4):
                x = col * self.cell + self.margin
                cv.line(self.image, (x, self.margin), (x, self.margin + self.cell*3), color=G)

        # afficher un texte dans une cellule de la grille
        def draw_text(text, row, col):
            text_width, text_height = cv.getTextSize(text=text,
                                                     fontFace=cv.FONT_HERSHEY_SIMPLEX,
                                                     fontScale=0.4,
                                                     thickness=1)[0]
            cv.putText(img=self.image, text=text, org=(self.xy(row, col, text_height, text_width)),
                       fontFace=cv.FONT_HERSHEY_SIMPLEX, fontScale=0.4, color=Y)

        draw_text("Gauche", 1, 0)
        draw_text("Droite", 1, 2)
        draw_text("Stop", 1, 1)

        draw_text("V+", 0, 1)
        draw_text("V-", 2, 1)

        draw_text("A-", 0, 0)
        draw_text("A+", 0, 2)

        draw_text("Avance", 2, 2)
        draw_text("Recule", 2, 0)

    # coordonnées d'une cellule
    def xy(self, row, col, dy=None, dx=None):
        y = row * self.cell + self.margin + int(self.cell/2)
        x = col * self.cell + self.margin + int((self.cell - dx) / 2)
        return x, y

    def draw(self):
        cv.imshow("Help", self.image)


# Représentation de la table de jeu
# on va y installer les figures tournées alatoirement
class Table(object):
    def __init__(self):
        self.width = 800
        self.height = 600
        self.image = None
        # Lors des essais on doit réinitialiser l'image et la liste des zones où on installe les figures
        self.reset_image()
        self.zones = []

    def reset_image(self):
        self.zones = []
        fond_origin = cv.imread('fond.jpg')
        self.image = np.zeros((self.height, self.width, 3), np.uint8)
        # on installe le fond clippé à la taille de la table
        self.image[:, :, :] = fond_origin[:self.height, :self.width, :]
        return self.image

    def draw(self):
        cv.imshow("Table", self.image)

    # au fur et à mesure que l'on installe les figures, on vérifie si la position proposée
    # n'est pas trop proche d'aucune figure déjà installée
    def test_occupe(self, W, H):
        margin = 40
        if len(self.zones) == 0:
            self.zones.append((W, H))
            return True

        ok = True
        for i, zone in enumerate(self.zones):
            Wz, Hz = zone
            # print("test_occupe> ", i, W, H, Wz, Hz)
            ok = True
            if (W > (Wz - margin) and W <= (Wz + margin)) and (H > (Hz - margin) and H <= (Hz + margin)):
                ok = False
                break

        if ok:
            self.zones.append((W, H))
            return True

        return False


# installation d'un figure "img" sur la table "to_image" à une position "pos"
# chaque figure est tournée aléatoirement et donc elle est dessinée sur un fond noir
# une figure est un carré blanc et la figure elle-même est tracée en rouge
#
def crop(to_img, pos, img):
    to_height, to_width = to_img.shape[:2]
    height, width = img.shape[:2]

    def contraste():
        # augmentation du contraste de l'image de la figure pour obtenir 3 couleurs
        # - noir (le fond de l'image)
        # - blanc (la base carrée tournée de la figure)
        # - rouge (le dessin de la figure)
        for y in range(height):
            for x in range(width):
                c0 = img[y, x, 0]
                c1 = img[y, x, 1]
                c2 = img[y, x, 2]
                if c0 == 0 and c1 == 0 and c2 == 0:
                    # noir
                    pass
                elif c0 == 255 and c1 == 255 and c2 == 255:
                    # blanc
                    pass
                elif c0 == 0 and c1 == 0 and c2 == 255:
                    # rouge
                    img[y, x, 2] = 255
                elif c2 == 255:
                    # presque rouge
                    img[y, x, :] = 0
                    img[y, x, 2] = 255
                elif c0 == 0 and c1 == 0:
                    # presque rouge
                    img[y, x, :] = 0
                    img[y, x, 2] = 255
                elif c0 == c1 and c1 != c2:
                    # presque rouge
                    img[y, x, :] = 0
                    img[y, x, 2] = 255
                elif c0 == c1 and c1 == c2 and c0 < 128:
                    # gris foncé
                    img[y, x, :] = 0
                elif c0 == c1 and c1 == c2 and c0 >= 128:
                    # gris clair
                    img[y, x, :] = 255
                else:
                    # d'autres cas ??? mais ceci ne devrait jamais arriver
                    print("crop> ", x, y, "color=", c0, c1, c2)

    def transfert():
        # print("crop> ========================================================================")
        # Transfert de la figure vers la table
        for y in range(y0, y1):
            for x in range(x0, x1):
                # print("crop> ", x, y, "seuil=", seuil, "s=", s)
                c0 = img[y - y0, x - x0, 0]
                c1 = img[y - y0, x - x0, 1]
                c2 = img[y - y0, x - x0, 2]

                # tout ce qui était noir deviendra transparent
                # tout ce qui était blanc reste blanc
                # tout ce qui était rouge devient noir
                if c0 < 5 and c1 < 5 and c2 > 5:
                    # rouge -> noir
                    table.image[y, x, :] = 0
                elif c0 < 5 and c1 < 5 and c2 < 5:
                    # noir -> transparent
                    pass
                else:
                    # recopie de l'image
                    table.image[y, x, :] = img[y - y0, x - x0, :]

    # augmentation du constraste
    contraste()

    # cv.imshow("img", img)
    # cv.waitKey()

    # print("crop> ", to_height, to_width, height, width)

    # encadrement sur la table où la figure va être installée
    y0, x0 = pos
    y0 -= int(height/2)
    x0 -= int(width/2)
    if y0 < 0:
        y0 = 0
    if x0 < 0:
        x0 = 0

    y1 = y0 + int(height)
    if y1 >= to_height:
        y1 = to_height - 1
    x1 = x0 + int(width)
    if x1 >= to_width:
        x1 = to_width - 1

    # transfert de l'image de la figure vaers la table
    transfert()

    # exit()


# installation d'une figure sur la table
#   on part de l'image brute d'une figure (figure tracée en noir sur un carré blanc)
#   on retrace la figure en rouge
#   on fait tourner cette image : le carré (tourné) se retrouve au centre d'une image élargie à fond noir
#   on recopie cette image sur la table en considéront que le fond noir est transparent
def install_form(image_origin):

    def rotation_positionnement():
        # essai de rotation/positionnement de la figure
        while True:
            angle = randrange(360)
            rotate_matrix = cv.getRotationMatrix2D(center=center, angle=angle, scale=1.)
            rad = math.radians(angle)
            sin = math.sin(rad)
            cos = math.cos(rad)
            b_w = int((height * abs(sin)) + (width * abs(cos))) * 2
            b_h = int((height * abs(cos)) + (width * abs(sin))) * 2

            # print("b_w, b_h=", b_w, b_h, "center=", center)

            rotate_matrix[0, 2] += ((b_w / 2) - center[0])
            rotate_matrix[1, 2] += ((b_h / 2) - center[1])

            rotated = cv.warpAffine(src=image, M=rotate_matrix, dsize=(b_w, b_h))

            margin = 50
            H = randrange(margin, table.height - margin)
            W = randrange(margin, table.width - margin)
            # print("fond size=", table.height, table.width, "H, W=", H, W, "b_w, b_h=", b_w, b_h, "center=", center)

            test = table.test_occupe(W, H)
            if test:
                return rotated, H, W

    height, width = image_origin.shape[:2]

    # image = image_origin

    # colorie la figure en rouge
    x = (image_origin < 5) * 255
    image = x.astype(np.uint8)
    image[:, :, 0:2] = 0
    image = image | image_origin

    center = (int(height / 2), int(width / 2))

    rotated, H, W = rotation_positionnement()
    crop(table.image, pos=(H, W), img=rotated)


# Simulation de la Camera: on recopie une partie de l'image de la table située à la position courante du robot
class Camera(object):
    def __init__(self):
        self.width = 120
        self.height = 120
        self.margin = 60
        self.w2 = int(self.width/2)
        self.h2 = int(self.height/2)

    def draw(self, table, x, y):
        x0 = int(x - self.width/2)
        if x0 < 0:
            x0 = 0
        x1 = int(x + self.width/2)
        if x1 >= table.width:
            x1 = table.width - 1
        y0 = int(y - self.height/2)
        if y0 < 0:
            y0 = 0
        y1 = int(y + self.height/2)
        if y1 >= table.height:
            y1 = table.height - 1

        cv.circle(img=table.image, center=(int(x), int(y)), radius=3, color=R, lineType=cv.FILLED)

        camera = np.zeros((self.height + 2*10 + 1, self.width + 2*10 + 1, 3), np.uint8)
        camera[:, :, :] = table.image[y0 - 10:y1 + 11, x0 - 10:x1 + 11, :]

        # print("extract from table>  (x0, y0)=", x0, y0, "(x1, y1)=", x1, y1,
        # "w=", x1 - x0, "h=", y1 - y0, "camera.shape=", camera.shape)

        cv.rectangle(camera, (10, 10), (10 + self.width, 10 + self.height), G, 1)

        cv.imshow("extract", camera)
        # cv.waitKey()
        return


forms = ["Rond", "Square", "Triangle", "Star5", "Star4", "Eclair", "Coeur", "Lune"]

table = Table()
camera = Camera()
help = Help()

images = []
for form in forms:
    image = cv.imread('dataset/{}/RawImages{}.jpg'.format(form, form))
    images.append(image)

table.reset_image()

m = 20
cv.rectangle(table.image, (20, 20), (table.width - 21, table.height - 21), (0, 255, 255), 1)

for f, form in enumerate(forms):
    install_form(images[f])

# cv.waitKey()

x = table.width/2.
y = table.height/2.

alpha = 0
v = 0
a = 1
t = 0
dt = 1
d = 1

raw_w, raw_h = images[0].shape[0:2]
raw_w2 = int(raw_w/2)
raw_h2 = int(raw_h/2)

while True:
    k = cv.waitKey(0)
    print("k=", k)

    zero = 48
    if k == zero + 4:
        alpha -= 10
    elif k == zero + 6:
        alpha += 10

    if k == zero + 7:
        a -= 1
    elif k == zero + 9:
        a += 1
    if a < 0:
        a = 0

    if k == zero + 8:
        v += a
    elif k == zero + 2:
        v -= a

    if k == zero + 1:
        d = -1
    elif k == zero + 3:
        d = 1

    if k == zero + 5:
        a = 1
        v = 0

    if v > 0:
        x += d * v * dt * np.cos(deg2rad(alpha))
        if x < (camera.w2 + raw_w2):
            x = camera.w2 + raw_w2
        if x >= table.width - camera.w2 - raw_w2:
            x = table.width - camera.w2 - raw_w2 - 1

        y += d * v * dt * np.sin(deg2rad(alpha))
        if y < (camera.h2 + raw_h2):
            y = camera.h2 + raw_h2
        if y >= table.height - camera.h2 - raw_h2:
            y = table.height - camera.h2 - raw_h2 - 1

    print("t=", t, "(x, y)=", x, y, "v=", v, "alpha=", alpha, "a=", a)
    table.draw()
    camera.draw(table, x, y)

    help.draw()

    t += dt
    if k == 27:
        break
    if k == 113:
        break

cv.destroyAllWindows()
