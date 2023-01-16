from machine import Pin, ADC
import time

use_pin = 1
use_adc = 2

mode = use_pin
mode = use_adc

if mode == use_adc:
    device = ADC(0)
else:
    device = Pin(5, Pin.IN)

def lecture():
    if mode == use_adc:
        lect = device.read()
    else:
        lect = device.value()
    return lect

def test():
    # aquires data as quickly as possible
    duration = 10
    t0 = time.ticks_us()
    # print(t0, duration)
    results = []
    v0 = 0

    n = 0
    while n < 100:
        #print(time.ticks_us())
        # time.sleep_us(10)
        while True:
            v = lecture()
            d = 5
            # if v < (v0 - d) or v > (v0 + d):
            if v != v0:
                break
        t = time.ticks_us()
        results.append((v, t - t0))
        v0 = v
        t0 = t
        n += 1
    return results

r = test()
print(r)

