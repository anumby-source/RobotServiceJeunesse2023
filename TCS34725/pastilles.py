import tkinter as tk

top = tk.Tk()

c = tk.Canvas(top, bg="white", height=1000, width=1600)

N = 1
diam = 220
espace = 60

row = 0
column = 0
for r in range(N + 1):
    for g in range(N + 1):
        for b in range(N + 1):
            x = column + espace
            y = row + espace
            coord = x, y, x+diam, y+diam
            d = int(256/N)
            rr = r*d
            gg = g*d
            bb = b*d
            if rr >= 256: rr = 255
            if gg >= 256: gg = 255
            if bb >= 256: bb = 255
            c.create_oval(coord, fill="#{:02X}{:02X}{:02X}".format(rr, gg, bb))
            c.create_text(x + (diam + espace)/2, y + diam + espace, text="({},{},{})".format(rr, gg, bb), fill="black", font=('Helvetica 15 bold'))

            print(rr, gg, bb)
            column += diam + 2*espace
            if column > (1600 - diam - 2*espace):
                column = 0
                row += diam + 2*espace

c.pack()
top.mainloop()
