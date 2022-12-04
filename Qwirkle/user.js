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
      let c1 = this.p1 + Jeu.working.c0;
      let c2 = this.p2 + Jeu.working.c0;
      if (c1 > c2) {
        [c1, c2] = [c2, c1];
      }
      // console.log("Ligne:extend>", "r0=", r0, "c1=", c1, "c2=", c2);

      let ext = range2(c1 - 1, -1);
      let a = ext.findIndex(c => Jeu.working.vide(c, r0));
      this.p1 -= a == -1 ? a.length : a;

      ext = range2(c2 + 1, Jeu.working.cmax + 1);
      a = ext.findIndex(c => Jeu.working.vide(c, r0));
      this.p2 += a == -1 ? a.length : a;
    }
    else {
      let c0 = this.ancrage + Jeu.working.c0;
      let r1 = this.p1 + Jeu.working.r0;
      let r2 = this.p2 + Jeu.working.r0;
      if (r1 > r2) {
        [r1, r2] = [r2, r1]
      }

      // console.log("Ligne:extend>", "r1=", r1, "r2=", r2);

      let ext = range2(r1 - 1, -1);
      let a = ext.findIndex(r => Jeu.working.vide(c0, r));
      this.p1 -= a == -1 ? a.length : a;

      ext = range2(r2 + 1, Jeu.working.rmax + 1);
      a = ext.findIndex(r => Jeu.working.vide(c0, r));
      this.p2 += a == -1 ? a.length : a;
    }
    // console.log("Ligne:extend> after>", "o=", this.orientation, "ancrage=", this.ancrage, "p1=", this.p1, "p2=", this.p2);
  }

  aligné(column, row) {
    // console.log("Ligne:aligné>", this, "c=", column, "r=", row, "c0=", Jeu.working.c0, "r0=", Jeu.working.r0);
    if (this.orientation == HORIZONTAL) {
      if (this.ancrage + Jeu.working.r0 == row) return GOOD;
    }
    else {
      if (this.ancrage + Jeu.working.c0 == column) return GOOD;
    }
    // console.log("Ligne:aligné> BAD");
    return BAD
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
      let c2 = this.p2 + Jeu.working.c0;

      if (c1 > c2) {
        [c1, c2] = [c2, c1];
      }

      let statut = range2(c1, c2 + 1).every(c => {
        // console.log("Ligne:compatible>", "r0=", r0, "c1=", c1, "c2=", c2, "c=", c);
        if (!Jeu.working.compatible(c, r0, forme, color)) return false;
        // console.log("Ligne:compatible>", "ok compatible");
        let t = Jeu.working.getElement(c, r0);
        // console.log("Ligne:compatible>", "t=", t, "t.forme=", TuileGetForme(t), "t.color=", TuileGetColor(t));
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
        // console.log("Ligne:compatible>", "ok compatible et différent");
        return true;
      }) ? GOOD: BAD;
      if (statut == BAD) return BAD;
    }
    else {
      let c0 = this.ancrage + Jeu.working.c0;
      let r1 = this.p1 + Jeu.working.r0;
      let r2 = this.p2 + Jeu.working.r0;

      if (r1 > r2) {
        [r1, r2] = [r2, r1];
      }

      // console.log("Ligne:compatible> VERTICAL", "r1=", r1, "r2=", r2);

      let statut = range2(r1, r2 + 1).every(r => {
        // console.log("Ligne:compatible>", "forme=", forme, "color=", color, "c=", c0, "r=", r);
        if (!Jeu.working.compatible(c0, r, forme, color)) return false;
        let t = Jeu.working.getElement(c0, r);
        // console.log("Ligne:compatible>", "forme=", forme, "color=", color, "c=", c0, "r=", r, "t=", t);
        // console.log("Ligne:compatible> A");
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
        // console.log("Ligne:compatible> B");
        return true;
      }) ? GOOD: BAD;
      if (statut == BAD) return BAD;
    }

    return GOOD;
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

      let statut = range2(c1, c4 + 1).every(c => {
        // si on est strictement entre ] ligne1 et ligne2 [ on contnue
        if (c > c2 && c < c3) return true;
        let t = Jeu.working.getElement(c, r0);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
        return true;
      }) ? GOOD: BAD;
      if (statut == BAD) return BAD;

      /*
      for (let c = c1; c >= c4; c--) {
        if (c > c2 && c < c3) continue;
        let t = Jeu.working.getElement(c, r0);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return BAD;
      }
      */
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

      let statut = range2(r1, r4 + 1).every(r => {
        if (r > r2 && r < r3) return true;
        let t = Jeu.working.getElement(c0, r);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return false;
        return true;
      }) ? GOOD: BAD;
      if (statut == BAD) return BAD;

      /*
      for (let r = r1; r >= r2; r--) {
        if (r > r2 && r < r3) continue;
        let t = Jeu.working.getElement(c0, r);
        if (TuileGetColor(t) == color && TuileGetForme(t) == forme) return BAD;
      }
      */
    }
    return GOOD
  }
}

// Définition de la classe pour les utilisateurs
class User {
  constructor(numéro, name) {
    this.numéro = numéro;
    this.name = name;
    this.jeu = [];
    this.score = 0;
    range(6).forEach(t => this.jeu.push(TuileVide));
    this.poubelle = [];
    range(6).forEach(t => this.poubelle.push(TuileVide));
    this.partie = [];
    this.historique = [];
    this.tourPrécédent = [];
    this.ligne;
    this.jouables = [];
  }

  tuilesJouées(jeu) {
    // on compte toutes les tuiles vides du jeu
    let jouées = 0;
    jeu.map(t => {if (TuileTestVide(t)) jouées++});
    return jouées;
  }

  draw() {
    let cell = getCellSize();

    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * cell;

    ctx.fillStyle = 'green';
    ctx.font = '30px san-serif';
    ctx.fillText(this.name, 0, yoffset + cell);

    range(6).map(c => {
      let t = this.jeu[c];
      // console.log(t, "xoffset=", xoffset + c*cell, yoffset, c);
      TuileDraw(t, xoffset + c*cell, yoffset);
    });

    let poubelles = 0;
    this.poubelle.map(p => {if (!TuileTestVide(p)) poubelles++;});

    TuileDraw(TuilePoubelle, xoffset + 7*cell, yoffset);
    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("[" + poubelles + "]", xoffset + 8.5*cell, yoffset + 0.7 * cell);

    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("jeu=[" + this.tuilesJouées(this.jeu) + "]", xoffset + 10*cell, yoffset + 0.7 * cell);

    let n = this.getScore();

    // console.log("User:draw", this.score);

    ctx.fillStyle = 'Blue';
    ctx.font = '15px san-serif';
    ctx.fillText("score=[" + this.score + "]", xoffset + 13*cell, yoffset + 0.7 * cell);

  }

  play() {
    let cell = getCellSize();
    // offset pour positionner les utilisateurs après la grille
    let xoffset = offsetJeu();
    let yoffset = yoffsetJoueurs() + 2 * this.numéro * cell;

    range(6).map(t => {
      let tuile = Jeu.pioche[0];
      Jeu.pioche.splice(0, 1);

      // console.log('User:play> ', tuile);

      TuileShow(tuile);

      this.jeu[t] = tuile;

      let x = xoffset + t*cell;
      let y = yoffset;
      // console.log('play> tuile=', tuile, TuileGetForme(tuile), TuileGetColor(tuile), x, y);
      TuileDraw(tuile, x, y);
    });

    /*
    for (let t = 0; t < 6; t++) {
      let tuile = Jeu.pioche[0];
      Jeu.pioche.splice(0, 1);

      // console.log('User:play> ', tuile);

      TuileShow(tuile);

      this.jeu[t] = tuile;

      let x = xoffset + t*cell;
      let y = yoffset;
      // console.log('play> tuile=', tuile, TuileGetForme(tuile), TuileGetColor(tuile), x, y);
      TuileDraw(tuile, x, y);
    }
    */

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
    this.historique = [];
  }

  getScore() {
    let n = 0;
    let ligne;
    if (this.historique.length == 0) return 0;

    console.log("---------------User:getScore> A", this.historique);

    if (this.historique.length == 1) {
      let evt = this.historique[0];
      let h = new Ligne(HORIZONTAL, evt.r, evt.c, evt.c);
      h.extend();
      let hlen = h.length();
      let v = new Ligne(VERTICAL, evt.c, evt.r, evt.r);
      v.extend();
      let vlen = v.length();

      if (vlen == QWIRKLE) vlen *= 2;
      if (hlen == QWIRKLE) hlen *= 2;

      if (hlen == 1 && vlen == 1) n = 1;
      else {
        if (hlen == 1) n = vlen;
        if (vlen == 1) n = hlen;
        if (hlen > 1 && vlen > 1) {
          n = vlen + hlen;
        }
      }

      console.log("User:getScore> B", h, hlen, v, vlen, "n=", n);

      return n;
    }
    else
    {
      let evt1 = this.historique[0];
      let evt2 = this.historique[this.historique.length - 1];

      if (evt1.r == evt2.r) {
        ligne = new Ligne(HORIZONTAL, evt1.r, evt1.c, evt2.c);
        ligne.extend();
        let local = ligne.length();
        if (local == QWIRKLE) local *= 2;
        n = local;
        console.log("User:getScore> C ligne de base ", ligne, ligne.length(), evt1, evt2, "n=", n);

        for (let ievt = 0; ievt < this.historique.length; ievt++) {
          let evt = this.historique[ievt];
          let l = new Ligne(VERTICAL, evt.c, evt.r, evt.r);
          l.extend();
          if (l.length() > 1) {
            local = l.length();
            if (local == QWIRKLE) local *= 2;
            n += local;
          }
          console.log("User:getScore> D ligne transverse ", l, l.length(), "local=", local, "n=", n);
        }
      }
      else if (evt1.c == evt2.c) {
        ligne = new Ligne(VERTICAL, evt1.c, evt1.r, evt2.r);
        ligne.extend();
        let local = ligne.length();
        if (local == QWIRKLE) local *= 2;
        n = local;
        console.log("User:getScore> E ligne de base ", ligne, ligne.length(), evt1, evt2, "n=", n);

        for (let ievt = 0; ievt < this.historique.length; ievt++) {
          let evt = this.historique[ievt];
          let l = new Ligne(HORIZONTAL, evt.r, evt.c, evt.c);
          l.extend();
          if (l.length() > 1) {
            local = l.length();
            if (local == QWIRKLE) local *= 2;
            n += local;
          }
          console.log("User:getScore> F ligne transverse ", l, l.length(), "local=", local, "n=", n);
        }
      }
    }
    return n;
  }

  ok() {
    // console.log("User:ok>", "histo=", this.historique.length, this.historique);
    let n = this.getScore();
    this.score += n;
    this.tourPrécédent = [];
    let histo = [];
    for (let h = 0; h < this.historique.length; h++) this.tourPrécédent.push(this.historique[h]);
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
    this.jouables = [];
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
        let tuile = Jeu.pioche[0];
        Jeu.pioche.splice(0, 1);
        //console.log('User:play> ', n);

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

  startSimulation() {
    let bonScore = [];
    let res = this.simulation([...this.jeu], bonScore, 0);
    let scores = structuredClone(JSON.parse(res));
    console.log("startSimulation> résultats=", scores.length, scores);
    let score = scores[0];
    let A = JSON.parse(score);
    let B = structuredClone(JSON.parse(score));
    console.log("startSimulation> score=", score, typeof(score), A, B, B[0]);
    let evts = B[0];
    evts.forEach(e => console.log("startSimulation> e=", e));

    evts.forEach(evt => {
      let tuile = this.jeu[evt.position];
      let c = evt.c + Jeu.working.c0;
      let r = evt.r + Jeu.working.r0;
      this.jeu[evt.position] = TuileVide;
      Jeu.working.grid.setElement(c, r);
    });

    this.ok();
    clear();
  }

  simulation(jeu, bonScores, niveau) {
    // on doit commencer par duppliquer la zone de travail puisqu'on va la changer pendant la simulatioon
    // il faut aussi trouver toutes les cellules jouables = celles qui sont sont contiguës aux cellules déjà jouées

    let prefix = ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
    let pre = prefix.slice(0, 2*niveau);
    console.log(pre, "........simulation>", "jeu=", jeu, "niveau=", niveau);

    let jouables = [];
    let tuile;
    let c;
    let r;
    if (Jeu.working.checkRuleA(tuile, c, r) == GOOD) {
      // this.jouables.push([Jeu.working.c0, Jeu.working.r0]);
      jouables.push([0, 0]);
      // console.log(pre, "simulation> set jouable A", "c=", 0, "r=", 0, jouables);
    }
    else {
      let cs = range2(Jeu.working.cmin, Jeu.working.cmax + 1);
      let rs = range2(Jeu.working.rmin, Jeu.working.rmax + 1);

      cs.forEach(c => rs.forEach(r => {
        let tuile = Jeu.working.grid.getElement(c - Jeu.working.cmin, r - Jeu.working.rmin);
        if (tuile >= 0 && TuileTestVide(tuile)) {
          if (Jeu.working.checkRuleD(tuile, c, r) == GOOD) {
            // console.log(pre, "simulation> set jouable AA", "c=", c, "r=", r);
            jouables.push([c - Jeu.working.c0, r - Jeu.working.r0]);
          }
        }
      }));
    }

    /*
    console.log(pre, "simulation> scan jouables", "jouables=", jouables);
    for (let ijouable = 0; ijouable < jouables.length; ijouable++) {
      let jouable = jouables[ijouable];
      let [c, r] = jouable;
      c += Jeu.working.c0;
      r += Jeu.working.r0;
      console.log(pre, "===simulation> test jouable", "jouable=", jouable, "c=", c, "r=", r);

      for (let ijeu = 0; ijeu < jeu.length; ijeu++) {
        let t = jeu[ijeu];
        if (TuileTestVide(t)) continue;
        {
          jeu[ijeu] = TuileVide;
        */


    for (let ijeu = 0; ijeu < jeu.length; ijeu++) {
      let t = jeu[ijeu];
      if (TuileTestVide(t)) continue;
      {
        console.log(pre, "simulation> scan jeu", "ijeu=", ijeu, "t=", t);
        jeu[ijeu] = TuileVide;

        this.historique.forEach(e => console.log(pre, "===simulation> avant scan jouable historique", "e=", e));

        let ligne;
        if (this.historique.length >= 2) {
          let e0 = this.historique[0];
          let e1 = this.historique[1];
          if (e1) {
            console.log("===simulation> deuxième tuile add ligne", "e0=", e0, "e1=", e1);

            if (e0.c == e1.c) {
              ligne = new Ligne(VERTICAL, e0.c, e0.r, e1.r);
            }
            else {
              ligne = new Ligne(HORIZONTAL, e0.r, e0.c, e1.c);
            }
          }
          ligne.extend();
        }
        if (ligne) console.log(pre, "===simulation> avant scan jouables historique", "ligne=", ligne);

        // console.log(pre, "simulation> scan jouables", "jouables=", jouables);
        for (let ijouable = 0; ijouable < jouables.length; ijouable++) {
          let jouable = jouables[ijouable];
          let [cRel, rRel] = jouable;
          c = cRel + Jeu.working.c0;
          r = rRel + Jeu.working.r0;
          if (ligne) {
            if (ligne.aligné(c, r) == BAD) continue;
          }
          console.log(pre, "===simulation> test jouable", "ijouable=", ijouable, "jouable=", jouable, "t=", t, "c=", c, "r=", r);

          if (Jeu.working.checkRules(this, jeu, t, c, r) == BAD) {
            jeu[ijeu] = t;
            continue;
          }
          // console.log(pre, "simulation> scan jeu", "ijeu=", ijeu, "t=", t, "c0=", Jeu.working.c0, "r0=", Jeu.working.r0);
          {
            console.log(pre, "===================simulation> tuile OK ", "ijeu=", ijeu, "ijouable=", ijouable, "c=", c, "r=", r);
            let i;
            [c, r, i] = Jeu.working.addTuile(t, c, r);
            Jeu.working.grid.show(pre + "grid");
            console.log(pre, "simulation> install tuile valide", "t=", t, "c=", c, "r=", r);
            this.addEvenement(ijeu, t, c - Jeu.working.c0, r - Jeu.working.r0);
            {
              let evts = this.historique.length;
              let n = this.getScore();
              if (n > 0) {
                console.log(pre, "simulation> une tuile a été ajouée nouveau score => n=", n);
                let h = [...this.historique];
                h.forEach(e => console.log(pre, "===================simulation> historique", "e=", e));

                bonScores.push(JSON.stringify([h, ijeu, c, r, n]));
                // console.log(pre, "===================simulation> after push bonScore=", bonScores);
                bonScores.forEach(b => console.log(pre, "===================simulation> after push bonScore", "b=", b));

                // ===========> poursuivre avec le niveau suivant
                console.log(pre, "simulation> start simulation niveau suivant", "ijouable=", ijouable, "ijeu=", ijeu, "prochain niveau", niveau + 1);
                // clear();
                // let quit = confirm("quit");
                // if (quit) return BAD;

                {
                  let res = this.simulation([...jeu], bonScores, niveau + 1);
                  // console.log(pre, "simulation> after simulation res=", res)
                  // console.log(pre, "simulation> after simulation previous bonScores=", bonScores)
                  let subScores = structuredClone(JSON.parse(res));
                  // console.log(pre, "simulation> after simulation subScores=", subScores)
                  if (subScores.length > 0) bonScores = [...bonScores, ...subScores];
                  // console.log(pre, "simulation> after simulation previous bonScores=", bonScores)
                  bonScores.forEach(b => console.log(pre, "===================simulation> after simulation bonScore", "b=", b));
                }
                console.log(pre, "simulation> retour du niveau + 1", ijouable, ijeu, niveau + 1)
              }
            }
            console.log(pre, "simulation> un-install tuile", "t=", t, "c=", c, "r=", r);
            this.historique.pop();
            Jeu.working.addTuile(TuileVide, cRel + Jeu.working.c0, rRel + Jeu.working.r0);
          }
        }
        jeu[ijeu] = t;
      }
    };

    // console.log(pre, "***simulation> END", bonScores);
    let resultatsBruts = bonScores.map(b => structuredClone(JSON.parse(b)));
    let resultats = resultatsBruts.sort((x,y) => x[4] - y[4]);
    let maxScore = Math.max(...resultats.map(x => x[4]));
    console.log(pre, "***simulation> END max score", maxScore);
    let topResults = resultats.filter(x => x[4] == maxScore);
    let selectResult = Math.trunc(topResults.length*Math.random());
    console.log(pre, "---- selected best score=", topResults.length, selectResult, topResults[selectResult]);
    let res = [JSON.stringify(topResults[selectResult])];

    console.log(">>>>>> res=", res);

    res = JSON.stringify(res);
    console.log(">>>>>> res=", res);
    return res;
  }
}

