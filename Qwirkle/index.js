
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

const QWIRKLE = 6;

const GOOD = 1;
const BAD = 2;
const HORIZONTAL = 3;
const VERTICAL = 4;
const MODE_COLOR = 5;
const MODE_FORME = 6;
const COLORS = 6;
const FORMES = 6;
const LAYERS = 3;

// position vis-à-vis de la zone de travail
const W_HAUT_GAUCHE = -1;
const W_BAS_GAUCHE = -2;
const W_HAUT_DROITE = -3;
const W_BAS_DROITE = -4;

const W_GAUCHE = -5;
const W_DROITE = -6;
const W_HAUT = -7;
const W_BAS = -8;

const W_EXTERIEUR = -10;

const COMMANDES = [TuileZoomin, TuileZoomout, TuileUndo, TuileOk, TuileSave, TuileRestore, TuileSimulation];


localStorage.setItem("key", "valeur");

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
  let yoffset = yoffsetJoueurs() + (Jeu.working.rmax + 6) * cell;

  console.log("info> A", text, Jeu.working.rmax, "yoffsetJoueurs=", yoffsetJoueurs());

  // if (!text) return;

  if (text) {
    let lines = (canvas.height - yoffset)/cell;
    console.log("info> B", "canvas.height=", canvas.height, "yoffset=", yoffset, "lines=", lines, "infos.length=", infos.length);
    if (infos.length >= lines) {
      infos.splice(0, 1);
    }
    infos.push(text);
  }

  console.log("info> C length=", infos.length);

  for (let line = 0; line < infos.length; line++) {
    console.log("info> D ", line, infos[line], "y=", yoffset + line * cell);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.fillRect(0, yoffset - cell + line*cell, canvas.width, cell);
    ctx.fill();

    ctx.fillStyle = 'red';
    ctx.font = '20px san-serif';
    ctx.fillText(infos[line], 0, yoffset + line * cell);
    ctx.fill();
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
    // on démarre par une grille minimale 3 x 3 = une cellule centrale entourée d'une marge de 1
    this.cmin = 0;
    this.cmax = 2;
    this.rmin = 0;
    this.rmax = 2;
    this.c0 = 1; // position(c) relative de la cellule de départ
    this.r0 = 1; // position(r) relative de la cellule de départ

    this.grid = new Matrix();
    this.grid.fill (3, 3, TuileVide);
  }

  draw() {
    let cell = getCellSize();
    let xoffset = 0;
    let yoffset = yoffsetJoueurs() + 2 * Users.length * cell;
    for (let c = this.cmin; c <= this.cmax; c++)
      for (let r = this.rmin; r <= this.rmax; r++) {
          let tuile = this.grid.getElement(c - this.cmin, r - this.rmin);
          if (tuile >= 0) {
            let x = xoffset + c*cell;
            let y = yoffset + r*cell;
            // console.log("WorkingGrille:draw>", x, y, tuile);
            TuileDraw(tuile, x, y);
          }
      }
    Jeu.working.drawCellFrame(this.c0, this.r0, "green")
    if (Users[0].historique.length > 0) {
      for (let ievt = 0; ievt < Users[0].historique.length; ievt++) {
        let evt = Users[0].historique[ievt];
        let c = evt.c + this.c0;
        let r = evt.r + this.r0;
        Jeu.working.drawCellFrame(c, r, "red");
      }
    }
    if (Users[0].tourPrécédent.length > 0) {
      for (let ievt = 0; ievt < Users[0].tourPrécédent.length; ievt++) {
        let evt = Users[0].tourPrécédent[ievt];
        let c = evt.c + this.c0;
        let r = evt.r + this.r0;
        Jeu.working.drawCellFrame(c, r, "yellow");
      }
    }

    if (Users[0].jouables.length > 0) {
      for (let i = 0; i < Users[0].jouables.length; i++) {
        let c;
        let r;
        [c, r] = Users[0].jouables[i];
        // console.log("working.draw> draw jouable", i, c, r);
        Jeu.working.drawCellFrame(c, r, "orange");
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

    ctx.lineWidth = 2;
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
    if (column == this.cmin && row == this.rmin) return W_HAUT_GAUCHE;
    if (column == this.cmin && row == this.rmax) return W_BAS_GAUCHE;
    if (column == this.cmax && row == this.rmin) return W_HAUT_DROITE;
    if (column == this.cmax && row == this.rmax) return W_BAS_DROITE;

    if (column == this.cmin) return W_GAUCHE;
    if (column == this.cmax) return W_DROITE;
    if (row == this.rmin) return W_HAUT;
    if (row == this.rmax) return W_BAS;

    // on est complètement en dehors de la zone de travail
    if (column < this.cmin || column > this.cmax) return W_EXTERIEUR;
    if (row < this.rmin || row > this.rmax) return W_EXTERIEUR;

    let i = this.grid.index(column - this.cmin, row - this.rmin);
    return i;
  }

  getElement(column, row) {
    return this.grid.getElement(column, row);
  }

  // teste si la case contient une cellule vide
  vide(column, row){
    let i = this.index(column, row);
    return (i < 0) || TuileTestVide(this.grid.elements[i]);
  }

  // teste si la case dans la grille de travail est compatible soit forme soit color
  compatible(column, row, forme, color){
    let i = this.index(column, row);
    if (i < 0) return false;
    let tuile = this.grid.elements[i];
    if (TuileGetForme(tuile) == forme && TuileGetColor(tuile) == color) return false;
    return (TuileGetForme(tuile) == forme || TuileGetColor(tuile) == color);
  }

  /*
  Règles:
  A> Est-ce la première pièce de la partie ? (true = GOOD)
  B> est-ce à l'extérieur de la zone de travail ?
  C> test si la case est déjà occupée
  D> test case isolée
  E> cellule voisine immédiate compatible (color OU forme identique) ou vide
  F> cellule voisine +2 compatible (color OU forme identique) ou vide
  G> test des doublons dans les lignes supportées par la case testée

  une tuile déjà jouée:
  H> teste si on est immédiatement à côté de la première tuile jouée

  I>
  J>
  */

  checkRuleA(tuile, column, row) {
    //info("chekrules> test first");
    if (this.grid.vide()) {
      // console.log("first");
      return GOOD;
    }
    return BAD;
  }

  checkRuleB(tuile, column, row) {
    //console.log("chekrules> test intérieur de la zone");
    if (column < this.cmin || column > this.cmax) {
      // console.log("extérieur de la zone");
      return BAD;
    }
    if (row < this.rmin || row > this.rmax) {
      // console.log("extérieur de la zone");
      return BAD;
    }
    return GOOD;
  }

  checkRuleC(tuile, column, row) {
    //console.log("chekrules> test si la case est déjà occupée");
    let index = this.index(column, row);
    if (index > 0) {
      let t = this.grid.elements[index];
      if (!TuileTestVide(t)) {
        // console.log("la case est déjà occupée");
        return BAD;
      }
    }
    return GOOD;
  }

  checkRuleD(tuile, column, row) {
    //console.log("chekrules> test case isolée");
    if (this.vide(column-1, row) && this.vide(column+1, row) && this.vide(column, row-1) && this.vide(column, row+1)) {
      // console.log("case isolée");
      return BAD;
    }

    return GOOD;
  }

  checkRuleE(tuile, column, row) {
    let GD = ["à gauche", "à droite"];
    let HB = ["en haut", "en bas"];

    for (let dc = 0; dc < 2; dc++) {
      let c = column + 2 * dc - 1;
      if (!this.vide(c, row)) {
        // console.log("case c=" + c + " non vide");
        if (!this.compatible(c, row, TuileGetForme(tuile), TuileGetColor(tuile))) {
          // console.log("case voisine incompatible " + GD[dc]);
          return BAD;
        }
        // else console.log("compatible");
      }
    }

    // console.log("case voisine GD compatible ou vide ");

    for (let dr = 0; dr < 2; dr++) {
      let r = row + 2*dr - 1;
      if (!this.vide(column, r)) {
        // console.log("case r=" + r + " non vide");
        if (!this.compatible(column, r, TuileGetForme(tuile), TuileGetColor(tuile))) {
          // console.log("case voisine incompatible " + HB[dr]);
          return BAD;
        }
        // else console.log("compatible");
      }
    }

    // console.log("case voisine HB compatible ou vide");

    return GOOD;
  }

  checkRuleF(tuile, column, row) {
    let GD = ["à gauche", "à droite"];
    let HB = ["en haut", "en bas"];

    for (let dc = 0; dc < 2; dc++) {
      let c = column + 2*dc - 1;
      let c1 = column + 4*dc - 2;
      if (!this.vide(c, row)) {
        // console.log("case c=" + c + " non vide");
        if (this.compatible(c, row, TuileGetForme(tuile), TuileGetColor(tuile)))
          if (!this.vide(c1, row)) {
            // console.log("case c=" + c1 + " non vide");
            if (!this.compatible(c1, row, TuileGetForme(tuile), TuileGetColor(tuile))) {
              // console.log("case voisine +2 incompatible " + GD[dc]);
              return BAD;
            }
          }
          // else console.log("case c1=" + c1 + " vide");
      }
      // else console.log("case c=" + c + " vide");
    }

    // console.log("case voisine GD +2 compatible ou vide");

    for (let dr = 0; dr < 2; dr++) {
      let r = row + 2*dr - 1;
      let r1 = row + 4*dr - 2;
      if (!this.vide(column, r)) {
        // console.log("case r=" + r + " non vide");
        if (this.compatible(column, r, TuileGetForme(tuile), TuileGetColor(tuile))) {
          if (!this.vide(column, r1)) {
            // console.log("case r1=" + r1 + " non vide");
            if (!this.compatible(column, r1, TuileGetForme(tuile), TuileGetColor(tuile))) {
              // console.log("case voisine +2 incompatible " + HB[dr]);
              return BAD;
            }
          }
          // else console.log("case r1=" + r1 + " vide");
        }
      }
      // else console.log("case r=" + r + " vide");
    }

    // console.log("case voisine HB +2 compatible ou vide ");

    return GOOD;
  }

  checkRuleG(tuile, column, row, user) {
    // Quand on arrive ici, on sait que les cases adjacentes sont soit vides ou bien sont compatibles
    let hgauche;
    let hdroite;
    let vhaut;
    let vbas;

    // console.log("checkRuleG");

    if (!Jeu.working.vide(column - 1, row)) {
      hgauche = new Ligne(HORIZONTAL, row - Jeu.working.r0, column - Jeu.working.c0 - 1, column - Jeu.working.c0 - 1);
      hgauche.extend();
      // console.log("checkRuleG> test horizontal gauche");
      if (!hgauche.compatible(tuile)) return BAD;
    }
    if (!Jeu.working.vide(column + 1, row)) {
      // console.log("checkRuleG> test horizontal droite");
      hdroite = new Ligne(HORIZONTAL, row - Jeu.working.r0, column - Jeu.working.c0 + 1, column - Jeu.working.c0 + 1);
      hdroite.extend();
      if (!hdroite.compatible(tuile)) return BAD;
    }
    if (!Jeu.working.vide(column, row - 1)) {
      // console.log("checkRuleG> test vertical haut");
      vhaut = new Ligne(VERTICAL, column - Jeu.working.c0, row - Jeu.working.r0 - 1, row - Jeu.working.r0 - 1);
      vhaut.extend();
      if (!vhaut.compatible(tuile)) return BAD;
    }
    if (!Jeu.working.vide(column, row + 1)) {
      // console.log("checkRuleG> test vertical bas");
      vbas = new Ligne(VERTICAL, column - Jeu.working.c0, row - Jeu.working.r0 + 1, row - Jeu.working.r0 + 1);
      vbas.extend();
      // console.log("checkRuleG>", tuile,  vbas);
      if (!vbas.compatible(tuile)) return BAD;
    }

    // console.log("checkRuleG> les segments sont compatibles");

    // chaque segment de ligne à droite, gauche, haut, bas est compatible par la tuile
    // maintenant nous devons essayer de concaténer les parties doite/gauche et haut/bas
    // on sait que les parties individuelles sont toutes compatibles avec la tuile
    // il reste donc à vérifier que, une fois assemblées, il n'y a pas de doublon

    if (hgauche && hdroite) {
      if (!hgauche.canJoin(tuile, hdroite)) return BAD;
    }

    if (vhaut && vbas) {
      if (!vhaut.canJoin(tuile, vbas)) return BAD;
    }

    // console.log("checkRuleG> les segments peuvent être joints");

    return GOOD;
  }

  checkRuleH(tuile, column, row, evt) {
    // on teste si la position de l'evt testé est immédiatement à côté de [column, row]
    let c = evt.c + Jeu.working.c0;
    let r = evt.r + Jeu.working.r0;
    // console.log("checkRuleH>", column, row, "evt", evt.c, evt.r, "0=", Jeu.working.c0, Jeu.working.r0, c, r);
    if (!((column == c-1 && row == r) ||
          (column == c+1 && row == r) ||
          (column == c && row == r-1) ||
          (column == c && row == r+1))) {
      // console.log("on n'est pas à côté de la première tuile jouée");
      return BAD;
    }
    // console.log("on est à côté de la première tuile jouée");
    return GOOD;
  }

  // application des règles du jeu
  checkRules(user, jeu, tuile, column, row) {
    // retourne false si l'on ne peut pas utiliser cette case selon les règles
    //
    // la première fois => GOOD
    // si la case est occupée par une tuile => BAD
    // si la case est isolée (Gauche, Droite, Haut, Bbas) => BAD

    let jouées = user.tuilesJouées(jeu);

    // console.log("------------ check rules ---------- c=" + column + " r=" + row + " jouées=" + jouées);

    if (this.grid.vide()) return GOOD;

    if (jouées == 0) {
      let evt = user.historique[0];

      console.log("checkRules> première tuile", tuile);
      if (this.checkRuleB(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleC(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleD(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleE(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleF(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleG(tuile, column, row, user) == BAD) return BAD;
    }
    else if (jouées == 1) {
      let evt = user.historique[0];

      // console.log("checkRules> deuxième tuile", tuile);
      // une tuile a déjà été posée on doit donc commencer par tester que la position testée est immédiatement à côté de la première tuile jouée
      // if (this.checkRuleH(tuile, column, row, evt) == BAD) return BAD;
      if (this.checkRuleB(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleC(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleD(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleE(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleF(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleG(tuile, column, row, user) == BAD) return BAD;
      console.log("CheckRules> deuxième tuile règles OK");
    }
    else {
      // au moins 2 tuiles ont été posées, ce qui définit "la ligne courante"
      //  => une orientation (Horizontale ou Verticale) ainsi que:
      //     pour H: un row et les columns [c1 ... c2]
      //     pour V: une column et les rows [r1 ... r2]

      if (this.checkRuleB(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleC(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleD(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleE(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleF(tuile, column, row) == BAD) return BAD;
      if (this.checkRuleG(tuile, column, row, user) == BAD) return BAD;

      console.log("checkRules> tuile suivante", user.historique.length);

      if (!user.ligne) {
        let e0 = user.historique[0];
        let e1 = user.historique[1];
        if (e1) {
          console.log("checkRules> test ligne", "e0=", e0, "e1=", e1);

          if (e0.c == e1.c) {
            user.ligne = new Ligne(VERTICAL, e0.c, e0.r, e1.r);
          }
          else {
            user.ligne = new Ligne(HORIZONTAL, e0.r, e0.c, e1.c);
          }
        }
      }
      else {
        user.ligne.extend();
        // console.log("checkRules> tuile suivante", user.ligne);
        // on doit vérifier que la [column, row] testée est compatible avec cette ligne

        if (!user.ligne.aligné(column, row)) return BAD;
        console.log("checkRules> tuile suivante", user.ligne);
        return GOOD;
      }
      return BAD;
    }

    /*
    - il faut commencer à mémoriser la liste des tuiles jouées lors du tour courant pour le joueur
    - une tuile qu n'est pas la première de la liste du tour courant doit faire partie d'une "ligne" puis toutes les
      tuiles suivantes doivent appartenir à la même ligne définie dès la deuxième tuile du tour

    - on devrait commencer à accumuler les points du tour courant.
    */

    return GOOD;
  }

  // ajoute une tuile sur la grille de travail éventuellement avec agrandissement de la zone de travail
  // cette zone de travail est dessinée librement sur la grille dur plateau de jeu
  addTuile(tuile, column, row) {
    // console.log("WorkingGrille:addTuile>", column, row, tuile);
    if (this.grid.vide()) {
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
      return [column, row, i];
    }

    // console.log("WorkingGrille:addTuile> on doit augmenter la grille de travail");

    // on doit augmenter la grille de travail
    let oldW = this.width();
    let oldH = this.height();
    let dw = 0;
    let dh = 0;
    let c = 0;
    let r = 0;

    // les différents d'augmentation
    switch (i) {
      case W_HAUT_GAUCHE:
            this.cmin -= 1;
            this.rmin -= 1;
            dw = 1;
            dh = 1;
            c = 1;
            r = 1;
            break;
      case W_BAS_GAUCHE:
            this.cmax += 1;
            this.rmax += 1;
            dw = 1;
            dh = 1;
            c = 1;
            r = 0;
            break;
      case W_HAUT_DROITE:
            this.rmin -= 1;
            this.rmin -= 1;
            dw = 1;
            dh = 1;
            c = 0;
            r = 1;
            break;
      case W_BAS_DROITE:
            this.rmax += 1;
            this.rmax += 1;
            dw = 1;
            dh = 1;
            c = 0;
            r = 0;
            break;
      case W_GAUCHE:
            this.cmin -= 1;
            dw = 1;
            c = 1;
            r = 0;
            break;
      case W_DROITE:
            this.cmax += 1;
            dw = 1;
            c = 0;
            r = 0;
            break;
      case W_HAUT:
            this.rmin -= 1;
            dh = 1;
            c = 0;
            r = 1;
            break;
      case W_BAS:
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
    let commandesXmax = commandesXoffset + 6*(cell + 7);
    let commandesYmax = commandesYoffset + cell;

    if (x >= commandesXoffset && x < commandesXmax && y >= commandesYoffset && y <= commandesYmax) {
      let commande = Math.floor((x - commandesXoffset)/(cell + 7));
      // console.log ("Jeu::findCommande> in", commandesXmax, x, x/(cell + 7), commande);
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

    for (let c = 0; c < COMMANDES.length; c++) {
      x = commandesXoffset + c*(cell + 7);
      y = yoffsetCommandes();
      let commande = COMMANDES[c];
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
    let commandesXmax = commandesXoffset + COMMANDES.length*(cell + 7);
    let commandesYmax = commandesYoffset + cell;

    let xc = commandesXoffset;
    let yc = commandesYoffset;
    if ((x >= commandesXoffset) && (x <= commandesXoffset + COMMANDES.length*(cell + 7)))
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
          case 4:
            // ok
            Jeu.save();
            break;
          case 5:
            // ok
            // console.log("executeCommande> restore");
            Jeu.restore();
            break;
          case 6:
            // ok
            let j = [...Users[0].jeu];
            let n = 0;
            // console.log("executeCommande> simulation", j, n);
            Users[0].simulation(j, n);
            Users[0].jouables.length = 0;
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

  init() {
    // création de toutes les 3 x 6 x 6 tuiles ordonnées
    for (let layer = 0; layer < LAYERS; layer++)
        for (let color = 0; color < COLORS; color++) {
          for (let forme = 0; forme < FORMES; forme++) {
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
      for (let c = 0; c < COLORS; c++) {
        for (let f = 0; f < FORMES; f++) {
          //console.log("PlateauJeu:drawTuiles> ", Jeu);
          let tuile = this.tuiles[t];
          //console.log("PlateauJeu:drawTuiles>", tuile);
          TuileDraw(tuile, xoffset + c*cell, yoffset + f*cell);
          t++;
        }
      }

      for (let c = 0; c < COLORS; c++ ) {
        for (let r = 0; r < FORMES; r++ ) {
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

  save() {
    console.log("Save>");
    localStorage.clear();
    localStorage.setItem("Pioche", JSON.stringify(Jeu.pioche));
    localStorage.setItem("Grid", JSON.stringify(Jeu.working.grid.elements));
    localStorage.setItem("GridColumns", JSON.stringify(Jeu.working.grid.columns));
    localStorage.setItem("GridRows", JSON.stringify(Jeu.working.grid.rows));
    localStorage.setItem("Jeu_c0", JSON.stringify(Jeu.working.c0));
    localStorage.setItem("Jeu_cmin", JSON.stringify(Jeu.working.cmin));
    localStorage.setItem("Jeu_cmax", JSON.stringify(Jeu.working.cmax));
    localStorage.setItem("Jeu_r0", JSON.stringify(Jeu.working.r0));
    localStorage.setItem("Jeu_rmin", JSON.stringify(Jeu.working.rmin));
    localStorage.setItem("Jeu_rmax", JSON.stringify(Jeu.working.rmax));

    localStorage.setItem("User_Score", JSON.stringify(Users[0].score));
    localStorage.setItem("User_Jeu", JSON.stringify(Users[0].jeu));
  }

  restore() {
    console.log("PlateauJeu:Restore>");
    Jeu.pioche = structuredClone(JSON.parse(localStorage.getItem("Pioche")));
    Jeu.working.grid.elements = structuredClone(JSON.parse(localStorage.getItem("Grid")));
    Jeu.working.grid.columns = structuredClone(JSON.parse(localStorage.getItem("GridColumns")));
    Jeu.working.grid.rows = structuredClone(JSON.parse(localStorage.getItem("GridRows")));
    Jeu.working.c0 = structuredClone(JSON.parse(localStorage.getItem("Jeu_c0")));
    Jeu.working.cmin = structuredClone(JSON.parse(localStorage.getItem("Jeu_cmin")));
    Jeu.working.cmax = structuredClone(JSON.parse(localStorage.getItem("Jeu_cmax")));
    Jeu.working.r0 = structuredClone(JSON.parse(localStorage.getItem("Jeu_r0")));
    Jeu.working.rmin = structuredClone(JSON.parse(localStorage.getItem("Jeu_rmin")));
    Jeu.working.rmax = structuredClone(JSON.parse(localStorage.getItem("Jeu_rmax")));

    Users[0].score = structuredClone(JSON.parse(localStorage.getItem("User_Score")));
    Users[0].jeu = structuredClone(JSON.parse(localStorage.getItem("User_Jeu")));

    clear();
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

  infos = [];
  // console.log("clear> ", infos.length);
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
        let user = Jeu.userSelected;
        // console.log("mouseup> ", Jeu.getMode(), "u=", Jeu.userSelected, "p=", Jeu.positionSelected, "t=", user.jeu[Jeu.positionSelected], "c=", Jeu.cSelected, "r=", Jeu.rSelected);
        let tuile = user.jeu[Jeu.positionSelected];
        let check = Jeu.working.checkRules(user, user.jeu, tuile, Jeu.cSelected, Jeu.rSelected);
        // console.log("mouseup> check=", check);
        if (check == GOOD) {
          user.jeu[Jeu.positionSelected] = TuileVide;
          let cc;
          let rr;
          let i;
          [cc, rr, i] = Jeu.working.addTuile(tuile, Jeu.cSelected, Jeu.rSelected);
          // console.log("mouseup> add tuile", "cc=", cc, "rr=", rr, "tuile=", tuile, "i=", i);
          // Jeu.working.drawCellFrame(Jeu.cSelected, Jeu.rSelected, "red");

          // un événement est le fait de jouer une tuile.
          // on va ajouter cet événement dans l'historique du joueur
          // console.log("addEvenement>", "c=", Jeu.cSelected, "c0=", Jeu.working.c0, "dc=", Jeu.cSelected - Jeu.working.c0, "r=", Jeu.rSelected, "r0=", Jeu.working.r0, "dr=", Jeu.rSelected - Jeu.working.r0, "cc=", cc - Jeu.working.c0, "rr=", rr - Jeu.working.r0);
          user.addEvenement(Jeu.positionSelected, tuile, cc - Jeu.working.c0, rr - Jeu.working.r0);
          clear();
        }
        else {
          // console.log("mouseup> check BAD");
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

