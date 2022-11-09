# Document de conception pour le robot ServiceJeunesse 2023

## Principe proposé

On part du jeu Qwirkle:
- https://www.ultraboardgames.com/qwirkle/game.php
- https://www.ultraboardgames.com/qwirkle/index.php

On va essayer d'implémenter un robot Qwirkle:
- le robot sait jouer contre un ou pluseurs personnes réelles
- le robot connaît les règles du jeu
- le robot reconnaît les pièces déjà jouées sur le plateau
- le robot tire les pièces de la pioche et joue en fonction des règles du jeu
- lors d'une partie normale, (2 ou plus joueurs dont le robot) chaque joueur joue à son tour normalement
- tout en restant dans une enveloppe budgétaire fixées (100-150€)
- on doit pouvoir construire 6 + 2 exemplaires durant l'année

## Eléments du plateau de jeu

Nous aurons des éléments et fonctionnalités suivants:

- des pièces sur lesquelles est visible les formes et couleurs
- pour simplifier l'impléméntation on peut se limiter à un jeu de 3 x 3 x 3 formes/couleurs (=> 27 pièces)
- un damier préfabriqué capable de recevoir les pièces jouées
- un robot proprement dit
- deux technologies de déplacement du robot sont à l'étude: une vresion pont-roulant et une version véhicule:
- dans les deux cas, le robot doit reconnaître (par caméra) les formes et les couleurs des pièces
- dans les deux cas, le robot doit saisir les pièces et les déposer sur le damier de jeu
- la technologie sélectionnée pour la saisie des pièces est un électro-aimant actionnable
- la séquence prorammable pour le robot consiste à démarrer manuellement chaque tour de jeu du robot en tant que joueur. Cette séquence se termine lorsque le robot valide ses choix de déplacements


## Etudes à lancer

- la technologie de la saisie par électro-aimant
- reconnaissance des formes et des couleurs
- fabrication du damier selon le choix de conception des pièces
- suivi et pilotage du déplacement du robot sur la grille du damier
- logiciel (règle du jeu, déplacements, reconnaissance visuelle, ...)

## Version véhicule

Le principe est que le véhicule va directement rouler su le damier

- sur le damier est tracé une grille reconnaissable par un suiveur de ligne
- le robot doit pouvoir se positionner (x, y) sur le damier sur chacone des cases du damier soit pour comprendre la pièce existante, soit pour déposer une nouvelle pièce
- la taille du damier doit être suffisante pour contenir toutes les phases de la partie
- les capteurs (caméra, et suiveur de ligne) sont situées sur la face ventrale du robot
- le pièces, quand elles sont déposées ne doivent pas dépasser en épaisseur pour laisser le véhicule rouler librementindépendants étudiant chacune des techno
- les déplacements doivent autoriser des positionnements selon un repérage 2D (ligne, colonne)
- la saisie des pièces se fait en positionnant le véhicule soit sur la réserve, soit sur un emplacement du damier


## Version pont-roulantle

Le principe consiste à construire un cadre parallélipidique dont la face supérieure fournira les rails de déplacement du robot.

- le robot est une plateforme circulant selon dans la plan horizontal formé par la partie supérieure du cadre
- la plateforme est actionnée par deux ensembles de moteurs selon les coordonnées x et y
- il faut étudier la technologie appropriée pour assurer la synchronicité des déplacements gauche/droite (x) et haut/bas (y)
- le cadre peut être construit en profilés alu vissés
- les principes de reconnaissance des formes/couleurs et du positionnement sur le damier sont identiques pour les deux versions (véhicule/pont-roulant)

## Plan d'action

Il s'agit maintenant:
- de lancer des études individuelles pour chacun des points technologiques (faisabilité, coût, durée, ...)
- on peut se répartir le travail sous forme de plusieurs prototypes indépendants
- puis on travaillera sur l'intégration finale avec les choix d'implémentation réaliste
- définir un calendrier jusqu'au mois de mai

## Discussion sur le mode pour le robot

- le positionnement caméra plus simple avec pont-roulant ?
- mais la contrainte d'obtenir un objet ludique et assemblable par les jeunes en 2 heures semble plaider pour la techno véhicule
 - la voiture a un avantage, car on a l'experience de sa fabrication.
- le pont roulant, il va falloir le concevoir, l'expérimenter, le tester, évaluer  son coût...en un temps record. (Noël). Son avantage est qu'il est plus précis dans ses déplacements.
- L'idée d'hier d'utiliser 2 moteurs d'imprimante 3D et des vis sans fin pour un déplacement x et y peut se tester rapidement. 
- quelle est  la taille du plateau de jeu ? Faut-il retenir le principe 3*3*3=27 ?  
    - La version avec 3 formes et 3 couleurs (et 3 jeux de pièces) permet:
        - à la fois un minimum de complexité
        - pas trop de complexité de fabrication (nombre de pièces)
        - contraintes mémoires limitées pour l'algo
        - 



