
/*

Logique événementielle:

mode initial "observation"

1) mousemouve:
    si mode "observation":
      on détecte si on est sur une tuile d'un joueur => on marque (u, position, tuile) = UPD
    si mode "déplacement":
      - efface la tuile en mouvement
      - redessine la tuile en mouvement = la nouvelle position

2) mousedown:
    si mode "observation":
      si on a UPD alors on passe en mode deplacement de la tuile marquée:
        - remplacement de la tuile à la position marquée par une tuileVide
        - mode "déplacement"

2) mouseup:
    si mode "déplacement":
      si on a UPD :
        - vérification que l'on est sur une cellule valide selon les règles du jeu
            - si valide:
              - installation de la tuile sur la grille
            - sinon:
              - réinstallation de la tuile à la position marquée du joueur
        - mode "observation"

*/

// Constantes générales et accesseurs

const canvas = document.getElementById('canvas');
let cellSize = 20;

function getCellSize() {
  return cellSize;
}

function getCellSize2() {
  return cellSize/2;
}

function offsetJeu() {
  return 5 * getCellSize();
}

function yoffsetCommandes() {
  return 5;
}

function yoffsetJoueurs() {
  return 2 * getCellSize();
}

function margin() {
  return getCellSize()*0.1;
}

const ctx = canvas.getContext('2d');

// Définition de la classe pour la zone d'info
let infos = [];
function info (text) {
  let cell = getCellSize();
  let xoffset = 0;
  let yoffset = yoffsetJoueurs() + (Jeu.working.cmax + 6) * cell;

  if (text) {
    let lines = (canvas.height - yoffset)/cell;
    if (infos.length < lines) {
    }
    else {
      infos.splice(0, 1);
    }
    infos.push(text);
  }

  for (let line = 0; line < infos.length; line++) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.fillRect(0, yoffset - cell + line*cell, canvas.width, cell);
      ctx.fill();

      ctx.fillStyle = 'red';
      ctx.font = '20px san-serif';
      ctx.fillText(infos[line], 0, yoffset  + line*cell);
  }
}

class Evenement {
  constructor(position, tuile, c, r) {
    // console.log("Evenement", position, tuile, c, r);
    this.position = position;
    this.tuile = tuile;
    this.c = c;
    this.r = r;
  }
}

// Définition de la classe pour les utilisateurs
class User {
  constructor(numéro, name) {
    this.numéro = numéro;
    this.name = name;
    this.jeu = [];
    for (let t = 0; t < 6; t++) this.jeu.push(TuileVide);
    this.poubelle = [];
    for (let t = 0; t < 6; t++) this.poubelle.push(TuileVide);
    this.partie = [];
    this.historique = [];
  }

  draw() {
    let cell = getCellSize();

    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * cell;

    ctx.fillStyle = 'green';
    ctx.font = '30px san-serif';
    ctx.fillText(this.name, 0, yoffset + cell);

    for (let c = 0; c < 6; c++)
    {
      let t = this.jeu[c];
      // console.log(t, "xoffset=", xoffset + c*cell, yoffset, c);
      TuileDraw(t, xoffset + c*cell, yoffset);
    }

    let poubelles = 0;
    for (let t = 0; t < 6; t++) {
      if (!TuileTestVide(this.poubelle[t])) poubelles++;
    }

    TuileDraw(TuilePoubelle, xoffset + 7*cell, yoffset);
    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("[" + poubelles + "]", xoffset + 8.5*cell, yoffset + 0.7 * cell);
  }

  play() {
    let cell = getCellSize();
    // offset pour positionner les utilisateurs après la grille
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * cell;

    for (let t = 0; t < 6; t++) {
      let n = Jeu.pioche[0];
      Jeu.pioche.splice(0, 1);
      //console.log('User:play> ', n);

      let tuile = Jeu.tuiles[n];
      // console.log('play> tuile=', tuile);
      TuileShow(tuile);

      this.jeu[t] = tuile;

      let x = xoffset + t*cell;
      let y = yoffset;
      // console.log('play> tuile=', tuile, TuileGetForme(tuile), TuileGetColor(tuile), x, y);
      TuileDraw(tuile, x, y);
    }
    // console.log('play> pioche=', Jeu.pioche.length);
  }

  undo() {
    // console.log("User:undo>")

    for (let h = 0; h < this.historique.length; h++) {
      let histo = this.historique[h];

      let c = histo.c + Jeu.working.c0;
      let r = histo.r + Jeu.working.r0;
      let i = Jeu.working.index(c, r);

      // console.log("User:undo>", histo, Jeu.working.c0, Jeu.working.r0, c, r, i);

      this.jeu[histo.position] = histo.tuile;
      Jeu.working.grid.setElement(c, r, TuileVide)
    }
  }

  ok() {
    let histo = [];
    for (let h = 0; h < this.historique.length; h++) histo.push(this.historique[h]);
    this.partie.push(histo);
    this.historique = [];
    let hasPoubelle = false;
    for (let p = 0; p < 6; p++) {
      this.poubelle[p]
      if (!TuileTestVide(this.poubelle[p])) {
        hasPoubelle = true;
        break;
      }
    }
    this.pioche();

    if (hasPoubelle) {
      Jeu.extendPioche(this.poubelle);      // on va rajouter la tuiles de la poubelle dans la pioche
      for (let p = 0; p < 6; p++) {
        this.poubelle[p] = TuileVide;
      }
      // console.log("has poubelle>");
    }

  }

  addPoubelle(position) {
    // console.log("User:addPoubelle>", position, this.jeu);
    let t = this.jeu[position];
    if (!TuileTestVide(t)) {
      this.poubelle[position] = t;
      this.jeu[position] = TuileVide;
      // console.log("User:addPoubelle>", position, this.jeu, this.poubelle);
    }

    clear();
  }

  findUCell(x, y) {
    let cell = getCellSize()
    let usersXoffset = offsetJeu();
    let usersYoffset = yoffsetJoueurs();
    let usersXmax = usersXoffset + 6 * cell;
    let usersYmax = usersYoffset + cell;

    if (x >= usersXoffset && x <= usersXmax && y >= usersYoffset && y <= usersYmax) {
      let tuileIndice = Math.floor((x - usersXoffset)/cell);
      // console.log ("UserGrille::findUCell> in", tuileIndice);
      return tuileIndice;
    }
    return -1;
  }

  findUPoubelle(x, y) {
    let cell = getCellSize();
    let usersXoffset = offsetJeu() + 7 * cell;
    let usersYoffset = yoffsetJoueurs();
    let usersXmax = usersXoffset + cell;
    let usersYmax = usersYoffset + cell;

    if (x >= usersXoffset && x <= usersXmax && y >= usersYoffset && y <= usersYmax) {
      // console.log ("UserGrille::findUPoubelle> in");
      return true;
    }
    return false;
  }

  selectTuile(tuileIndice) {
    let cell = getCellSize();
    let x = offsetJeu() + tuileIndice * cell;
    let y = yoffsetJoueurs() + 2 * this.numéro * cell;

    // on sauvegarde la tuile
    let savedTuile = this.jeu[tuileIndice]
    // on va enlever la tuile du jeu de cet utilisateur
    //this.jeu[tuileIndice] = TuileVide;

    // console.log("selectTuile>", "tuile=", tuileIndice, "user=", this.numéro, "savedtuile=", savedTuile);

    // TuileDraw(TuileVide, x, y);

    // TuileDraw(this.jeu[savedTuile], x, y);

    /*
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.fillRect(xoff + tuile*cell, yoff, cell, cell);
    ctx.fill();
    */

  }

  pioche() {
    let cell = getCellSize();
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * cell;

    for (let t = 0; t < 6; t++) {
      let tuile = this.jeu[t];
      if (TuileTestVide(tuile)) {
        let n = Jeu.pioche[0];
        Jeu.pioche.splice(0, 1);
        //console.log('User:play> ', n);

        let tuile = Jeu.tuiles[n];
        //console.log('play> tuile=', tuile);

        this.jeu[t] = tuile;

        let x = xoffset + t*cell;
        let y = yoffset;
        //console.log('play> tuile=', tuile, tuile.forme, tuile.color, x, y);
        TuileDraw(tuile, x, y);
      }
    }
  }

  addEvenement(position, tuile, c, r) {
    this.historique.push(new Evenement(position, tuile, c, r));
  }
}

// définition d'une classe générique pour manipuler une matrice 2D extensible
class Matrix {
  /*
     matrix[columns=2, rows=3] = ((c0, r0), (c1, r0),
                                  (c0, r1), (c1, r1),
                                  (c0, r2), (c1, r2))
  */

  constructor() {
    this.columns = 0;
    this.rows = 0;
    this.elements = [];
  }

  vide() {
    if (this.elements.length == 0) return true;
    for (let i = 0; i < this.elements.length; i++) {
      let t = this.elements[i];
      if (!TuileTestVide(t)) return false;
    }
    return true;
  }

  zeros(columns, rows) {
    this.columns = columns;
    this.rows = rows;
    for (let c = 0; c < this.columns; c++)
      for (let r = 0; r < this.rows; r++) this.elements.push(0);
  }

  fill(columns, rows, element) {
    this.columns = columns;
    this.rows = rows;
    for (let c = 0; c < this.columns; c++)
      for (let r = 0; r < this.rows; r++) this.elements.push(element);
  }

  fillNumbers(columns, rows, offset) {
    this.columns = columns;
    this.rows = rows;
    let n = 0;
    for (let c = 0; c < this.columns; c++)
      for (let r = 0; r < this.rows; r++) {
        this.elements.push(n + offset);
        n++;
      }
  }

  random(columns, rows) {
    this.columns = columns;
    this.rows = rows;
    for (let c = 0; c < this.columns; c++)
      for (let r = 0; r < this.rows; r++) this.elements.push(Math.random());
  }

  show(title) {
    console.log(title + "[" + this.columns + "," + this.rows + "]");
    for (let r = 0; r < this.rows; r++) {
      let t = "r=" + r + " [";
      for (let c = 0; c < this.columns; c++) {
        let i = this.index(c, r);
        let o  = this.elements[i];
        let to = "";
        if (o.toText()) {
          to = o.toText();
        }
        else {
          to = o;
        }
        t += to + ", "
      }
      t += "]";
      console.log(title, t);
    }
  }

  index(column, row) {
    if (column < 0 || column >= this.columns) return -1;
    if (row < 0 || row >= this.rows) return -1;
    return row*this.columns + column;
  }

  getElement(column, row) {
    let i = this.index(column, row);
    if (i >= 0) return this.elements[i]
    let e;
    return e;
  }

  setElement(column, row, element) {
    let i = this.index(column, row);
    if (i >= 0) this.elements[i] = element;
  }

  insert(other, column, row) {
    // la matrix other sera copiée à la position (column, row) sur this
    // this ne change pas de taille
    // => si la copie de other déborde, on ignore le débordement
    if (column < 0 && column >= this.columns) return;
    if (row < 0 && row >= this.rows) return;

    for (let co = 0; co < other.columns; co++) {
      for (let ro = 0; ro < other.rows; ro++) {
        let e = other.getElement(co, ro);
        let c = column + co;
        let r = row + ro;
        let i = this.index(c, r);
        //console.log("insert> ", "co=", co, "ro=", ro, "e=", e, "c=", c, "r=", r, "i=", i);
        if (i >= 0) {
          this.elements[i] = e;
          //this.show("---m1>");
        }
      }
    }
  }

  extend(columns, rows, element) {
    // ajoute columns rows tout autour de la matrice
    // => this.columns += 2*columns
    // => this.rows += 2*rows
    let other = new Matrix ();
    other.fill(this.columns + 2*columns, this.rows + 2*rows, element);
    other.insert(this, columns, rows);
    return other;
  }
}

// Une fonction de test pour tester la classe Matrix
function tm() {
  /*
  m1 = new Matrix ();
  m1.fillNumbers(3, 4, 0);
  m1.show("m1")

  m2 = new Matrix ();
  m2.fillNumbers(4, 2, 100);
  m2.show("m2")

  m1.insert(m2, 1, 1);
  m1.show("m1")
  */

  let m1 = new Matrix ();
  m1.fillNumbers(3, 4, 0);
  m1.show("m1")

  m1 = m1.extend(1, 1, 111)
  m1.show("o")
}

// Définition de la classe pour la grille de travail dans laquelle on manipule les tuiles du jeu
class WorkingGrille {
  constructor() {
    this.cmin = 0;
    this.cmax = 2;
    this.rmin = 0;
    this.rmax = 2;
    this.c0 = 1; // position(c) relative de la cellule de départ
    this.r0 = 1; // position(r) relative de la cellule de départ

    this.grid = new Matrix();
    this.grid.fill (3, 3, TuileVide);
    this.first = true;
  }

  draw() {
    let cell = getCellSize();
    let xoffset = 0;
    let yoffset = yoffsetJoueurs() + 2 * Users.length * cell;
    for (let c = this.cmin; c <= this.cmax; c++)
      for (let r = this.rmin; r <= this.rmax; r++) {
          let tuile = this.grid.getElement(c - this.cmin, r - this.rmin);
          if (tuile) {
            let x = xoffset + c*cell;
            let y = yoffset + r*cell;
            //console.log("WorkingGrille:draw>", x, y, tuile);
            TuileDraw(tuile, x, y);
          }
      }
  }

  findWCell(x, y) {
    let cell = getCellSize();
    let workingXoffset = 0;
    let workingYoffset = yoffsetJoueurs() + 2 * Users.length * cell;
    let workingXmax = workingXoffset + (this.cmax + 1)*cell;
    let workingYmax = workingYoffset + (this.rmax + 1)*cell;

    if (x >= workingXoffset && x <= workingXmax && y >= workingYoffset && y <= workingYmax) {

      // console.log ("WorkingGrille::findWCell> in", x, y, workingXoffset, workingXmax, workingYoffset, workingYmax);

      x -= workingXoffset;
      y -= workingYoffset;
      let c = Math.floor(x/cell);
      let r = Math.floor(y/cell);
      // console.log("WorkingGrille:findWCell> cellule=", c, r);
      Jeu.cSelected = c;
      Jeu.rSelected = r;

      return true;
    }
    return false;
  }

  drawCellFrame(c0, r0, color) {
    let cell = getCellSize();
    let workingXoffset = 0;
    let workingYoffset = yoffsetJoueurs() + 2 * Users.length * cell;
    let workingXmax = workingXoffset + (this.cmax + 1)*cell;
    let workingYmax = workingYoffset + (this.rmax + 1)*cell;

    for (let c = c0; c <= c0 + 1; c++)
    {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(workingXoffset + c*cell, workingYoffset + r0*cell);
      ctx.lineTo(workingXoffset + c*cell, workingYoffset + (r0+1)*cell);
      ctx.stroke();
      for (let r = r0; r <= r0 + 1; r++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(workingXoffset + c0*cell, workingYoffset + r*cell);
        ctx.lineTo(workingXoffset + (c0+1)*cell, workingYoffset + r*cell);
        ctx.stroke();
      }
    }
  }
  /*
    grille autour de p0 = (c0=10, r0=5)

    [(9, 4), (10, 4), (11, 4),
     (9, 5), (10, 5), (11, 5),
     (9, 6), (10, 6), (11, 6)]

     cmin = 9
     cmax = 11
     rmin = 4
     rmax = 6
     w = 3
     h = 3
     index(9, 4) = 0
     index(10, 4) = 1
     index(11, 4) = 2
     index(9, 5) = 3  w*(r - rmin) + (c - cmin)

  */

  width(){
    return this.cmax - this.cmin + 1;
  }

  height(){
    return this.rmax - this.rmin + 1;
  }

  // calcule l'index correspondant à la coordonnée [C, R] dans la grille de travail
  index(column, row) {
    // s'il y a une seule tuile => (cmin = c0 - 1, cmax = c0 + 1)

    // on est juste au bord de la zone de travail
    if (column == this.cmin && row == this.rmin) return -1; // Haut/Gauche
    if (column == this.cmin && row == this.rmax) return -2; // Bas/Gauche
    if (column == this.cmax && row == this.rmin) return -3; // Haut/Droite
    if (column == this.cmax && row == this.rmax) return -4; // Bas/Droite

    if (column == this.cmin) return -5; // Gauche
    if (column == this.cmax) return -6; // Droite
    if (row == this.rmin) return -7; // Haut
    if (row == this.rmax) return -8; // Bas

    // on est complètement en dehors de la zone de travail
    if (column < this.cmin || column > this.cmax) return -10;
    if (row < this.rmin || row > this.rmax) return -10;

    let i = this.grid.index(column - this.cmin, row - this.rmin);
    return i;
  }

  // teste si la case contient une cellule vide
  vide(column, row){
    let i = this.index(column, row);
    return (i < 0) || TuileTestVide(this.grid.elements[i]);
  }

  // teste si la case dans la grille de travail est de même type (forme, color)
  sameType(column, row, forme, color){
    let i = this.index(column, row);
    if (i < 0) return false;
    let tuile = this.grid.elements[i];
    return (i >= 0) && (TuileGetForme(tuile) == forme || TuileGetColor(tuile) == color);
  }

  // application des règles du jeu
  checkRules(tuile, column, row) {
    // retourne false si l'on ne peut pas utiliser cette case selon les règles
    //
    // la première fois => OK
    // si la case est occupée par une tuile => BAD
    // si la case est isolée (Gauche, Droite, Haut, Bbas) => BAD

    info("------------ check rules ---------- c=" + column + " r=" + row);

    //info("chekrules> test first");
    if (this.grid.vide()) {
      info("first");
      return true;
    }

    //info("chekrules> test intérieur de la zone");
    if (column < this.cmin || column > this.cmax) {
      info("extérieur de la zone");
      return false;
    }
    if (row < this.rmin || row > this.rmax) {
      info("extérieur de la zone");
      return false;
    }

    //info("chekrules> test si la case est déjà occupée");
    let index = this.index(column, row);
    if (index > 0) {
      let t = this.grid.elements[index];
      if (!TuileTestVide(t)) {
        info("la case est déjà occupée");
        return false;
      }
    }

    //info("chekrules> test case isolée");
    if (this.vide(column-1, row) && this.vide(column+1, row) && this.vide(column, row-1) && this.vide(column, row+1)) {
      info("case isolée");
      return false;
    }

    let GD = ["à gauche", "à droite"];
    let HB = ["en haut", "en bas"];

    for (let dc = 0; dc < 2; dc++) {
      let c = column + 2*dc - 1;
      if (!this.vide(c, row)) {
        info("case c=" + c + " non vide");
        if (!this.sameType(c, row, TuileGetForme(tuile), TuileGetColor(tuile))) {
          info("case voisine différente " + GD[dc]);
          return false;
        }
        else info("même type");
      }
    }

    info("case voisines GD semblables ou vides ");

    for (let dr = 0; dr < 2; dr++) {
      let r = row + 2*dr - 1;
      if (!this.vide(column, r)) {
        info("case r=" + r + " non vide");
        if (!this.sameType(column, r, TuileGetForme(tuile), TuileGetColor(tuile))) {
          info("case voisine différente " + HB[dr]);
          return false;
        }
        else info("même type");
      }
    }

    info("case voisines HB semblables ou vides ");

    for (let dc = 0; dc < 2; dc++) {
      let c = column + 2*dc - 1;
      let c1 = column + 4*dc - 2;
      if (!this.vide(c, row)) {
        info("case c=" + c + " non vide");
        if (this.sameType(c, row, TuileGetForme(tuile), TuileGetColor(tuile)))
          if (!this.vide(c1, row)) {
            info("case c=" + c1 + " non vide");
            if (!this.sameType(c1, row, TuileGetForme(tuile), TuileGetColor(tuile))) {
              info("case voisine +2 différente " + GD[dc]);
              return false;
            }
          }
      }
    }

    info("case voisines GD +2 semblables ou vides ");

    for (let dr = 0; dr < 2; dr++) {
        let r = row + 2*dr - 1;
        let r1 = row + 4*dr - 2;
        if (!this.vide(column, r) && this.sameType(column, r, TuileGetForme(tuile), TuileGetColor(tuile)) &&
            !this.vide(column, r1) && !this.sameType(column, r1, TuileGetForme(tuile), TuileGetColor(tuile))) {
          info("case voisine +2 différente " + HB[dr]);
          return false;
        }
    }

    info("case voisines HB +2 semblables ou vides ");

    // on va tester si les lignes supportées par la case courante sont conformes
    // c'est-à-dire qu'il n'y a pas de doublon

    for (let coord = 0; coord < 2; coord++) {
      // coord = 0 pour les lignes horizontales
      // coord = 1 pour les lignes verticales
      info("coord = " + coord);
      for (let d = 0; d < 2; d++) {
        // d = 0 pour parcourir à gauche/en haut
        // d = 1 pour parcourir à droite/en bas
        let formes = [TuileGetForme(tuile)];
        let colors = [TuileGetColor(tuile)];
        let mode;
        let doc;
        for (let position = 1; position < 6; position++) {
          let i;
          if (coord == 0) {
            // on travaille sur un row donné et la column varie
            doc = GD[d];
            let c = column + position*(2*d - 1);
            info("Ligne " + doc + " coord=" + coord + " c=" + c + " r=" + row);
            if (this.vide(c, row)) {
              break;
            }
            i = this.index(c, row);
          }
          else {
            // on travaille sur une colonne donnée et le row varie
            doc = HB[d];
            let r = row + position*(2*d - 1);
            info("Ligne " + doc + " coord=" + coord + " c=" + column + " r=" + r);
            if (this.vide(column, r)) {
              break;
            }
            i = this.index(column, r);
          }

          let t = this.grid.elements[i];
          if ((TuileGetForme(t) != TuileGetForme(tuile)) && (TuileGetColor(t) != TuileGetColor(tuile))) {
            info("A la ligne " + doc + " n'est pas conforme len=" + formes.length + " : ni forme ni color conforme");
            return false;
          }

          // ici, on a une conformité soit sur les formes soit sur les couleurs
          // on mémorise la conformité dans la variable mode

          if (position == 1) {
            if (TuileGetForme(t) == TuileGetForme(tuile)) {
              mode = "forme";
            }
            else {
              mode = "color";
            }
          }

          if (mode == "forme") {
            // mode formes
            if (TuileGetForme(t) != TuileGetForme(tuile)) {
              info("B la ligne " + doc + " n'est pas conforme len=" + formes.length);
              return false;
            }
            let i = colors.indexOf(TuileGetColor(t));
            if (i > -1) {
              info("C la ligne " + doc + " n'est pas conforme len=" + formes.length);
              return false;
            }
            colors.push(TuileGetColor(t));
          }
          else {
            // mode color
            if (TuileGetColor(t) != TuileGetColor(tuile)) {
              info("D la ligne " + doc + " n'est pas conforme len=" + colors.length);
              return false;
            }
            let i = formes.indexOf(TuileGetForme(t));
            if (i > -1) {
              info("E la ligne " + doc + " n'est pas conforme len=" + colors.length);
              return false;
            }
            formes.push(TuileGetForme(t));
          }
        }
        info("F la ligne " + doc + " est conforme len=" + formes.length);
      }
    }

    /*
    - il faut commencer à mémoriser la liste des tuiles jouées lors du tour courant pour le joueur
    - une tuile qu n'est pas la première de la liste du tour courant doit faire partie d'une "ligne" puis toutes les
      tuiles suivantes doivent appartenir à la même ligne définie dès la deuxième tuile du tour

    - on devrait commencer à accumuler les points du tour courant.
    */

    return true;


    info("chekrules> ...");
    return false;
  }

  // ajoute une tuile sur la grille de travail éventuellement avec agrandissement de la zone de travail
  // cette zone de travail est dessinée librement sur la grille dur plateau de jeu
  addTuile(tuile, column, row) {
    if (this.first) {
      // console.log("WorkingGrille:addTuile>", column, row, tuile);
      // Première fois du jeu
      this.cmin = 0;
      this.cmax = 2;
      this.rmin = 0;
      this.rmax = 2;
      this.c0 = 1;
      this.r0 = 1;
      this.grid.fill(3, 3, TuileVide);
      // console.log("WorkingGrille:addTuile>", column, row, tuile);
      this.grid.setElement(1, 1, tuile);
      this.first = false;

      return [column, row];
    }

    // on suppose que la tuile que l'on ajoute va être ajoutée contre une tuile existante dans la grille
    // donc l'augmentation de taille ne peut être que de "1" lorsque la tuile sera ajoutée sur le bord
    // par ailleurs, on s'arrange pour que la grille de travail soit plus large de 1 tout autour de la zone
    // contenant des tuiles déjà jouées
    let i = this.index(column, row);
    // console.log("WorkingGrille:addTuile>", column, row, i, tuile);

    if (i >= 0) {
      // La tuile est ajoutée sans changement de taille de la grille de travail
      this.grid.elements[i] = tuile;
      return [column, row];
    }

    // on doit augmenter la grille de travail
    let oldW = this.width();
    let oldH = this.height();
    let dw = 0;
    let dh = 0;
    let c = 0;
    let r = 0;

    // les différents d'augmentation
    switch (i) {
      case -1: // Haut/Gauche
            this.cmin -= 1;
            this.rmin -= 1;
            dw = 1;
            dh = 1;
            c = 1;
            r = 1;
            break;
      case -2: // Bas/Gauche
            this.cmax += 1;
            this.rmax += 1;
            dw = 1;
            dh = 1;
            c = 1;
            r = 0;
            break;
      case -3: // Haut/Droite
            this.rmin -= 1;
            this.rmin -= 1;
            dw = 1;
            dh = 1;
            c = 0;
            r = 1;
            break;
      case -4: // Bas/Droite
            this.rmax += 1;
            this.rmax += 1;
            dw = 1;
            dh = 1;
            c = 0;
            r = 0;
            break;
      case -5: // Gauche
            this.cmin -= 1;
            dw = 1;
            c = 1;
            r = 0;
            break;
      case -6: // Droite
            this.cmax += 1;
            dw = 1;
            c = 0;
            r = 0;
            break;
      case -7: // Haut
            this.rmin -= 1;
            dh = 1;
            c = 0;
            r = 1;
            break;
      case -8: // Bas
            this.rmax += 1;
            dh = 1;
            c = 0;
            r = 0;
            break;
    }

    // console.log("WorkingGrille:addTuile> need to extend", column, row, "oldW=", oldW, "oldH=", oldH, "i=", i, "dh=", dh, "dw=", dw, "c=", c, "r=", r);

    // on crée une nuvelle de grille de travail, agrandie
    // l'ancienne sera "insérée" sur la nouvelle à la position calculée précédemment
    let newgrid = new Matrix();
    newgrid.fill(oldW + dw, oldH + dh, TuileVide);
    newgrid.insert(this.grid, c, r);
    // this.grid.show("old");
    // newgrid.show("new");
    this.grid = newgrid;

    // on installe la tuile à la bonne position dans la nouvelle grille de travail
    i = this.index(column, row);
    // console.log("WorkingGrille:addTuile> after extend", column, row, i, tuile);
    if (i >= 0) this.grid.elements[i] = tuile;
    // this.grid.show("new installed");

    // console.log("addTuile> check position de la zone après extend " + " cmin=" + this.cmin + " cmax=" + this.cmax + " rmin=" + this.rmin + " rmax=" + this.rmax);

    if (this.cmin < 0 || this.rmin < 0) {
      // on ajoute une ligne en haut ou/et une ligne à gauche
      let width = this.cmax - this.cmin;
      let height = this.rmax - this.rmin;

      if (this.cmin < 0) {
        this.c0 += 1;
        column += 1;
      }
      if (this.rmin < 0) {
        this.r0 += 1;
        row += 1;
      }

      this.cmin = 0;
      this.cmax = width;

      this.rmin = 0;
      this.rmax = height;

      // console.log("addTuile> " + " cmin=" + this.cmin + " cmax=" + this.cmax + " rmin=" + this.rmin + " rmax=" + this.rmax, "c0=", this.c0, "r0=", this.r0, "c=", column, "r=", row);
    }
    return [column, row];
  }
}

class PanneauCommandes {
  constructor() {
  }

  findCommande(x, y) {
    let cell = getCellSize();
    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();
    let commandesXmax = commandesXoffset + 5*(cell + 7);
    let commandesYmax = commandesYoffset + cell;

    if (x >= commandesXoffset && x <= commandesXmax && y >= commandesYoffset && y <= commandesYmax) {
      let commande = Math.floor((x - commandesXoffset)/(cell + 7));
      // console.log ("Jeu::findCommande> in", commande);
      return true;
    }
    return false;
  }

  draw() {
    let cell = getCellSize();

    // console.log("PanneauCommandes:draw", Jeu.pioche.length);

    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();

    let x;
    let y;

    let commandes = [TuileZoomin, TuileZoomout, TuileUndo, TuileOk];
    for (let c = 0; c < commandes.length; c++) {
      x = commandesXoffset + c*(cell + 7);
      y = yoffsetCommandes();
      let commande = commandes[c];
      // console.log("commande=", commande, x, y);
      // TuileShow(commande);
      TuileDraw(commande, x, y);
    }

    x += 2 * cellSize;
    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("pioche " + Jeu.pioche.length , x + cell*0.3, y + cell*0.7);
  }

  executeCommande(e) {
    let cell = getCellSize();
    let x = e.clientX - 8;
    let y = e.clientY - 8;

    // [TuileZoomin, TuileZoomout, TuileUndo, TuileOk];

    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();
    let commandesXmax = commandesXoffset + 5*(cell + 7);
    let commandesYmax = commandesYoffset + cell;


    let xc = commandesXoffset;
    let yc = commandesYoffset;
    if ((x >= commandesXoffset) && (x <= commandesXoffset + 5*(cell + 7)))
      if ((y >= commandesYoffset) && (y <= commandesYoffset + cell)) {
        let commande = Math.floor((x - commandesXoffset)/(cell + 7));
        // console.log("executeCommande> x=" + x + " commande=" + commande);
        switch (commande) {
          case 0:
            // zoomin
            cellSize = cell + 5;
            break;
          case 1:
            // zoomout
            console.log("zoomout", cell);
            cellSize = cell - 5;;
            break;
          case 2:
            // undo
            Users[0].undo();
            break;
          case 3:
            // ok
            Jeu.ok();
            break;
        }
        clear();
      }
  }
}

class PlateauJeu {
  constructor() {
    // Le jeu complet des 6x6x3 tuiles à disposition
    this.tuiles = [];

    // La pioche initialisée avec une copie aléatoire des 108 tuiles
    this.pioche = [];

    // Le plateau visible où est dessiné une grille
    this.grille = [];

    this.userSelected;
    this.positionSelected;
    this.poubelleSelected = false;
    this.tuileSelected;
    this.cSelected;
    this.rSelected;

    // this.modes = ["observation", "déplacement"];
    this.mode = "observation";

    // On considère une grille de travail dont la taille va augmenter au cours du jeu
    // cette grille contient exactement toutes les tuiles qui ont été jouées plus une marge de 1 tout autour
    this.working = new WorkingGrille();

    this.commandes = new PanneauCommandes();

    this.init();
  }

  getMode() {
    return this.mode;
  }

  setMode(mode) {
    this.mode = mode;
  }

  initPioche() {
    // initialisation de la pioche par tirage aléatoire des tuiles
    let numbers = [];
    // on crée un tableau ne contenant que les indices
    for (let t = 0; t < this.tuiles.length; t++) {
       numbers.push(t);
    }

    // puis, on tire aléatoirement ces indices, que l'on va utiliser pour les tuiles
    // correspondantes
    // apès chaque tirage, on élimine l'indice de cette liste.
    // En utilisant cet indice on remplit une liste complète des tuiles, pour en faire la pioche
    // pour choisir dans la pioche, il suffit à chaque fois de prendre le premier élément
    // et le supprimer de la liste.

    for (let t = 0; t < this.tuiles.length; t++) {
      // on tire
      let index = Math.floor(Math.random() * numbers.length);
      let n = numbers[index];
      //console.log("PlateauJeu:init> index=", index, "n=", n, numbers);
      numbers.splice(index, 1);
      //console.log("PlateauJeu:init> ", numbers);
      this.pioche.push(n);
    }
  }

  extendPioche(tuiles) {
    // initialisation de la pioche par tirage aléatoire des tuiles
    let tuile;
    let numbers = [];
    // on crée un tableau ne contenant que les indices
    for (let t = 0; t < this.pioche.length; t++) {
       numbers.push(t);
    }
    let t = this.pioche.length;
    for (let i = 0; i < tuiles.length; i++) {
      tuile = tuiles[i]
      if (!TuileTestVide(tuile)) {
        numbers.push(t);
        t++;
      }
    }

    // console.log("extendPioche>", "pioche.length=", this.pioche.length, "numbers.length=", numbers.length, tuiles);

    // puis, on tire aléatoirement ces indices, que l'on va utiliser pour les tuiles
    // correspondantes
    // apès chaque tirage, on élimine l'indice de cette liste.
    // En utilisant cet indice on remplit une liste complète des tuiles, pour en faire la pioche
    // pour choisir dans la pioche, il suffit à chaque fois de prendre le premier élément
    // et le supprimer de la liste.

    let newPioche = [];

    for (let i = 0; i < tuiles.length; i++) {
      tuile = tuiles[i]
      if (!TuileTestVide(tuile)) {
        this.pioche.push(tuile);
      }
    }
    for (let t = 0; t < this.pioche.length; t++) {
      // on tire
      let index = Math.floor(Math.random() * numbers.length);
      let n = numbers[index];
      //console.log("PlateauJeu:init> index=", index, "n=", n, numbers);
      numbers.splice(index, 1);
      //console.log("PlateauJeu:init> ", numbers);
      newPioche.push(n);
    }

    this.pioche = [];
    for (let t = 0; t < newPioche.length; t++) {
      tuile = newPioche[t];
      this.pioche.push(tuile);
    }
  }

  init() {
    // création de toutes les 3 x 6 x 6 tuiles ordonnées
    for (let layer = 0; layer < 3; layer++)
        for (let color = 0; color < 6; color++) {
          for (let forme = 0; forme < 6; forme++) {
            let t = TuileId(color, forme, layer);
            //console.log(color, forme, t);
            this.tuiles.push(t);
          }
        }

    this.initPioche();
    // initialisation de la grille
    for (let c = 0; c < this.width; c++)
      for (let r = 0; r < this.height; r++) {
        this.grille.push(TuileVide);
      }
  }

  cellIndex(c, r) {
    let index = r*this.width + c;
    return index;
  }

  draw() {
    // Dessin initial du plateau sans aucune tuile
    const ctx = canvas.getContext('2d');

    // dessine working
    this.commandes.draw();
    this.working.draw();
  }

  drawCellFrame(c0, r0, color) {
    let cell = getCellSize();
    for (let c = c0; c <= c0 + 1; c++)
    {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(c*cell, r0*cell);
      ctx.lineTo(c*cell, (r0+1)*cell);
      ctx.stroke();
      for (let r = r0; r <= r0 + 1; r++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(c0*cell, r*cell);
        ctx.lineTo((c0+1)*cell, r*cell);
        ctx.stroke();
      }
    }
  }

  selectUserPosition(user, position) {
    // console.log("selectUserPosition>", user, position);
    this.userSelected = user;
    this.positionSelected = position;
  }

  selectUserPoubelle(user) {
    //console.log("selectUserPoubelle>", user);
    this.userSelected = user;
    this.poubelleSelected = true;
  }

  drawTuiles () {
    let cell = getCellSize();
    // dessin test des tuiles à côté du plateau juste pour visualiser
    if (canvas.getContext) {
      // let xoffset = 0;
      let xoffset = (this.width + 2)*cell;
      let yoffset = 1000 * cell;
      let t = 0;
      for (let c = 0; c < 6; c++) {
        for (let f = 0; f < 6; f++) {
          //console.log("PlateauJeu:drawTuiles> ", Jeu);
          let tuile = this.tuiles[t];
          //console.log("PlateauJeu:drawTuiles>", tuile);
          TuileDraw(tuile, xoffset + c*cell, yoffset + f*cell);
          t++;
        }
      }

      for (let c = 0; c < 6; c++ ) {
        for (let r = 0; r < 6; r++ ) {
          let x = c * cell;
          let y = r * cell;
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.strokeRect(xoffset + x, yoffset + y, cell, cell);
          ctx.stroke();
        }
      }
    }
  }

  ok(user) {
    // console.log("ok");
    Users[0].ok();
  }
}

// Instanciation des arrays

// La Jeu de jeu
let Jeu = new PlateauJeu();


// La liste des utilisateurs
let Users = [];

//---------------------------------------------------------------

Users.push(new User(0, "Chris"));
// Users.push(new User(1, "Pascal"));

Jeu.draw();
// Jeu.drawTuiles();

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Jeu.draw();
  // Jeu.drawTuiles();

  for (u = 0; u < Users.length; u++) Users[u].draw();

  info();
}

function observation(x, y) {
  let where = "??";
  let nothing;
  Jeu.userSelected = nothing;
  Jeu.positionSelected = nothing;
  Jeu.tuileSelected = nothing;

  let done = false;
  let found = false;
  if (Jeu.working.findWCell(x, y)) {
        // détection de la grille de travail
        found = true;
        done = true;
        where = "working";
  }
  else if (Jeu.commandes.findCommande(x, y)) {
        // détection de la grille de commandes
        found = true;
        done = true;
        where = "commande";
  }
  else {
        for (let u = 0; u < Users.length; u++) {
          let user = Users[u];
          let tuileIndice = user.findUCell(x, y);
          if (tuileIndice >= 0) {
            Jeu.selectUserPosition(user, tuileIndice);
            found = true;
            done = true;
            where = "user";
            break;
          }
          if (user.findUPoubelle(x, y)) {
            Jeu.selectUserPoubelle(user);
            found = true;
            done = true;
            where = "user poubelle";
            break;
          }
        }
  }

  // console.log("mousemove> 2", found, "where=", where, "position=", Jeu.positionSelected);

  if (!done)
  {
    //console.log("mousemove> else");
    let u;

    Jeu.selectUserPosition(u, u);
    Jeu.selectUserPoubelle(u);
    Jeu.tuileSelected = u;
    Jeu.cSelected = u;
    Jeu.rSelected = u;
  }
}

function déplacement(x, y) {
  if (Jeu.positionSelected >= 0) {
    // console.log("déplacement> ", x, y, Jeu.userSelected);
    clear();

    if (Jeu.working.findWCell(x, y)) {
      // détection de la grille de travail

      let c = Jeu.cSelected;
      let r = Jeu.rSelected;

      Jeu.working.drawCellFrame(c, r, "yellow");

      // console.log("déplacement> ", c, r);
      found = true;
      done = true;
    }

    let tuile = Jeu.userSelected.jeu[Jeu.positionSelected];
    TuileDraw(tuile, x, y);
  }
  if (Jeu.userSelected && Jeu.userSelected.findUPoubelle(x, y)) {
    // console.log("déplacement> poubelle", Jeu.positionSelected);
    Jeu.userSelected.addPoubelle(Jeu.positionSelected);
  }

}

canvas.addEventListener('mousemove', (e) => {
  // console.log("mousemove> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "c=", Jeu.cSelected, "r=", Jeu.rSelected);

  let x = e.clientX - 8;
  let y = e.clientY - 8;

  // console.log("mousemove> 1", x, y);

  if (Jeu.getMode() == "observation") observation(x, y);
  else if (Jeu.getMode() == "déplacement") {
    // console.log("mousemove> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "c=", Jeu.cSelected, "r=", Jeu.rSelected);
    déplacement(x, y);
  }
  //console.log(x, y);
})

canvas.addEventListener('mousedown', (e) => {
  // console.log("mousedown> ", Jeu.getMode());
  if (Jeu.getMode() == "observation") {
    if (Jeu.positionSelected >= 0) {
      // console.log("mousedown> position=", Jeu.positionSelected);
      Jeu.setMode("déplacement");
    }
  }
  Jeu.commandes.executeCommande(e);
})

canvas.addEventListener('mouseup', (e) => {
  // console.log("mouseup> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "c=", Jeu.cSelected, "r=", Jeu.rSelected);
  if (Jeu.getMode() == "déplacement") {
    if (Jeu.positionSelected >= 0) {
      // console.log("mouseup> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "c=", Jeu.cSelected, "r=", Jeu.rSelected);
      if (Jeu.cSelected >= 0 && Jeu.rSelected >= 0) {
        // détection de la grille de travail
        // console.log("mouseup> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "c=", Jeu.cSelected, "r=", Jeu.rSelected);
        Jeu.drawCellFrame(Jeu.cSelected, Jeu.rSelected, "red");
        let user = Jeu.userSelected;
        let tuile = user.jeu[Jeu.positionSelected];
        let check = Jeu.working.checkRules(tuile, Jeu.cSelected, Jeu.rSelected);
        // console.log("mouseup> check=", check);
        if (check) {
          user.jeu[Jeu.positionSelected] = TuileVide;
          let cc;
          let rr;
          [cc, rr] = Jeu.working.addTuile(tuile, Jeu.cSelected, Jeu.rSelected);
          // on va ajouter cet événement dans l'historique du joueur
          // console.log("addEvenement>", "c=", Jeu.cSelected, "c0=", Jeu.working.c0, "dx=", Jeu.cSelected - Jeu.working.c0, "r=", Jeu.rSelected, "r0=", Jeu.working.r0, "dr=", Jeu.rSelected - Jeu.working.r0, "cc=", cc - Jeu.working.c0, "rr=", rr - Jeu.working.r0);
          user.addEvenement(Jeu.positionSelected, tuile, cc - Jeu.working.c0, rr - Jeu.working.r0);
          clear();
        }
      }
    }
    Jeu.setMode("observation");
    clear();
  }
})

for (u = 0; u < Users.length; u++) Users[u].draw();
for (u = 0; u < Users.length; u++) Users[u].play();

clear();

