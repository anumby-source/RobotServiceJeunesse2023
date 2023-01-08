from random import *

def mm(niveau = 4, couleurs = 6):
  coup = 1
  secret_any = [str(randint(1, couleurs)) for i in range(niveau)]
  secret_no_double = sample(range(1, couleurs + 1), niveau)
  secret = secret_no_double
  print("secret=", secret)
  while True:
    code = list(secret)
    print("code=", code)
    jeu = input("Coup {} : ".format(coup))
    valeurs = list(jeu)
    if len(valeurs) != niveau: continue
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
