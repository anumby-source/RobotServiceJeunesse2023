# Utilisation de l'ESP32-CAM associé avec un bouclier ESP32-CAM-MB

## configuration initiale de l'ESP32-CAM

- mettre à jour l'Arduino-IDE avec la dernière release 2.0.3

- configurer les librairies
  - dans les préférences installer l'URL :
      - https://dl.espressif.com/dl/package_esp32_index.json
  - utiliser les gestionnaires de cartes "ESP32" (si ça n'est pas encore fait)
  - Sélectionner le gestionnaire "tools/Type de carte/ESP32 Arduino/ESP32 Wrover module"
  - Séléctionner 'Partition Scheme "Huge APP (3 MB No OTA /1MB SPIFFS)"'
  
- A partir de GitHub:
  - télecharger tout le dossier "CameraWebServer_Access_Point"
    - https://github.com/anumby-source/RobotServiceJeunesse2023/tree/main/ESP32-CAM/CameraWebServer_Access_Point
  - flasher "CameraWebServer_Access_Point.ino" 
  - ceci lance le réseau local "ESP32-CAM Access Point" avec le mot de passe "123456789"
  - faire un "reset" sur la carte ESP32-CAM

- Se connecter au réseau local "ESP32-CAM Access Point" sur le PC
- Ouvrir Chrome (ou un autre navigateur) à l'adresse: "http://192.168.4.1/"
- Ceci active le panneau de contrôle de la caméra

ou bien lancer l'application Python qui produit juste das images avec le bouton "Update"

- https://github.com/anumby-source/RobotServiceJeunesse2023/tree/main/client/canvas.py


## Différents liens 

Connection vers un Arduino:

- https://www.raspberryme.com/telecharger-le-code-sur-esp32-cam-a-laide-desp32-cam-mb-usb/

Installation MicroPython avec Thonny

- https://www.youtube.com/watch?v=Dznz81AbxgQ
- https://www.youtube.com/watch?v=7ya4PIeUBmA
- https://github.com/lemariva/micropython-camera-driver

installer micropython avec firmware pour la caméra
- https://www.youtube.com/watch?v=436VDF-rk4w

OpenCV

- https://randomnerdtutorials.com/esp32-cam-robotics-opencv-autonomous/
- https://how2electronics.com/color-detection-tracking-with-esp32-cam-opencv/
- https://how2electronics.com/esp32-cam-based-object-detection-identification-with-opencv/
- https://www.hackster.io/onedeadmatch/esp32-cam-python-stream-opencv-example-1cc205
- https://github.com/ProjectoOfficial/ESP32/blob/main/ESP32_CAM_PYTHON_STREAM_OPENCV/ESP32_CAM_PYTHON_STREAM_OPENCV.py
- https://www.youtube.com/watch?v=7qPIRBY6C8c
- https://www.youtube.com/watch?v=xjuTEowOWvo (Gesture recognition)

apprentissage pour le reconnaissance d'objets

- https://docs.opencv.org/3.4/dc/d88/tutorial_traincascade.html

WEb server avec Camera

https://randomnerdtutorials.com/esp32-cam-access-point-ap-web-server/
https://randomnerdtutorials.com/installing-esp32-arduino-ide-2-0/

Classification with tensorflow/keras

- https://www.youtube.com/watch?v=t0EzVCvQjGE
- https://github.com/NeuralNine

Flasher l'ESP32-CAM pour installer MicroPython:

- ``> esptool --chip esp32 --port COM10 -b 115200 erase_flash``
- ``> esptool --chip esp32 --port COM10 write_flash -z 0x1000 GENERIC_S2-20220618-v1.19.1.uf2``

Comment installer MicroPython avec support Caméra sur ESP32-CAM

- https://stackoverflow.com/questions/60029614/esp32-cam-stream-in-opencv-python
- https://github.com/tsaarni/esp32-micropython-webcam
- https://github.com/tsaarni/micropython-with-esp32-cam/wiki
- https://how2electronics.com/esp32-cam-based-object-detection-identification-with-opencv/
- 
