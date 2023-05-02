#include <Arduino.h>

#define D3 0
#define D4 2
#define D7 13 
#define D8 15 

#define D6 12  // B-2A vert pont H pour le moteur Droite
#define D5 14  // B-1A jaune

#define D2 4   // A-1B vert pont H pour le moteur Gauche (B)
#define D1 5   // A-1A jaune

#define D 1   // moteur Droite (A)
#define G 2   // moteur Gauche (B)


int old_pin = 0;
int vmax = 255;

void stop() {
  analogWrite(D1, LOW);  // moteur B
  analogWrite(D2, LOW);
  analogWrite(D5, LOW);  // moteur B
  analogWrite(D6, LOW);
}

void avance(int moteur, int v) {
  if (moteur == D) {
    analogWrite(D5, 0);
    analogWrite(D6, v);
  }
  else {
    analogWrite(D1, 0);
    analogWrite(D2, v);
  }
}

void recule(int moteur, int v) {
  if (moteur == D) {
    analogWrite(D5, v);
    analogWrite(D6, 0);
  }
  else {
    analogWrite(D1, v);
    analogWrite(D2, 0);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
}


void loop() {

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


  // on avance les 2 moteurs à la même vitesse
  // avance(A, vmax);
  // avance(B, vmax);

  /*
  delay(3000);

  // on recule les 2 moteurs à la même vitesse
  recule(A, vmax);
  recule(B, vmax);

  delay(3000);

  // on avance pour tourner vers le moteur B
  avance(A, 255);
  avance(B, 100);

  delay(3000);

  // on avance pour tourner vers le moteur A
  avance(A, 100);
  avance(B, 255);

  delay(3000);

  // rampe
  for (int i = 0; i <= 255; i++) {
    avance(A, i);
    avance(B, i);
    delay(5);
  }
  */
}
