from machine import Pin, ADC
import time

pin = Pin(0, Pin.IN)


def test(pin):
    # aquires data as quickly as possible
    duration = 3000000
    t0 = time.ticks_us()
    # print(t0, duration)
    results = []
    v0 = 0
    n = 0
    while (time.ticks_us() - t0) < duration or v != v0:
        # print(time.ticks_us())
        v = pin.value()
        # results.append(v)
        v0 = v
        n += 1
    return n


def getRAW(pin):
    num1s = 0  # Number of consecutive 1s
    command = []  # Pulses and their timings
    previousValue = 0  # The previous pin state

    value = pin.value()  # Current pin state

    while value == 1:  # Waits until pin is pulled low
        time.sleep_ms(110)
        value = pin.value()

    startTime = time.ticks_us()  # Sets start time
    print("startTime1=", startTime)

    while num1s < 10000:
        if value != previousValue:  # Waits until change in state occurs
            now = time.ticks_us()  # Records the current time
            pulseLength = now - startTime  # Calculate time in between pulses
            # print("now=", now, "pulseLength=", pulseLength)
            startTime = now  # Resets the start time
            command.append((previousValue,
                            pulseLength))  # Adds pulse time to array (previous val acts as an alternating 1 / 0 to show whether time is the on time or off time)

        # Interrupts code if an extended high period is detected (End Of Command)
        if value == 1:
            num1s += 1
        else:
            num1s = 0

        # Reads values again
        previousValue = value
        value = pin.value()

    return command  # Returns the raw information about the high and low pulses (HIGH/LOW, time µs)


def convertHex(binaryValue):
    tmpB2 = int(str(binaryValue), 2)
    return hex(tmpB2)


# n = test(pin)
# print(n)

d = getRAW(pin)
print(d)



