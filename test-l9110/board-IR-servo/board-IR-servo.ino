/*
 * Arnaud https://github.com/arnaudrco/exemples/blob/main/Telecommande-IR-servomoteur/IR-esp-mp3-board-sleep/IR-esp-mp3-board-sleep.ino
  rentrer les codes pour votre télécommande (emetteur IR)
 
 ajouter la bibliothèque IRremoteESP8266 dans outils > gérer les bibliothèque
**********************************************************
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
 *     
 *     
 *    
 *   
MISE A JOUR SUIVANT TELECOMMANDE 
FF629D haut
FFA857 bas

FFC23D droite 
FF22DD gauche

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

#define haut 0xFF629D
#define bas 0xFFA857
#define droite 0xFFC23D
#define gauche 0xFF22DD

#define GND D7


#define TEMPO 500 // temporisation 

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
unsigned long mmm;
int count=0; // nb d'impulsions IR reçues

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
  mmm = millis();
}
void bip_servo(){
   servo1.attach(servoPin1);
  servo2.attach(servoPin2);
        
         servo1.write(0);
     servo2.write(0);
              delay(500);
               servo1.write(90);
     servo2.write(90);
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
  if ((millis()- mmm) > TEMPO){ // 
    mmm= millis();
    if(count > 0 ){
      count --; 
    } else {
       stopM();
    }

  }
  if (irrecv.decode(&results)) {
        mmm= millis();
    // print() & println() can't handle printing long longs. (uint64_t)
    serialPrintUint64(results.value, HEX);
    switch (results.value){
//-----------------------------   moteur 1 et 2 ensemble ---------------------  <<  >>


      case haut :
            moteur( 1,vitesse);          moteur( 2,vitesse); count++;
             break;
      case bas :
            moteur( 1,-vitesse);moteur( 2,-vitesse);count++;
             break;
//-----------------------------   moteur 1 et 2 inversé ---------------------  +  -
       case droite :
            moteur( 1,vitesse);
            moteur( 2,-vitesse);count++;
            break;
       case gauche :
            moteur( 1,-vitesse);count++;
            moteur( 2,vitesse);
            break;
 
//----------------------  servo --------------------   : 
           case 0xFF32CD : // mp3 
           servo1.write(180);
                 servo2.write(180);
             break;
            case 0xFF30CF : // mp3
   servo1.write(0);
     servo2.write(0);
               break;
            case 0xFF2AD5 : // mp3 
           servo1.write(90);
                 servo2.write(90);
             break;

   }
    Serial.println("");
    irrecv.resume();  // Receive the next value
  }

}
