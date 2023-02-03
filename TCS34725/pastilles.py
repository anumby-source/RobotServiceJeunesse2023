import tkinter as tk
from random import *
import os
import re
import tensorflow as tf
from tensorflow import keras
import pandas as pd
from IPython.core.display import display

import numpy as np
import matplotlib.pyplot as plt
import sys,os

top = tk.Tk()

zoom = 3
margin = 20
canvas = tk.Canvas(top, bg="white", height=256*zoom + 2*margin, width=256*zoom + 2*margin)

os.makedirs("./run/models", mode=0o750, exist_ok=True)
save_dir = "./run/models/best_model.h5"

"""
On va générer des pastilles de couleur
La gamme de couleurs est parcourue entre (0, 0, 0) et (255, 255, 255)
Avec N pas (N = 1 ou 2 ou 3 ...)
chaque pastille est un cercle de diamètre "diam"
il y a un espace entre chaque pastille "espace"
si rgb = (0,0,0) alors on utilise un gris (min, min, min)
si rgb = (255,255,255) alors on utilise un gris (max, max, max)
"""
def build_pastilles():
    pastilles = dict()

    N = 1
    diam = 220
    espace = 80

    min = espace
    max = 256 - espace

    pastille = 1
    row = 0
    column = 0
    for r in range(N + 1):
        for g in range(N + 1):
            for b in range(N + 1):

                # calcul de la position de la pastille:
                x = column + espace
                y = row + espace
                coord = x, y, x+diam, y+diam

                # calcul de la couleur:
                d = int(256/N)
                rr = r*d
                gg = g*d
                bb = b*d
                if rr >= 256: rr = 255
                if gg >= 256: gg = 255
                if bb >= 256: bb = 255

                if rr == 0 and gg == 0 and bb == 0:
                    rr, gg, bb = (min, min, min)
                elif rr == 255 and gg == 255 and bb == 255:
                    rr, gg, bb = (max, max, max)

                """
                # dessin de la pastille (on affiche le RGB)
                c.create_oval(coord, fill="#{:02X}{:02X}{:02X}".format(rr, gg, bb))
                c.create_text(x + (diam + espace)/2, y + diam + espace, text="({},{},{})".format(rr, gg, bb), fill="black", font=('Helvetica 15 bold'))
                """

                # print(rr, gg, bb)

                pastilles[pastille] = (rr, gg, bb)
                pastille += 1

                # disposition répartie sur la feuille A4
                column += diam + 2*espace
                if column > (1600 - diam - 2*espace):
                    column = 0
                    row += diam + 2*espace

    # c.pack()
    # top.mainloop()
    return pastilles

"""
Insertion d'une entrée dans un DataFrame pandas
"""
def insert(df, row):
    insert_loc = df.index.max()

    if pd.isna(insert_loc):
        df.loc[0] = row
    else:
        df.loc[insert_loc + 1] = row

"""
Création de données soit pour l'entraînement soit pour la simulation de test pour le modèle entrainé
On produit:
 - d'une part des données explicitement sur les pastilles (donc avec le RGB proche des pastilles)
 - d'autre part des données purement aléatoires (donc sur tout l'espace RGB, y compris parfois sur les pastilles elles-même)
"""
def build_data(pastilles, data_size):
    # print(pastilles)

    def limits(x):
        if x < 0: return 0
        if x > 255: return 255
        return x

    data = pd.DataFrame(columns=['r', 'g', 'b', 'pastille'])

    sigma = 1.5
    w = 6

    data_size *= len(pastilles.keys())

    for i in range(data_size):
        # Production des données exclusivement aux alentours des pastilles
        # on produit RGB selon une distribution gaussienne autour le la valeur nominale de chaque pastille
        for p in pastilles.keys():
            rr, gg, bb = pastilles[p]
            r = limits(int(gauss(mu=float(rr), sigma=sigma)))
            g = limits(int(gauss(mu=float(gg), sigma=sigma)))
            b = limits(int(gauss(mu=float(bb), sigma=sigma)))
            insert(data, [float(r), float(g), float(b), float(p)])

        for k in pastilles.keys():
            # production des données aléatoires dans tout l'espace RGB
            # mais on détecte si on produit une donnée compatible à une pastille
            r = int(randrange(0, 256))
            g = int(randrange(0, 256))
            b = int(randrange(0, 256))
            p = None
            for pastille in pastilles.keys():
                rr, gg, bb = pastilles[pastille]
                if r > (rr - w) and r < (rr + w) and g > (gg - w) and g < (gg + w) and b > (bb - w) and b < (bb + w):
                    p = pastille
                    break
            if p is None: p = 0
            insert(data, [float(r), float(g), float(b), float(0)])

    # print("-------------------------------------------------")
    # display(data)

    return data


"""
On prépare les données en 4 sous ensembles
1) les données d'entraînement
2) les données de test

et pour les deux jeux, on sépare les inputs du réseau et les outputs supposés
 
"""
def prepare_data_for_training(data):
    # randomisation des données
    data = data.sample(frac=1., axis = 0)
    # display(data.head(5))

    # training
    data_train = data.sample(frac=0.8, axis=0)
    # display(data_train.head(5))

    # test
    data_test = data.drop(data_train.index)
    #display(data_test.head(5))

    # séparation input (=> x) output (=> y)
    x_train = data_train.drop(columns=['pastille'])
    y_train = data_train['pastille']

    x_test = data_test.drop(columns=['pastille'])
    y_test = data_test['pastille']

    # print("original data shape was:", data.shape)
    # print("x_train :", x_train.shape, "y_train :", y_train.shape)
    # print("x_test  :", x_test.shape,  "y_test :", y_teisst.shape)

    # print("Before normalisation")
    # display(x_train.describe())

    mean = x_train.mean()
    std = x_train.std()

    x_train = (x_train - mean) / std
    x_test = (x_test - mean) / std

    print("#### Mean/Std ###", type(mean), mean.shape)
    display(mean)
    display(mean.describe())

    with open("./run/models/mean_std.txt", "w+") as f:
        f.write("{}\n".format(mean))
        f.write("{}\n".format(std))

    # print("After normalisation")
    # display(x_train.describe())

    return x_train, y_train, x_test, y_test, mean, std

"""
Tracé des données
"""
def draw(r, g, b, diam=10, p=None):
    x = r * zoom + margin
    y = g * zoom + margin
    coord = x, y, x + diam, y + diam

    print("coord=", x, y, x + diam, y + diam, "rgb=", r, g, b)

    canvas.create_oval(coord, fill="#{:02X}{:02X}{:02X}".format(int(r), int(g), int(b)))

    if p != None:
        espace = 10
        canvas.create_text(x + (diam + espace) / 2, y + diam + espace,
                           text="{:.4F}".format(p),
                           fill="black",
                           font=('Helvetica 15 bold'))

"""
Entraînement du modèle
"""
def train(pastilles, data_number):
    data = build_data(pastilles, data_number)

    x_train, y_train, x_test, y_test, mean, std = prepare_data_for_training(data)

    def get_model_v1(shape):
        model = keras.models.Sequential()
        model.add(keras.layers.Input(shape, name="InputLayer"))
        model.add(keras.layers.Dense(64, activation="relu", name="Dense_n1"))
        model.add(keras.layers.Dense(64, activation="relu", name="Dense_n2"))
        model.add(keras.layers.Dense(1, name="Output"))

        model.compile(optimizer = "rmsprop",
                      loss      = "mse",
                      metrics   = ["mae", "mse"])

        return model

    model = get_model_v1(3)
    model.summary()

    savemodel_callback = keras.callbacks.ModelCheckpoint(filepath=save_dir, verbose=0, save_best_only=True)

    x_train, y_train = np.array(x_train), np.array(y_train)
    x_test, y_test = np.array(x_test), np.array(y_test)

    fit_verbosity = 1
    history = model.fit(x_train,
                        y_train,
                        epochs = 100,
                        batch_size = 10,
                        verbose = fit_verbosity,
                        validation_data = (x_test, y_test),
                        callbacks = [savemodel_callback])

    score = model.evaluate(x_test, y_test, verbose=0)
    print("x_test / loss  : {:5.4f}".format(score[0]))
    print("x_test / mae   : {:5.4f}".format(score[1]))
    print("x_test / mse   : {:5.4f}".format(score[2]))

    print("min(val_mae)   : {:.4f}".format(min(history.history["val_mae"])))

"""
relecture de mean/std par rapport à un modèle déjà entraîné
"""
def get_mean_std():
    with open("./run/models/mean_std.txt", "r") as f:
        lines = f.readlines()

    mean = None
    std = None

    for line in lines:
        m = re.match("(.)\s+(\d+.\d+)", line)
        if m is None:
            print(r, g, b)
            if mean is None:
                mean = pd.Series({'r': r, 'g': g, 'b': b})
                continue
            if std is None:
                std = pd.Series({'r': r, 'g': g, 'b': b})
                break
        else:
            if m.group(1) == "r": r = float(m.group(2))
            if m.group(1) == "g": g = float(m.group(2))
            if m.group(1) == "b": b = float(m.group(2))

    print(mean.shape)
    display(mean)

    return mean, std

# ======================================================================================

"""
Première étape, on crée toutes les pastillesavec la gamme de couleurs
Les pastilles sont créées dans un dict()
dist[p] = (r, g, b)
"""
pastilles = build_pastilles()

for p in pastilles:
    r, g, b = pastilles[p]
    draw(r, g, b, diam=15, p=p)

"""
Deuxième étape, on va installer le modèle d'apprentissage:
- soit on crée le modèle par apprentissage
- soit on recharge un modèle déjà entraîné
"""
use_model = True

if not use_model:
    train(pastilles, 1000)

loaded_model = keras.models.load_model(save_dir)
mean, std = get_mean_std()

"""
Troisième étape, on va tester le modèle entraîné:
- on génère des données simulées => x_simulation, y_simulation
  - x_simulation: input
  - y_simulation: output
"""
simulation_size = 1000

simulation_data = build_data(pastilles, simulation_size)

x_simulation = simulation_data.drop(columns=['pastille'])
y_simulation = simulation_data['pastille']

x_simulation = (x_simulation - mean) / std

score = loaded_model.evaluate(x_simulation, y_simulation, verbose=0)
print("x_test / loss  : {:5.4f}".format(score[0]))
print("x_test / mae   : {:5.4f}".format(score[1]))
print("x_test / mse   : {:5.4f}".format(score[2]))


print(">>>>>>>>>>>>>>>>>>> normalized data: (x, y)")
display(x_simulation, y_simulation)
print("<<<<<<<<<<<<<<<<<<<")

print("data_size=", len(x_simulation))

print(">>>>>>>>>>>>>>>>>>> sample: (x, y)")
display(x_simulation, y_simulation)
print(x_simulation.shape, y_simulation.shape)
print("keys=", x_simulation.keys())
print("axes=", x_simulation.axes)
print("size=", x_simulation.size)
print("ndim=", x_simulation.ndim)
print("index=", x_simulation.index)
print("<<<<<<<<<<<<<<<<<<<")

"""
On utilise le modèle pour faire des prédictions à partie des données simulées
"""
predictions = loaded_model.predict(x_simulation, verbose=2)
display(predictions)

# reconstitution des données réelles
real_data = x_simulation * std + mean

print("=================== évaluation de la simulation")
for n, i in enumerate(x_simulation.index):
    prediction = predictions[n][0]
    # print("i=", i, "prediction = ", prediction)

    real = y_simulation.loc[i]
    delta = real - prediction
    error = prediction % 1.0
    # print(f"{i:03d}   {prediction} {delta:+.2f}")
    # print("type(x[i])=", type(x.loc[i]))

    if n < 1000:
        pred = int(prediction)
        if pred in pastilles and abs(error) < 0.03:
            r, g, b = real_data.loc[i]
            rr, gg, bb = pastilles[pred]
            print(f"{i:03d}  prediction={pred}  error={error} color=[r{int(r)}, g{int(g)}, b{int(b)}] pastille=[r{int(rr)}, g{int(gg)}, b{int(bb)}]")
        elif pred == 0 and abs(error) < 0.03:
            r, g, b = real_data.loc[i]
            print(f"{i:03d}  prediction={pred}  error={error} color=[r{int(r)}, g{int(g)}, b{int(b)}]")


# canvas.pack()
# top.mainloop()
