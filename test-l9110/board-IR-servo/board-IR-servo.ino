/*
 * Arnaud https://github.com/arnaudrco/exemples/blob/main/Telecommande-IR-servomoteur/IR-esp-mp3-board-sleep/IR-esp-mp3-board-sleep.ino
 * ATTENTION rentrer les codes pour votre télécommande (emetteur IR)

FF22DD >=
FFE01F EQ

FF02FD <<
FFC23D >>

FF906F +
FFA857 -

dans le menu Outils > gerer les bibliothèques ajouter IRremoteESP8266 

 * IRremoteESP8266: IRrecvDemo - demonstrates receiving IR codes with IRrecv
 * This is very simple teaching code to show you how to use the library.
 * If you are trying to decode your Infra-Red remote(s) for later replay,
 * use the IRrecvDumpV2.ino (or later) example code instead of this.
 * An IR detector/demodulator must be connected to the input kRecvPin.
 * Copyright 2009 Ken Shirriff, http://arcfn.com
 * Example circuit diagram:
 *  https://github.com/crankyoldgit/IRremoteESP8266/wiki#ir-receiving
 * Changes:
 *   Version 0.2 June, 2017
 *     Changed GPIO pin to the same as other examples.
 *     Used our own method for printing a uint64_t.
 *     Changed the baud rate to 115200.
 *   Version 0.1 Sept, 2015
 *     Based on Ken Shirriff's IrsendDemo Version 0.1 July, 2009
 */
#include <Arduino.h>
#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRutils.h>

#include <Servo.h>

static const int servoPin1 = D8;
static const int servoPin2 = D8;
Servo servo1,servo2;

#define moteur1A D1
#define moteur1B D2
#define moteur2A D3
#define moteur2B D4

#define GND D7

int vitesse = 180;  // 0 à 255

// An IR detector/demodulator is connected to GPIO pin 14(D5 on a NodeMCU
// board).
// Note: GPIO 16 won't work on the ESP8266 as it does not have interrupts.
// Note: GPIO 14 won't work on the ESP32-C3 as it causes the board to reboot.
#ifdef ARDUINO_ESP32C3_DEV
const uint16_t kRecvPin = 10;  // 14 on a ESP32-C3 causes a boot loop.
#else  // ARDUINO_ESP32C3_DEV
const uint16_t kRecvPin = 14;
#endif  // ARDUINO_ESP32C3_DEV


// kRecvPin 

IRrecv irrecv(D6);
decode_results results;

void setup() {
//  ESP.lightSleep();

 
  bip();
  bip_servo();
  pinMode(GND, OUTPUT);      // board IR
  digitalWrite(GND, LOW);

  Serial.begin(115200);
  irrecv.enableIRIn();  // Start the receiver
  while (!Serial)  // Wait for the serial connection to be establised.
    delay(50);
  Serial.println();
  Serial.print("IRrecvDemo is now running and waiting for IR message on Pin ");
  Serial.println(kRecvPin);
}
void bip_servo(){
   servo1.attach(servoPin1);
  servo2.attach(servoPin2);
        
         servo1.write(0);
     servo2.write(0);
              delay(500);
               servo1.write(180);
     servo2.write(180);
              delay(500);

 //                servo1.detach();
 //  servo2.detach();
}
void bip(){
   // AUTOTEST les deux moteurs tournent en marche avant,
  // à haute vitesse

  //moteur 1
  vitesse = 150;
  analogWrite(moteur1A, 0);
  analogWrite(moteur1B, vitesse);
  //moteur 2
  analogWrite(moteur2A, 0);
  analogWrite(moteur2B, vitesse);
  delay(200);
  delay(200); // bip
    stopM();
}
void stopM() {
  analogWrite(moteur2A, 0);
  analogWrite(moteur2B, 0);
    analogWrite(moteur1A, 0);
  analogWrite(moteur1B, 0);

}

void moteur( int x, int v){
    switch (x){
      case 1 :
            Serial.println("Moteur 1");
            if(v>0){
                      analogWrite(moteur1A, 0);
                      analogWrite(moteur1B, v);  
            } else {
              analogWrite(moteur1B, 0);
                analogWrite(moteur1A, -v); 
            }
        break;
        case 2 :
            Serial.println("Moteur 2");
            if(v>0){
                      analogWrite(moteur2A, 0);
                      analogWrite(moteur2B, v);  
            } else {
              analogWrite(moteur2B, 0);
                analogWrite(moteur2A, -v);
                
            }

        break;
  }
}
void loop() {
/*  if ((mmm - millis()) > TEMPO){ // sommeil profond
    ESP.deepSleep(0);
  }*/
  if (irrecv.decode(&results)) {
    // print() & println() can't handle printing long longs. (uint64_t)
    serialPrintUint64(results.value, HEX);
    switch (results.value){
//-----------------------------   moteur 1 et 2 ---------------------  <<  >>

      case 0xFF02FD :
            moteur( 1,vitesse);          moteur( 2,vitesse); 
             break;
            case 0xFFC23D :
            moteur( 1,-vitesse);moteur( 2,-vitesse);
             break;
//-----------------------------   moteur 1 ou 2 ---------------------  +  -
            case 0xFF906F :
            moteur( 2,128);
            break;
                  case 0xFFA857 :
            moteur( 2,-128);
            break;
 
//----------------------  servo --------------------   : 
           case 0xFF22DD : // mp3 
           servo1.write(180);
                 servo2.write(180);
             break;
            case 0xFFE01F : // mp3
   servo1.write(0);
     servo2.write(0);
   
             break;
   }
    Serial.println("");
    irrecv.resume();  // Receive the next value
  }
  delay(500);
  stopM();
}