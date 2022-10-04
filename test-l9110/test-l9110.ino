/****************************************************
   Deux moteurs à courant continu contrôlés par une
   carte esp avec un module L9110S.
   
   http://electroniqueamateur.blogspot.com/2017/12/controle-de-deux-moteurs-avec-l9110s-et.html

   Version A REICHART 2022 avec esp
   
 ****************************************************/

#define moteur1A D1
#define moteur1B D2
#define moteur2A D3
#define moteur2B D4

int vitesse = 255;  // 0 à 255

void setup() {

}

void loop() {

  // les deux moteurs tournent en marche avant,
  // à haute vitesse

  //moteur 1
  vitesse = 255;
  analogWrite(moteur1A, 0);
  analogWrite(moteur1B, vitesse);
  //moteur 2
  analogWrite(moteur2A, 0);
  analogWrite(moteur2B, vitesse);
  delay(500); // on attend 0.5 secondes

  // le moteur 1 s'arrête complètement, et
  // le moteur 2 part en sens inverse à faible vitesse

    vitesse = 150;
  //moteur 1
  analogWrite(moteur1A, 0);
  analogWrite(moteur1B, 0);
  //moteur 2

  analogWrite(moteur2A, vitesse);
  analogWrite(moteur2B, 0);
  delay(1000); // on attend 1 seconde

  // le moteur 2 s'arrête complètement, et
  // le moteur 1 part en sens inverse à faible vitesse

    vitesse = 150;
  //moteur 1
  analogWrite(moteur1A, vitesse);
  analogWrite(moteur1B, 0);
  //moteur 2

  analogWrite(moteur2A, 0);
  analogWrite(moteur2B, 0);
  delay(1000); // pendant 1 seconde



}
