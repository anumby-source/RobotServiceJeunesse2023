
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
const colors = ["red", "darkviolet", "lime", "skyblue", "orange", "yellow"];
const formes = ["rond", "carré", "losange", "croix", "trefle", "étoile"];
const formesCmd = ["vide", "zoomin", "zoomout", "undo", "ok", "swap"];

const ctx = canvas.getContext('2d');

// Définition de la classe pour les Tuiles
class Tuile {
  constructor(color, forme, layer) {
    this.color = color;
    this.forme = forme;
    this.layer = layer;
    this.pioche = true;
    this.joueur = 0;
    this.column = 0;
    this.row = 0;
  }

  testVide() {
    return this.forme == "vide";
  }

  toText() {
    return "{" + this.forme + "|" + this.color + "}";
  }

  drawFrame(ctx, x, y, color) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(x, y);
      ctx.lineTo(x + getCellSize(), y);

      ctx.moveTo(x, y + getCellSize());
      ctx.lineTo(x + getCellSize(), y + getCellSize());

      ctx.moveTo(x, y);
      ctx.lineTo(x, y + getCellSize());

      ctx.moveTo(x + getCellSize(), y);
      ctx.lineTo(x + getCellSize(), y + getCellSize());

      ctx.stroke();
  }

  draw(x, y) {
    // fonction générique de dessin des tuiles
      const ctx = canvas.getContext('2d');
      let f1;
      let f2;

      f1 = formes.indexOf(this.forme);
      if (f1 >= 0) {
        //console.log("Tuile::draw> f1=", f1);

        switch (f1) {
          case 0:
            this.rond(ctx, this.color, x, y);
            break;
          case 1:
            this.square(ctx, this.color, x, y);
            break;
          case 2:
            this.losange(ctx, this.color, x, y);
            break;
          case 3:
            this.cross(ctx, this.color, x, y);
            break;
          case 4:
            this.trefle(ctx, this.color, x, y);
            break;
          case 5:
            this.star(ctx, this.color, x, y);
            break;
          }
      }
      else {
        //console.log("Tuile::draw> f1=", f1, this.forme);
        f2 = formesCmd.indexOf(this.forme);
        if (f2 >= 0) {
          //console.log("Tuile::draw> f2=", f2);
          switch (f2) {
            case 0:
              this.vide(ctx, x, y);
              break;
            case 1:
              this.zoomin(ctx, x, y);
              break;
            case 2:
              this.zoomout(ctx, x, y);
              break;
            case 3:
              this.undo(ctx, x, y);
              break;
            case 4:
              this.ok(ctx, x, y);
              break;
            case 5:
              this.swap(ctx, x, y);
              break;
            }
        }
      }
  }

  zoomin(ctx, x, y) {
    //console.log("zoomin", x, y);

    this.drawFrame(ctx, x, y, "red");

    ctx.fillStyle = "DimGray";
    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(x + getCellSize()*0.1, y + getCellSize()/2);
    ctx.lineTo(x + getCellSize()*0.9, y + getCellSize()/2);
    ctx.moveTo(x + getCellSize()/2, y + getCellSize()*0.1);
    ctx.lineTo(x + getCellSize()/2, y + getCellSize()*0.9);
    ctx.stroke();
  }

  zoomout(ctx, x, y) {
    //console.log("zoomout", x, y);

    this.drawFrame(ctx, x, y, "red");

    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(x + getCellSize()*0.1, y + getCellSize()/2);
    ctx.lineTo(x + getCellSize()*0.9, y + getCellSize()/2);
    ctx.stroke();
  }

  undo(ctx, x, y) {
    this.drawFrame(ctx, x, y, "red");
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    ctx.fillStyle = 'green';
    ctx.font = '15px san-serif';
    ctx.fillText("z", x + getCellSize()*0.3, y + getCellSize()*0.7);
  }

  ok(ctx, x, y) {
    this.drawFrame(ctx, x, y, "red");
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    ctx.fillStyle = 'green';
    ctx.font = '15px san-serif';
    ctx.fillText("ok", x + getCellSize()*0.15, y + getCellSize()*0.7);
  }

  swap(ctx, x, y) {
    this.drawFrame(ctx, x, y, "red");
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    ctx.fillStyle = 'green';
    ctx.font = '15px san-serif';
    ctx.fillText("swap", x, y + getCellSize()*0.7);
  }

  vide(ctx, x, y) {
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    for (let c = 0; c <= 1; c++) {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.moveTo(x + c*getCellSize(), y);
        ctx.lineTo(x + c*getCellSize(), y + getCellSize());
        ctx.stroke();
    }
    for (let r = 0; r <= 1; r++) {
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.moveTo(x, y + r*getCellSize());
      ctx.lineTo(x + getCellSize(), y + r*getCellSize());
      ctx.stroke();
    }
  }

  rond(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, getCellSize(), getCellSize());

    let radius = getCellSize2() - margin();
    ctx.fillStyle = color;
    ctx.arc(x + getCellSize2(), y + getCellSize2(), radius, 0, Math.PI * 2, true);
    ctx.fill();
  }

  square(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, getCellSize(), getCellSize());

    let width = getCellSize()*0.9 - 2*margin();

    ctx.fillStyle = color;
    ctx.fillRect(x + getCellSize2() - width/2, y + getCellSize2() - width/2, getCellSize()*0.9 - 2*margin(), getCellSize()*0.9 - 2*margin());
    ctx.fill();
  }

  losange(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, getCellSize(), getCellSize());

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + margin(), y + getCellSize2());             // 1
    ctx.lineTo(x + getCellSize2(), y + margin());             // 2
    ctx.lineTo(x + getCellSize() - margin(), y + getCellSize2());  // 3
    ctx.lineTo(x + getCellSize2(), y + getCellSize() - margin());  // 4
    ctx.lineTo(x + margin(), y + getCellSize2());
    ctx.fill();
  }

  cross(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, getCellSize(), getCellSize());

    ctx.fillStyle = color;

    let radius = getCellSize2() * 0.3;
    ctx.beginPath();
    ctx.moveTo(x + margin(), y + margin()); // 1
    ctx.lineTo(x + getCellSize2(), y + getCellSize2() - radius); // 2
    ctx.lineTo(x + getCellSize() - margin(), y + margin()); // 3
    ctx.lineTo(x + getCellSize2() + radius, y + getCellSize2()); // 4
    ctx.lineTo(x + getCellSize() - margin(), y + getCellSize() - margin()); // 5
    ctx.lineTo(x + getCellSize2(), y + getCellSize2() + radius); // 6
    ctx.lineTo(x + margin(), y + getCellSize() - margin()); // 7
    ctx.lineTo(x + getCellSize2() - radius, y + getCellSize2()); // 8
    ctx.lineTo(x + margin(), y + margin()); // 1
    ctx.fill();
  }

  trefle(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, getCellSize(), getCellSize());
    ctx.fill();

    let core = getCellSize2() * 0.3;
    let leaf = getCellSize2() * 0.50;
    let leafSize = getCellSize2() * 0.35;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(x + getCellSize2() - core, y + getCellSize2() - core, core*2, core*2);
    ctx.fill();

    for (let side = 0; side < 4; side ++) {
       let alpha = side * Math.PI/2;
       let cx = x + getCellSize2() + leaf * Math.cos(alpha);
       let cy = y + getCellSize2() + leaf * Math.sin(alpha);
       //console.log(alpha, leaf * Math.cos(alpha), leaf * Math.sin(alpha));
       ctx.beginPath();
       ctx.arc(cx, cy, leafSize, 0, Math.PI * 2, true);
       ctx.fill();
    }
  }

  star(ctx, color, x, y) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";


    ctx.fillRect(x, y, getCellSize(), getCellSize());

    let radius = getCellSize()*0.15;
    let a = (getCellSize2() - margin())/Math.SQRT2;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();

    let small = false;
    for (let dalpha = 0; dalpha < 17; dalpha += 1) {
      let alpha = dalpha * Math.PI/8;
      let r = 0;

      if (small) {
        r = radius;
        small = false;
      }
      else {
        r = getCellSize2() - margin();
        small = true;
      }

      let px = x + getCellSize2() + r*Math.cos(alpha);
      let py = y + getCellSize2() + r*Math.sin(alpha);

      //console.log("small=", small, "alpha=", alpha, "px = ", px, "py = ", py);

      if (alpha == 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.fill();
  }
}

// Une instance de Tuile unique pour installer sur des cellules particulières: La cellule vide, les cellules pour les commandes
let TuileVide = new Tuile ("silver", "vide");
let TuileZoomin = new Tuile ("silver", "zoomin");
let TuileZoomout = new Tuile ("silver", "zoomout");
let TuileUndo = new Tuile ("silver", "undo");
let TuileOk = new Tuile ("silver", "ok");;
let TuileSwap = new Tuile ("silver", "swap");

// Définition de la classe pour la zone d'info
let infos = [];
function info (text) {
  let xoffset = 0;
  let yoffset = yoffsetJoueurs() + (Jeu.working.cmax + 6) * getCellSize();

  if (text) {
    let lines = (canvas.height - yoffset)/getCellSize();
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
      ctx.fillRect(0, yoffset - getCellSize() + line*getCellSize(), canvas.width, getCellSize());
      ctx.fill();

      ctx.fillStyle = 'red';
      ctx.font = '20px san-serif';
      ctx.fillText(infos[line], 0, yoffset  + line*getCellSize());
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
    this.partie = [];
    this.historique = [];
  }

  draw() {
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * getCellSize();

    ctx.fillStyle = 'green';
    ctx.font = '30px san-serif';
    ctx.fillText(this.name, 0, yoffset + getCellSize());

    for (let c = 0; c < 6; c++)
    {
        let t = this.jeu[c];
        //console.log(t, "xoffset=", xoffset + c*getCellSize(), yoffset, c);
        t.draw(xoffset + c*getCellSize(), yoffset);
    }
  }

  play() {
    // offset pour positionner les utilisateurs après la grille
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * getCellSize();

    for (let t = 0; t < 6; t++) {
      let n = Jeu.pioche[0];
      Jeu.pioche.splice(0, 1);
      //console.log('User:play> ', n);

      let tuile = Jeu.tuiles[n];
      //console.log('play> tuile=', tuile);
      tuile.pioche = false;

      this.jeu[t] = tuile;

      let x = xoffset + t*getCellSize();
      let y = yoffset;
      //console.log('play> tuile=', tuile, tuile.forme, tuile.color, x, y);
      tuile.draw(x, y);
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
    this.pioche();
  }

  findUCell(x, y) {
    let usersXoffset = offsetJeu();
    let usersYoffset = yoffsetJoueurs();
    let usersXmax = usersXoffset + 6 * getCellSize();
    let usersYmax = usersYoffset + getCellSize();

    if (x >= usersXoffset && x <= usersXmax && y >= usersYoffset && y <= usersYmax) {
      let tuileIndice = Math.floor((x - usersXoffset)/getCellSize());
      // console.log ("UserGrille::findUCell> in", tuileIndice);
      return tuileIndice;
    }
    return -1;
  }

  selectTuile(tuileIndice) {

    let x = offsetJeu() + tuileIndice * getCellSize();
    let y = yoffsetJoueurs() + 2 * this.numéro * getCellSize();

    // on sauvegarde la tuile
    let savedTuile = this.jeu[tuileIndice]
    // on va enlever la tuile du jeu de cet utilisateur
    //this.jeu[tuileIndice] = TuileVide;

    // console.log("selectTuile>", "tuile=", tuileIndice, "user=", this.numéro, "savedtuile=", savedTuile);

    // TuileVide.draw(x, y);

    // this.jeu[savedTuile].draw(x, y);

    /*
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.fillRect(xoff + tuile*getCellSize(), yoff, getCellSize(), getCellSize());
    ctx.fill();
    */

  }

  pioche() {
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * getCellSize();

    for (let t = 0; t < 6; t++) {
      let tuile = this.jeu[t];
      if (tuile.testVide()) {
        let n = Jeu.pioche[0];
        Jeu.pioche.splice(0, 1);
        //console.log('User:play> ', n);

        let tuile = Jeu.tuiles[n];
        //console.log('play> tuile=', tuile);
        tuile.pioche = false;

        this.jeu[t] = tuile;

        let x = xoffset + t*getCellSize();
        let y = yoffset;
        //console.log('play> tuile=', tuile, tuile.forme, tuile.color, x, y);
        tuile.draw(x, y);
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
      if (!t.testVide()) return false;
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
    let xoffset = 0;
    let yoffset = yoffsetJoueurs() + 2 * Users.length * getCellSize();
    for (let c = this.cmin; c <= this.cmax; c++)
      for (let r = this.rmin; r <= this.rmax; r++) {
          let tuile = this.grid.getElement(c - this.cmin, r - this.rmin);
          if (tuile) {
            let x = xoffset + c*getCellSize();
            let y = yoffset + r*getCellSize();
            //console.log("WorkingGrille:draw>", x, y, tuile);
            tuile.draw(x, y);
          }
      }
  }

  findWCell(x, y) {
    let workingXoffset = 0;
    let workingYoffset = yoffsetJoueurs() + 2 * Users.length * getCellSize();
    let workingXmax = workingXoffset + (this.cmax + 1)*getCellSize();
    let workingYmax = workingYoffset + (this.rmax + 1)*getCellSize();

    if (x >= workingXoffset && x <= workingXmax && y >= workingYoffset && y <= workingYmax) {

      // console.log ("WorkingGrille::findWCell> in", x, y, workingXoffset, workingXmax, workingYoffset, workingYmax);

      x -= workingXoffset;
      y -= workingYoffset;
      let c = Math.floor(x/getCellSize());
      let r = Math.floor(y/getCellSize());
      // console.log("WorkingGrille:findWCell> cellule=", c, r);
      Jeu.cSelected = c;
      Jeu.rSelected = r;

      return true;
    }
    return false;
  }

  drawCellFrame(c0, r0, color) {
    let workingXoffset = 0;
    let workingYoffset = yoffsetJoueurs() + 2 * Users.length * getCellSize();
    let workingXmax = workingXoffset + (this.cmax + 1)*getCellSize();
    let workingYmax = workingYoffset + (this.rmax + 1)*getCellSize();

    for (let c = c0; c <= c0 + 1; c++)
    {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(workingXoffset + c*getCellSize(), workingYoffset + r0*getCellSize());
      ctx.lineTo(workingXoffset + c*getCellSize(), workingYoffset + (r0+1)*getCellSize());
      ctx.stroke();
      for (let r = r0; r <= r0 + 1; r++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(workingXoffset + c0*getCellSize(), workingYoffset + r*getCellSize());
        ctx.lineTo(workingXoffset + (c0+1)*getCellSize(), workingYoffset + r*getCellSize());
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
    return (i < 0) || this.grid.elements[i].testVide();
  }

  // teste si la case dans la grille de travail est de même type (forme, color)
  sameType(column, row, forme, color){
    let i = this.index(column, row);
    if (i < 0) return false;
    let tuile = this.grid.elements[i];
    return (i >= 0) && (tuile.forme == forme || tuile.color == color);
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
      if (!t.testVide()) {
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
        if (!this.sameType(c, row, tuile.forme, tuile.color)) {
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
        if (!this.sameType(column, r, tuile.forme, tuile.color)) {
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
        if (this.sameType(c, row, tuile.forme, tuile.color))
          if (!this.vide(c1, row)) {
            info("case c=" + c1 + " non vide");
            if (!this.sameType(c1, row, tuile.forme, tuile.color)) {
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
        if (!this.vide(column, r) && this.sameType(column, r, tuile.forme, tuile.color) &&
            !this.vide(column, r1) && !this.sameType(column, r1, tuile.forme, tuile.color)) {
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
      let formes = [tuile.forme];
      let colors = [tuile.color];
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
        if ((t.forme != tuile.forme) && (t.color != tuile.color)) {
          info("la ligne " + doc + " n'est pas conforme len=" + formes.length + " : ni forme ni color conforme");
          return false;
        }

        // ici, on a une conformité soit sur les formes soit sur les couleurs
        // on mémorise la conformité dans la variable mode

        if (position == 1) {
          if (t.forme == tuile.forme) {
            mode = "forme";
          }
          else {
            mode = "color";
          }
        }

        if (mode == "forme") {
          // mode formes
          if (t.forme != tuile.forme) {
            info("la ligne " + doc + " n'est pas conforme len=" + formes.length);
            return false;
          }
          let i = colors.indexOf(t.color);
          if (i > -1) {
            info("la ligne " + doc + " n'est pas conforme len=" + formes.length);
            return false;
          }
          colors.push(t.color);
        }
        else {
          // mode color
          if (t.color != tuile.color) {
            info("la ligne " + doc + " n'est pas conforme len=" + colors.length);
            return false;
          }
          let i = formes.indexOf(t.forme);
          if (i > -1) {
            info("la ligne " + doc + " n'est pas conforme len=" + colors.length);
            return false;
          }
          formes.push(t.forme);
        }
      }
      info("la ligne " + doc + " est conforme len=" + formes.length);
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
    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();
    let commandesXmax = commandesXoffset + 5*(getCellSize() + 7);
    let commandesYmax = commandesYoffset + getCellSize();

    if (x >= commandesXoffset && x <= commandesXmax && y >= commandesYoffset && y <= commandesYmax) {
      let commande = Math.floor((x - commandesXoffset)/(getCellSize() + 7));
      // console.log ("Jeu::findCommande> in", commande);
      return true;
    }
    return false;
  }

  draw() {

    // console.log("PanneauCommandes:draw", Jeu.pioche.length);

    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();

    let x;
    let y;

    let commandes = [TuileZoomin, TuileZoomout, TuileUndo, TuileOk, TuileSwap];
    for (let c = 0; c < commandes.length; c++) {
      x = commandesXoffset + c*(getCellSize() + 7);
      y = yoffsetCommandes();
      let commande = commandes[c];
      //console.log("commande=", commande, x, y);
      commande.draw(x, y);
    }

    x += 2 * cellSize;
    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("pioche " + Jeu.pioche.length , x + getCellSize()*0.3, y + getCellSize()*0.7);

  }

  executeCommande(e) {
    let x = e.clientX - 8;
    let y = e.clientY - 8;

    // [TuileZoomin, TuileZoomout, TuileUndo, TuileOk, TuileSwap];

    let commandesXoffset = 0;
    let commandesYoffset = yoffsetCommandes();
    let commandesXmax = commandesXoffset + 5*(getCellSize() + 7);
    let commandesYmax = commandesYoffset + getCellSize();


    let xc = commandesXoffset;
    let yc = commandesYoffset;
    if ((x >= commandesXoffset) && (x <= commandesXoffset + 5*(getCellSize() + 7)))
      if ((y >= commandesYoffset) && (y <= commandesYoffset + getCellSize())) {
        let commande = Math.floor((x - commandesXoffset)/(getCellSize() + 7));
        // console.log("executeCommande> x=" + x + " commande=" + commande);
        switch (commande) {
          case 0:
            // zoomin
            cellSize = getCellSize() + 5;
            break;
          case 1:
            // zoomout
            console.log("zoomout", getCellSize());
            cellSize = getCellSize() - 5;;
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
            // swap
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

  init() {
    // création de toutes les 3 x 6 x 6 tuiles ordonnées
    for (let layer = 0; layer < 3; layer++)
        for (let c = 0; c < colors.length; c++) {
          for (let f = 0; f < formes.length; f++) {
            let color = colors[c];
            let forme = formes[f];
            let t = new Tuile(color, forme);
            //console.log(color, forme, t);
            this.tuiles.push(t);
          }
        }

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
    this.working.draw();
    this.commandes.draw();
  }

  drawCellFrame(c0, r0, color) {
    for (let c = c0; c <= c0 + 1; c++)
    {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(c*getCellSize(), r0*getCellSize());
      ctx.lineTo(c*getCellSize(), (r0+1)*getCellSize());
      ctx.stroke();
      for (let r = r0; r <= r0 + 1; r++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(c0*getCellSize(), r*getCellSize());
        ctx.lineTo((c0+1)*getCellSize(), r*getCellSize());
        ctx.stroke();
      }
    }
  }

  selectUserPosition(user, position) {
    // console.log("selectUserPosition>", user, position);
    this.userSelected = user;
    this.positionSelected = position;
  }

  drawTuiles () {
    // dessin test des tuiles à côté du plateau juste pour visualiser
    if (canvas.getContext) {
      // let xoffset = 0;
      let xoffset = (this.width + 2)*getCellSize();
      let yoffset = 2 * getCellSize();
      let t = 0;
      for (let c = 0; c < colors.length; c++) {
        for (let f = 0; f < formes.length; f++) {
          //console.log("PlateauJeu:drawTuiles> ", Jeu);
          let tuile = this.tuiles[t];
          //console.log("PlateauJeu:drawTuiles>", tuile);
          tuile.draw(xoffset + c*getCellSize(), yoffset + f*getCellSize());
          t++;
        }
      }

      for (let c = 0; c < 6; c++ ) {
        for (let r = 0; r < 6; r++ ) {
          let x = c * getCellSize();
          let y = r * getCellSize();
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.strokeRect(xoffset + x, yoffset + y, getCellSize(), getCellSize());
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
        }
  }

  // console.log("mousemove> 2", found, "where=", where, "position=", Jeu.positionSelected);

  if (!done)
  {
    //console.log("mousemove> else");
    let u;

    Jeu.selectUserPosition(u, u);
    Jeu.tuileSelected = u;
    Jeu.cSelected = u;
    Jeu.rSelected = u;
  }
}

function déplacement(x, y) {
  if (Jeu.positionSelected >= 0) {
    // console.log("déplacement> ", x, y);
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
    tuile.draw(x, y);
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

