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

class Ligne {
  constructor(orientation, ancrage, p1, p2) {
    // l'orientation peut être H ou V
    this.orientation = orientation;
    // l'ancrage peut être le row pour H, ou la column pour V
    this.ancrage = ancrage
    // la ligne s'étend entre [p1 ... p2]
    // pour H: p1 et p2 sont des columns
    // pour V: p1 et p2 sont des rows
    this.p1 = p1;
    this.p2 = p2;
    if (p1 > p2) {
      this.p1 = p2;
      this.p2 = p1;
    }
  }

  length() {
    return this.p2 - this.p1 + 1;
  }

  extend() {
    // on scan toute la longueur de la ligne, jusqu'à on trouve une cellule vide, dans les deux directions
    // pour obtenir la valeur la plus grande pour p1 et p2
    // console.log("Ligne:extend> before>", "o=", this.orientation, "ancrage=", this.ancrage, "p1=", this.p1, "p2=", this.p2);
    if (this.orientation == HORIZONTAL) {
      let r0 = this.ancrage + Jeu.working.r0;
      let c1;
      let c2;
      c1 = this.p1 + Jeu.working.c0;
      c2 = this.p2 + Jeu.working.c0;
      if (c1 > c2) {
        c1 = this.p2 + Jeu.working.c0;
        c2 = this.p1 + Jeu.working.c0;
      }
      // console.log("Ligne:extend>", "c1=", c1, "c2=", c2);
      for (let c = c1 - 1; c >= 0; c--) {
        // console.log("Ligne:extend> à gauche", "c=", c);
        if (!Jeu.working.vide(c, r0)) this.p1--;
        else break;
      }
      for (let c = c2 + 1; c <= Jeu.working.cmax; c++) {
        // console.log("Ligne:extend> à droite", "c=", c);
        if (!Jeu.working.vide(c, r0)) this.p2++;
        else break;
      }
    }
    else {
      let c0 = this.ancrage + Jeu.working.c0;
      let r1;
      let r2;
      r1 = this.p1 + Jeu.working.r0;
      r2 = this.p2 + Jeu.working.r0;
      if (r1 > r2) {
        r1 = this.p2 + Jeu.working.r0;
        r2 = this.p1 + Jeu.working.r0;
      }
      for (let r = r1 - 1; r >= 0; r--) {
        if (!Jeu.working.vide(c0, r)) this.p1--;
        else break;
      }
      for (let r = r2 + 1; r <= Jeu.working.rmax; r++) {
        if (!Jeu.working.vide(c0, r)) this.p2++;
        else break;
      }
    }
    // console.log("Ligne:extend> after>", "o=", this.orientation, "ancrage=", this.ancrage, "p1=", this.p1, "p2=", this.p2);
  }

  aligné(column, row) {
    if (this.orientation == HORIZONTAL) {
      return (this.ancrage + Jeu.working.r0 == row);
    }
    else {
      return (this.ancrage + Jeu.working.c0 == column);
    }
  }

  compatible(tuile) {
    // on vérifie:
    //  - que l'ensemble de la ligne est compatible avec cette tuile (soit homogène en couleur ou en forme
    //  - qu'il n'y ait pas de doublon entre la ligne et la tuile testée

    let forme = TuileGetForme(tuile);
    let color = TuileGetColor(tuile);

    // console.log("Ligne:compatible>", "forme=", forme, "color=", color);

    if (this.orientation == HORIZONTAL) {
      let r0 = this.ancrage + Jeu.working.r0;
      let c1 = this.p1 + Jeu.working.c0;
      let i1 = Jeu.working.index(c1, r0);
      let c2 = this.p2 + Jeu.working.c0;
      let i2 = Jeu.working.index(c2, r0);

      for (let c = c1; c >= c2; c--) {
        // console.log("Ligne:compatible>", "r0=", r0, "c1=", c1, "c2=", c2, "c=", c);
        if (!Jeu.working.compatible(c, r0, forme, color)) return false;
        // console.log("Ligne:compatible>", "ok compatible");
        let t = Jeu.working.getElement(c, r0);
        // console.log("Ligne:compatible>", "t=", t, "t.forme=", TuileGetForme(t), "t.color=", TuileGetColor(t));
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
        // console.log("Ligne:compatible>", "ok compatible");
      }
    }
    else {
      let c0 = this.ancrage + Jeu.working.c0;
      let r1 = this.p1 + Jeu.working.r0;
      let i1 = Jeu.working.index(c0, r1);
      let r2 = this.p2 + Jeu.working.r0;
      let i2 = Jeu.working.index(c0, r2);

      for (let r = r1; r >= r2; r--) {
        if (!Jeu.working.compatible(c0, r, forme, color)) return false;
        let t = Jeu.working.getElement(c0, r);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
      }
    }

    return true;
  }

  canJoin(tuile, other) {
    // ==> on vérifie que la tuile puis la ligne "other" peuvent être ajoutées
    // on suppose que la tuile ET la ligne "other" sont déjà compatibles entre elles
    // et que bien sûr les deux lignes ont la même orientation et le même ancrage (puisqu'elles sont toute deux compatibles avec la tuile)
    // il reste à vérifier qu'il n'y a pas de doublon sur l'ensemble une fois joint

    let forme = TuileGetForme(tuile);
    let color = TuileGetColor(tuile);

    if (this.orientation == HORIZONTAL && other.orientation == HORIZONTAL) {
      let r0 = this.ancrage + Jeu.working.r0;

      let c1;
      let c2;
      let c3;
      let c4;

      if (this.p1 < other.p1) {
        c1 = this.p1 + Jeu.working.c0;
        c2 = this.p2 + Jeu.working.c0;
        c3 = other.p1 + Jeu.working.c0;
        c4 = other.p2 + Jeu.working.c0;
      }
      else {
        c1 = other.p1 + Jeu.working.c0;
        c2 = other.p2 + Jeu.working.c0;
        c3 = this.p1 + Jeu.working.c0;
        c4 = this.p2 + Jeu.working.c0;
      }

      for (let c = c1; c >= c4; c--) {
        if (c > c2 && c < c3) continue;
        let t = Jeu.working.getElement(c, r0);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
      }
    }
    else if (this.orientation == VERTICAL && other.orientation == VERTICAL) {
      let c0 = this.ancrage + Jeu.working.c0;

      let r1;
      let r2;
      let r3;
      let r4;

      if (this.p1 < other.p1) {
        r1 = this.p1 + Jeu.working.r0;
        r2 = this.p2 + Jeu.working.r0;
        r3 = other.p1 + Jeu.working.r0;
        r4 = other.p2 + Jeu.working.r0;
      }
      else {
        r1 = other.p1 + Jeu.working.r0;
        r2 = other.p2 + Jeu.working.r0;
        r3 = this.p1 + Jeu.working.r0;
        r4 = this.p2 + Jeu.working.r0;
      }

      for (let r = r1; r >= r2; r--) {
        if (r > r2 && r < r3) continue;
        let t = Jeu.working.getElement(c0, r);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
      }
    }
  }
}

// Définition de la classe pour les utilisateurs
class User {
  constructor(numéro, name) {
    this.numéro = numéro;
    this.name = name;
    this.jeu = [];
    this.score = 0;
    for (let t = 0; t < 6; t++) this.jeu.push(TuileVide);
    this.poubelle = [];
    for (let t = 0; t < 6; t++) this.poubelle.push(TuileVide);
    this.partie = [];
    this.historique = [];
    this.ligne;
  }

  tuilesJouées() {
    let jouées = 0;
    for (let t = 0; t < 6; t++) {
      if (TuileTestVide(this.jeu[t])) jouées++;
    }
    return jouées;
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

    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("jeu=[" + this.tuilesJouées() + "]", xoffset + 10*cell, yoffset + 0.7 * cell);

    let n = this.getScore();

    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("score=[" + this.score + "]", xoffset + 13*cell, yoffset + 0.7 * cell);

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

  getScore() {
    // console.log("User:getScore>");
    let n = 0;
    let ligne;
    if (this.historique.length == 0) {
    }
    else if (this.historique.length == 1) {
      let evt = this.historique[0];
      let h = new Ligne(HORIZONTAL, evt.r, evt.c, evt.c);
      h.extend();
      let hlen = h.length();
      let v = new Ligne(VERTICAL, evt.c, evt.r, evt.r);
      v.extend();
      let vlen = v.length();

      // console.log("User:getScore> ", h, hlen, v, vlen);

      if (hlen == 1 && vlen == 1) {
        return 1;
      }
      if (hlen == 1) return vlen;
      if (vlen == 1) return hlen;
    }
    else
    {
      let evt1 = this.historique[0];
      let evt2 = this.historique[this.historique.length - 1];

      if (evt1.r == evt2.r) {
        ligne = new Ligne(HORIZONTAL, evt1.r, evt1.c, evt2.c);
        ligne.extend();
        n += ligne.length();
        // console.log("User:getScore> ligne de base ", ligne, ligne.length(), evt1, evt2);

        let c1 = evt1.c;
        let c2 = evt2.c;
        if (c1 > c2) {
          c1 = evt2.c;
          c2 = evt1.c;
        }

        for (let c = c1; c <= c2; c++) {
          let l = new Ligne(VERTICAL, c, evt1.r, evt2.r);
          l.extend();
          if (l.length() > 1) n += l.length();
          // console.log("User:getScore> ligne transverse ", l, l.length(), n);
        }
      }
      else if (evt1.c == evt2.c) {
        ligne = new Ligne(VERTICAL, evt1.c, evt1.r, evt2.r);
        ligne.extend();
        n += ligne.length();
        // console.log("User:getScore> ligne de base ", ligne, ligne.length(), evt1, evt2);

        let r1 = evt1.r;
        let r2 = evt2.r;
        if (r1 > r2) {
          r1 = evt2.r;
          r2 = evt1.r;
        }

        for (let r = r1; r <= r2; r++) {
          let l = new Ligne(HORIZONTAL, r, evt1.c, evt2.c);
          l.extend();
          if (l.length() > 1) n += l.length();
          // console.log("User:getScore> ligne transverse ", l, l.length(), n);
        }
      }
    }
    return n;
  }

  ok() {
    // console.log("User:ok>", "histo=", this.historique.length, this.historique);
    let n = this.getScore();
    this.score += n;
    let histo = [];
    for (let h = 0; h < this.historique.length; h++) histo.push(this.historique[h]);
    this.partie.push(histo);
    this.historique = [];
    let u;
    this.ligne = u;
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

