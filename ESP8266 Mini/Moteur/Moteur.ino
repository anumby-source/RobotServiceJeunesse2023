#include <Arduino.h>
// #include <IRremote.hpp>


#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRutils.h>


#define D3 0
#define D4 2

#define D7 13 // signal IR
#define D8 15

#define D6 12  // B-2A vert pont H pour le moteur Droite
#define D5 14  // B-1A jaune

#define D2 4   // A-1B vert pont H pour le moteur Gauche (B)
#define D1 5   // A-1A jaune

#define D 1   // moteur Droite (A)
#define G 2   // moteur Gauche (B)

IRrecv irrecv(D7);

int old_pin = 0;
int vmax = 255;
decode_results results;

void stop(){
  analogWrite(D1, 0);
  analogWrite(D2, 0);
  analogWrite(D5, 0);
  analogWrite(D6, 0);
  //delay(500);
}

void setup() {
  Serial.begin(115200);
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
  stop ();

  irrecv.enableIRIn();  // Start the receiver
  // IrReceiver.begin(D7, ENABLE_LED_FEEDBACK); // Start the receiver
}


void loop() {
    //Serial.println("Loop");
    /*
    // recule  
    analogWrite(D1, vmax);
    analogWrite(D2, 0);
    analogWrite(D5, vmax);
    analogWrite(D6, 0);
    delay(10000);
    // avance
    analogWrite(D1, 0);
    analogWrite(D2, vmax);
    analogWrite(D5, 0);
    analogWrite(D6, vmax);
    delay(5000);
    */

    /*
    analogWrite(D1, 80);
    analogWrite(D2, 0);
    analogWrite(D5, 255);
    analogWrite(D6, 0);
    delay(5000);
    analogWrite(D1, 255);
    analogWrite(D2, 0);
    analogWrite(D5, 80);
    analogWrite(D6, 0);
    delay(5000); 
    */

// 0xB946FF00 en avant
// OxBC43FF00 à droite
// 0xEA15FF00 en arrière
// 0xBB44FF00 à gauche
// 0xBF40FF00 OK

  if (irrecv.decode(&results)) {
  // if (IrReceiver.decode()) {
      // int code = IrReceiver.decodedIRData.decodedRawData;
      int code = results.value;

      Serial.println("Loop (decode)");
      //IrReceiver.resume(); // Enable receiving of the next value
      if (code != 0) {
        Serial.println(code, HEX);
        //IrReceiver.printIRResultShort(&Serial); // optional use new print version
        if (code == 0xBB44FF00){
          Serial.println("à gauche");
          analogWrite(D1, 127);
          analogWrite(D2, 0);
          analogWrite(D5, 255);
          analogWrite(D6, 0);
          delay(2000);
        }
     }
  }
  // IrReceiver.resume(); // Enable receiving of the next value
  irrecv.resume(); // Enable receiving of the next value
}
