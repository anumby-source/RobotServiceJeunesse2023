# Une application Python pour lire les photos à partir l'ESP32-CAM et sauvegarder les images sur le PC

- installer Python (si nécessaire)
- ajouter les librairies nécessaires (si ça n'est pas déjà fait):
  - lancer "cmd.exe" sur le PC, puis exécuter:
    - ``> pip install numpy``
    - ``> pip install opencv-python``
    - ``> pip install tk``
    - ``> pip install pillow``
- télécharger l'application "canvas.py" à partir de github:
    - https://github.com/anumby-source/RobotServiceJeunesse2023/blob/main/client/canvas.py
- se connecter sur le réseau local de l'ESP32-CAM
- à partir de "cmd.exe", lancer l'application python
    - ``> python canvas.py``

![image](https://user-images.githubusercontent.com/1872702/207544681-f2de8a03-370a-4124-88c8-f6536075dd3f.png)

- Le bouton "update" parmet de rafraichir une image de l'ESP32-CAM
- Le bouton "Sauvegarder" permet de sauvegarder une image sous le nom que vous indiquez, dans un fichier au format ``*.jpg``

