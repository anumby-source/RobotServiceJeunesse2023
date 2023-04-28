#include <Arduino.h>

#define D1 5 // B-1A
#define D2 4 // B-2A
#define D3 0 // A-1A
#define D4 2 // A-1B

#define D5 14 
#define D6 12 
#define D7 13 
#define D8 15 


int old_pin = 0;

void stop() {
  analogWrite(D1, LOW);
  analogWrite(D2, LOW);
  analogWrite(D3, LOW);
  analogWrite(D4, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
  pinMode(D4, OUTPUT);
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
  pinMode(D7, OUTPUT);
  pinMode(D8, OUTPUT);
}

void loop() {
int vmax = 255;
  analogWrite(D4, 0);
  analogWrite(D3, vmax);

  Serial.println("loop");
  analogWrite(D2, 0);
  analogWrite(D1, 0);
  delay(1000);
  analogWrite(D2, 0);
  for (int i = 0; i <= 255; i++) {
    analogWrite(D1, i);
  }  
  delay(1000);
  analogWrite(D2, vmax);
  analogWrite(D1, 0);
  delay(1000);
  analogWrite(D2, vmax);
  analogWrite(D1, vmax);
  delay(1000);
}
