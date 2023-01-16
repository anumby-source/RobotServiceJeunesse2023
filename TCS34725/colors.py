import os
import re
from machine import SoftI2C, Pin
from tcs34725 import TCS34725

i2c = SoftI2C(sda=Pin(14), scl=Pin(15), freq=400000)
print(i2c.scan())

capteurRGB = TCS34725(i2c)

capteurRGB.gain(16)  # 1 4 16 60
capteurRGB.integration_time(2.4)  # 2.4 24 101 154 700

pastilles = dict()


def configure_pastilles(nombre_pastilles):
    p = 0
    while True:
        print("sélecte une pastille: [{}] (0..{})".format(p, nombre_pastilles - 1))
        x = input()
        try:
            if len(x) == 0:
                pastille = p
            else:
                pastille = int(x)
                p = pastille
                if pastille < 0 or pastille >= nombre_pastilles:
                    print("{} illégal".format(pastille))
                    continue
                if pastille in pastilles.keys():
                    print("{} déjà choisi".format(pastille))
                    continue
        except:
            break

        print("pastille=", pastille)

        p += 1

        r, g, b, c = capteurRGB.read(True)
        lux = capteurRGB.read(False)
        print(r, g, b)

        pastilles[pastille] = (r, g, b)

        if len(list(pastilles.keys())) >= nombre_pastilles:
            break

    return pastilles


def check_pastille(r, g, b):
    found = False
    d = 5
    for pastille in pastilles:
        rr, gg, bb = pastilles[pastille]
        # print(n, rr,gg,bb)
        if (rr - d) < r < (rr + d) and (gg - d) < g < (gg + d) and (bb - d) < b < (bb + d):
            print("OK", pastille, "(", rr, gg, bb, ")")
            found = True
            break

    if not found:
        # print("???", r, g, b)
        pastille = None

    return pastille


def test_lecture():
    old = None
    while True:
        while True:
            r, g, b, _ = capteurRGB.read(True)
            # lux = capteurRGB.read(False)
            if old == None:
                old = (r, g, b)

            if r == old[0] and g == old[1] and b == old[2]:
                continue

            break

        pastille = check_pastille(r, g, b)
        if pastille != None:
            print("OK", pastille, "(", r, g, b, ")")

        # print(r, g, b)
        old = (r, g, b)


def save_configuration(fname, pastilles):
    with open(fname, "w") as f:
        for p in pastilles:
            f.write("{}[{},{},{}]\n".format(p, pastilles[p][0], pastilles[p][1], pastilles[p][2]))


def read_configuration(fname):
    data = dict()
    with open(fname, "r") as f:
        while True:
            line = f.readline()
            if len(line) == 0:
                break

            # print("line = ", line)

            m = re.match("(\d+).(\d+).(\d+).(\d+).", line)
            # print(m.group(1), m.group(2), m.group(3), m.group(4))
            data[int(m.group(1))] = (int(m.group(2)), int(m.group(3)), int(m.group(4)))
    return data


n = 8
fname = "pastilles{}.data".format(n)

has_data = False
try:
    p = os.stat(fname)
    print("Data ok")
    has_data = True
    pastilles = read_configuration(fname)
except:
    print("Data not ok !!")

if not has_data:
    pastilles = configure_pastilles(8)
    save_configuration(fname, pastilles)

print("pastilles=", pastilles)

test_lecture()


