
# Arduino

- https://www.makerguides.com/tcs34725-rgb-color-sensor-with-arduino/
- https://peppe8o.com/color-sensor-with-arduino-uno-tcs34725-explaination-wiring-and-code/
- https://electropeak.com/learn/interfacing-tcs34725-color-sensor-with-arduino/
- https://www.youtube.com/watch?v=dCnjwxkWZ-w

# MicroPython

- https://www.youtube.com/watch?v=qX48oE0c8J0

# Cablage de l'extension ESP-CAM

On connecte l'ESP-CAM à son shield USB par une nappe de câbles. Ce qui permet de créer des dérivations pour connecter TCS34725

broches côté ESP-CAM:

gauche

5V    o
GND   o
12    o
13    o
15    o violet -> orange clair -> 3
14    o gris -> jaune          -> 4
2     o
1     o

droite

3V3   o rouge -> rouge         -> 2
.
.
.
.
.
.
GND   o  vert -> marron clair   -> 1

board d'interconnexion des dérivations entre ESP-CAM et Shield

  1  2  3  4
  o  o  o  o
  o  o  o  o
  5  6  7  8

Détecteur TCS34725

  8  o  bleu -> 14 -> noir    o SDA
  7  o  jaune -> 15 -> blanc  o SCL
  6  o  orange -> 3V3 -> gris o 3V3
  5  o  noir -> GND -> marron o GND


# Jeu

Data ok
pastilles= {1: (57, 59, 34), 2: (60, 69, 51), 3: (59, 78, 37), 4: (65, 90, 65), 5: (118, 64, 38), 6: (116, 64, 48), 7: (157, 134, 52)}
Séquence secrète: [1, 4, 5, 7]

------------Commence le jeu-----------------


===> jeu n° 1

jeu 0> choisis une pastille: [pastille=1] parmi (1..7) pastilles déjà choisies=[]

OK 1 ( 57 59 34 )
jeu 0> choisis une pastille: [pastille=2] parmi (1..7) pastilles déjà choisies=[1]

OK 2 ( 60 69 51 )
jeu 0> choisis une pastille: [pastille=3] parmi (1..7) pastilles déjà choisies=[1, 2]

OK 3 ( 59 78 37 )
jeu 0> choisis une pastille: [pastille=4] parmi (1..7) pastilles déjà choisies=[1, 2, 3]

OK 4 ( 65 90 65 )
Mon jeu: [1, 2, 3, 4] pastilles existantes: [1, 0, 0, 1] pastilles en place: [1, 0, 0, 0]

===> jeu n° 2

jeu 1> choisis une pastille: [pastille=1] parmi (1..7) pastilles déjà choisies=[]

OK 1 ( 57 59 34 )
jeu 1> choisis une pastille: [pastille=2] parmi (1..7) pastilles déjà choisies=[1]

jeu 1> choisis une pastille: [pastille=2] parmi (1..7) pastilles déjà choisies=[1]

OK 5 ( 118 64 38 )
jeu 1> choisis une pastille: [pastille=3] parmi (1..7) pastilles déjà choisies=[1, 5]

OK 6 ( 116 64 48 )
jeu 1> choisis une pastille: [pastille=4] parmi (1..7) pastilles déjà choisies=[1, 5, 6]

OK 7 ( 157 134 52 )
Mon jeu: [1, 5, 6, 7] pastilles existantes: [1, 1, 0, 1] pastilles en place: [1, 0, 0, 1]

===> jeu n° 3

jeu 2> choisis une pastille: [pastille=1] parmi (1..7) pastilles déjà choisies=[]

OK 1 ( 57 59 34 )
jeu 2> choisis une pastille: [pastille=2] parmi (1..7) pastilles déjà choisies=[1]

OK 4 ( 65 90 65 )
jeu 2> choisis une pastille: [pastille=3] parmi (1..7) pastilles déjà choisies=[1, 4]

OK 5 ( 118 64 38 )
jeu 2> choisis une pastille: [pastille=4] parmi (1..7) pastilles déjà choisies=[1, 4, 5]

OK 7 ( 157 134 52 )
Mon jeu: [1, 4, 5, 7] pastilles existantes: [1, 1, 1, 1] pastilles en place: [1, 1, 1, 1]

 ________ GAGNE __________ !!!#
