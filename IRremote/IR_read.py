from machine import Pin
from datetime import datetime

pin = 5

Pin.setmode(GPIO.BOARD)
GPIO.setup(pin, GPIO.IN)

def getBinar():
    nums1s = 0
    binary = 1
    command = []
    previousValue = 0
    value = GPIO.input(pin)

    while value:
        value = GPIO.input(pin)

    startTime = datetime.now()

    while True:
        if previousValue != value:
            now = datetime.now()
            pulseTime = now - startTime
            startTime = now
            command.append((previousValue, pulseTime.microseconds))
        if value:
            nums1s += 1
        else:
            nums1s = 0

        if nums1s > 10000:
            break

        previousValue = value
        value = GPIO.input(pin)

    for (typ, tme) in command:
        if typ == 1:
            if tme > 1000:
                binary = binary*10 + 1
            else:
                binary *= 10

    if len(str(binary)) > 34:
        binary = int(str(binary)[:34])

    return binary

def convertHex(binaryValue):
    tmpB2 = int(str(binaryValue), 2)
    return hex(tmpB2)

