
#include <IRremote.hpp>

int IR_RECEIVE_PIN = 4;

decode_results results;

void setup()
{
  Serial.begin(115200);
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK); // Start the receiver
}

void loop() {
  if (IrReceiver.decode()) {
     if (IrReceiver.decodedIRData.decodedRawData != 0) {
        Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
        //IrReceiver.printIRResultShort(&Serial); // optional use new print version
     }
     IrReceiver.resume(); // Enable receiving of the next value
  }  delay(10);
}
