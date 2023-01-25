import tkinter as tk

top = tk.Tk()

c = tk.Canvas(top, bg="white", height=1000, width=1600)

"""
On va générer des pastilles de couleur
La gamme de couleurs est parcourue entre (0, 0, 0) et (255, 255, 255)
Avec N pas (N = 1 ou 2 ou 3 ...)
chaque pastille est un cercle de diamètre "diam"
il y a un espace entre chaque pastille "espace"
si rgb = (0,0,0) alors on utilise un gris (min, min, min)
si rgb = (255,255,255) alors on utilise un gris (max, max, max)
"""

N = 1
diam = 220
espace = 80

min = espace
max = 256 - espace

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

            # dessin de la pastille (on affiche le RGB)
            c.create_oval(coord, fill="#{:02X}{:02X}{:02X}".format(rr, gg, bb))
            c.create_text(x + (diam + espace)/2, y + diam + espace, text="({},{},{})".format(rr, gg, bb), fill="black", font=('Helvetica 15 bold'))

            print(rr, gg, bb)

            # disposition répartie sur la feuille A4
            column += diam + 2*espace
            if column > (1600 - diam - 2*espace):
                column = 0
                row += diam + 2*espace

c.pack()
top.mainloop()
