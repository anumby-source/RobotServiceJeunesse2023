from random import *

def mm(niv = 4, coul = 6):
  coup = 1
  secret = [str(randint(1,coul)) for i in range(niv)]
  print("secret=", secret)
  while True:
    code = list(secret)
    print("code=", code)
    jeu = input("Coup {} : ".format(coup))
    valeurs = list(jeu)
    if len(valeurs) != niv: continue
    coup += 1
    trouvés, existent = 0, 0

    for i, valeur in enumerate(valeurs):
         if valeur == code[i]:
             # la valeur est correcte et est à la bonne place
             trouvés += 1
             valeurs[i] = "!"
             code[i] = "*"

    if trouvés == 4:
        print("GAGNE ! coups=", coup)
        return

    for i, valeur in enumerate(valeurs):
         if valeur in code:
             # la valeur existe mais n'est pas à la bonne place
              existent += 1
              code[code.index(valeur)] = "*"
    print("Trouvés: {}, Existent: {}".format(trouvés, existent))


mm()
