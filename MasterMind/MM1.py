from string import ascii_uppercase
def gen_colors(code_size):
    if code_size <= 26:
        return ascii_uppercase[:code_size]
    else:
        return ascii_uppercase

from random import choice
def gen_code(code_size, colors):
    r = ''
    for _ in range(code_size):
        r += choice(colors)

def check_guess(guess, code_size, colors):
    present_colors = [ i in colors for i in guess ]
    return len( guess ) == code_size and False not in present_colors


def score_guess(code, guess):
    n_good_position = 0
    n_false_position = 0
    if len(code) == len(guess):
        for i in range(len(code)):
            if code[i] == guess[i]:
                n_good_position += 1
            elif guess[i] in code:
                n_false_position += 1

        return n_good_position, n_false_position

def play(code_size, nb_colors , nb_max = None):
    print(f'Possible colors are: {gen_colors(nb_colors)}.')
    print(f'Code size is {code_size}.')
    n = 0
    count = 0
    to_find = gen_code(code_size, gen_colors(nb_colors)) # combinaison à trouver
    L = []
    while True:
        if nb_max != None and n <= nb_max or nb_max == None:
            guess = input(f'{n} --> ').upper()
            if not check_guess(guess, code_size, gen_colors(nb_colors)):
                print('Mauvaise taille ou couleur...')
            elif  guess in L:
                print('Proposition déjà faite avant...')
            elif guess != to_find:
                print( score_guess(to_find, guess) )
                L.append( guess )
                n += 1
            else:
                print( f'Félicitations, vous avez trouvé après {n+1} essais!' )
                break
        else:
            print(f'Il fallait trouver: {to_find}')
            break


