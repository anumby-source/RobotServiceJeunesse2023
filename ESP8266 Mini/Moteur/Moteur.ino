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
  analogWrite(D4, LOW);
  analogWrite(D3, HIGH);

  Serial.println("loop");
  analogWrite(D2, LOW);
  analogWrite(D1, LOW);
  delay(3000);
  analogWrite(D2, LOW);
  analogWrite(D1, HIGH);
  delay(3000);
  analogWrite(D2, HIGH);
  analogWrite(D1, LOW);
  delay(3000);
  analogWrite(D2, HIGH);
  analogWrite(D1, HIGH);
  delay(3000);
}
