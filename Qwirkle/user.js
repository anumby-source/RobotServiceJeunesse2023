// un événement est le fait de jouer une tuile.
// chaque evt est mémorisé dans l'historique du joueur
// l'historique du joueur est remis à zéro à chaque tour
// les tour de jeu sont mémorisés dans l'historique de la partie du joueur
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

    let joués = 0;
    for (let t = 0; t < 6; t++) {
      if (TuileTestVide(this.jeu[t])) joués++;
    }

    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("jeu=[" + joués + "]", xoffset + 10*cell, yoffset + 0.7 * cell);
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

