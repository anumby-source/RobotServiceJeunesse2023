from machine import SoftI2C, Pin
from tcs34725 import TCS34725

i2c = SoftI2C(sda=Pin(14), scl=Pin(15), freq=400000)
print(i2c.scan())

capteurRGB = TCS34725(i2c)

capteurRGB.gain(16)  # 1 4 16 60
capteurRGB.integration_time(2.4)  # 2.4 24 101 154 700

pastilles = [(63, 61, 37),
             (62, 68, 49),
             (71, 78, 61),
             (62, 77, 37),
             (57, 78, 55),
             (70, 84, 65),
             (68, 90, 42),

             (6, 68, 90),
             (80, 107, 79),
             (107, 64, 39),
             (92, 60, 41),
             (81, 75, 59),
             (133, 112, 46),
             (111, 101, 63),

             (90, 98, 72),
             (86, 103, 44),
             (85, 106, 53),
             (110, 131, 88),
             (149, 70, 43),
             (148, 71, 48),
             (146, 70, 56),

             (170, 98, 47),
             (162, 90, 57),
             (159, 91, 68),
             (200, 163, 62),
             (201, 167, 67),
             ]

while True:
    r, g, b, c = capteurRGB.read(True)
    lux = capteurRGB.read(False)
    print(r, g, b)

    found = False
    d = 5
    for n, pastille in enumerate(pastilles):
        rr, gg, bb = pastille
        # print(n, rr,gg,bb)
        if (rr - d) < r < (rr + d) and (gg - d) < g < (gg + d) and (bb - d) < b < (bb + d):
            print(n, rr, gg, bb)
            found = True
            break

    if not found:
        print("???", r, g, b)

