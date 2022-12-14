//              0       1            2       3          4         5         6
const colors = ["red", "darkviolet", "lime", "skyblue", "orange", "yellow", "silver"];
//              0       1        2          3        4         5         6       7         8          9       10    11          12      13
const formes = ["rond", "carré", "losange", "croix", "trefle", "étoile", "vide", "zoomin", "zoomout", "undo", "ok", "poubelle", "save", "restore"];

const COLOR_RED = 0;
const COLOR_DARKVIOLET = 1;
const COLOR_LIME = 2;
const COLOR_SKYBLUE = 3;
const COLOR_ORANGE = 4;
const COLOR_YELLOW = 5;
const COLOR_SILVER = 6;

const FORME_ROND = 0;
const FORME_CARRE = 1;
const FORME_LOSANGE = 2;
const FORME_CROIX = 3;
const FORME_TREFLE = 4;
const FORME_ETOILE = 5
const FORME_VIDE = 6;
const FORME_ZOOMIN = 7;
const FORME_ZOOMOUT = 8;
const FORME_UNDO = 9;
const FORME_OK = 10;
const FORME_POUBELLE = 11;
const FORME_SAVE = 12;
const FORME_RESTORE = 13;
const FORME_SIMULATION = 14;

function TuileId(color, forme, layer) {
  return layer*1000 + color*100 + forme;
}

function TuileGetLayer(id) {
  return Math.floor(id/1000);
}

function TuileGetColor(id) {
  let layer = TuileGetLayer(id);
  return Math.floor((id - layer*1000)/100);
}

function TuileGetForme(id) {
  return id % 100;
}

function TuileDraw(id, x, y) {
  let color = TuileGetColor(id);
  let forme = TuileGetForme(id);
  let layer = TuileGetLayer(id);

  const ctx = canvas.getContext('2d');

  //console.log("TuileDraw> forme=", forme);

  switch (forme) {
    case FORME_ROND:
      drawRond(ctx, colors[color], x, y);
      break;
    case FORME_CARRE:
      drawSquare(ctx, colors[color], x, y);
      break;
    case FORME_LOSANGE:
      drawLosange(ctx, colors[color], x, y);
      break;
    case FORME_CROIX:
      drawCross(ctx, colors[color], x, y);
      break;
    case FORME_TREFLE:
      drawTrefle(ctx, colors[color], x, y);
      break;
    case FORME_ETOILE:
      drawStar(ctx, colors[color], x, y);
      break;
    case FORME_VIDE:
      drawVide(ctx, x, y);
      break;
    case FORME_ZOOMIN:
      drawZoomin(ctx, x, y);
      break;
    case FORME_ZOOMOUT:
      drawZoomout(ctx, x, y);
      break;
    case FORME_UNDO:
      drawUndo(ctx, x, y);
      break;
    case FORME_OK:
      drawOk(ctx, x, y);
      break;
    case FORME_POUBELLE:
      drawPoubelle(ctx, x, y);
      break;
    case FORME_SAVE:
      drawSave(ctx, x, y);
      break;
    case FORME_RESTORE:
      drawRestore(ctx, x, y);
      break;
    case FORME_SIMULATION:
      drawSimulation(ctx, x, y);
      break;
  }
}

function TuileTestVide(id) {
  return TuileGetForme(id) == FORME_VIDE;
}

function TuileShow(id) {
  // console.log("Tuile", "c=", TuileGetColor(id), "f=", TuileGetForme(id), "L=", TuileGetLayer(id));
}

function TuileToText(id) {
  return id;
  //return "c=" + TuileGetColor(id) + " f=" + TuileGetForme(id) + " L=" + TuileGetLayer(id);
}

function drawFrame(ctx, x, y, color) {
  let cell = getCellSize();

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x, y);
  ctx.lineTo(x + cell, y);

  ctx.moveTo(x, y + cell);
  ctx.lineTo(x + cell, y + cell);

  ctx.moveTo(x, y);
  ctx.lineTo(x, y + cell);

  ctx.moveTo(x + cell, y);
  ctx.lineTo(x + cell, y + cell);

  ctx.stroke();
}

function drawZoomin(ctx, x, y) {
    //console.log("zoomin", x, y);

    let cell = getCellSize();

    drawFrame(ctx, x, y, "red");

    ctx.fillStyle = "DimGray";
    ctx.beginPath();
    ctx.fillRect(x, y, cell, cell);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(x + cell*0.1, y + cell/2);
    ctx.lineTo(x + cell*0.9, y + cell/2);
    ctx.moveTo(x + cell/2, y + cell*0.1);
    ctx.lineTo(x + cell/2, y + cell*0.9);
    ctx.stroke();
  }

function drawZoomout(ctx, x, y) {
    //console.log("zoomout", x, y);

    let cell = getCellSize();

    drawFrame(ctx, x, y, "red");

    ctx.beginPath();
    ctx.fillRect(x, y, cell, cell);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(x + cell*0.1, y + cell/2);
    ctx.lineTo(x + cell*0.9, y + cell/2);
    ctx.stroke();
  }

function drawUndo(ctx, x, y) {
  let cell = getCellSize();
    drawFrame(ctx, x, y, "red");
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.fillRect(x, y, cell, cell);
    ctx.fill();

    ctx.fillStyle = 'green';
    ctx.font = '15px san-serif';
    ctx.fillText("z", x + cell*0.3, y + cell*0.7);
  }

function drawOk(ctx, x, y) {
  let cell = getCellSize();

  drawFrame(ctx, x, y, "red");
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.fillRect(x, y, cell, cell);
  ctx.fill();

  ctx.fillStyle = 'green';
  ctx.font = '15px san-serif';
  ctx.fillText("ok", x + cell*0.15, y + cell*0.7);
}

function drawPoubelle(ctx, x, y) {
    let cell = getCellSize();

    drawFrame(ctx, x, y, "red");
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.fillRect(x, y, cell, cell);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(x + 0.45 * cell, y + 0.2 * cell);
    ctx.lineTo(x + 0.55 * cell, y + 0.2 * cell);
    ctx.moveTo(x + 0.45 * cell, y + 0.25 * cell);
    ctx.lineTo(x + 0.55 * cell, y + 0.25 * cell);

    ctx.moveTo(x + 0.2 * cell, y + 0.3 * cell);
    ctx.lineTo(x + 0.8 * cell, y + 0.3 * cell);
    ctx.lineTo(x + 0.8 * cell, y + 0.9 * cell);
    ctx.lineTo(x + 0.2 * cell, y + 0.9 * cell);
    ctx.lineTo(x + 0.2 * cell, y + 0.3 * cell);
    ctx.moveTo(x + 0.1 * cell, y + 0.3 * cell);
    ctx.lineTo(x + 0.9 * cell, y + 0.3 * cell);

    ctx.moveTo(x + 0.3 * cell, y + 0.6 * cell);
    ctx.lineTo(x + 0.7 * cell, y + 0.6 * cell);

    ctx.moveTo(x + 0.3 * cell, y + 0.7 * cell);
    ctx.lineTo(x + 0.7 * cell, y + 0.7 * cell);

    ctx.moveTo(x + 0.3 * cell, y + 0.8 * cell);
    ctx.lineTo(x + 0.7 * cell, y + 0.8 * cell);

    ctx.stroke();
  }

function drawVide(ctx, x, y) {
  let cell = getCellSize();
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.fillRect(x, y, cell, cell);
    ctx.fill();

    for (let c = 0; c <= 1; c++) {
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.moveTo(x + c*cell, y);
        ctx.lineTo(x + c*cell, y + cell);
        ctx.stroke();
    }
    for (let r = 0; r <= 1; r++) {
      ctx.beginPath();
      ctx.strokeStyle = "grey";
      ctx.moveTo(x, y + r*cell);
      ctx.lineTo(x + cell, y + r*cell);
      ctx.stroke();
    }
  }

function drawRond(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, cell, cell);

    let radius = getCellSize2() - margin();
    ctx.fillStyle = color;
    ctx.arc(x + getCellSize2(), y + getCellSize2(), radius, 0, Math.PI * 2, true);
    ctx.fill();
  }

function drawSquare(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, cell, cell);

    let width = cell*0.9 - 2*margin();

    ctx.fillStyle = color;
    ctx.fillRect(x + getCellSize2() - width/2, y + getCellSize2() - width/2, cell*0.9 - 2*margin(), cell*0.9 - 2*margin());
    ctx.fill();
  }

function drawLosange(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, cell, cell);

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + margin(), y + getCellSize2());             // 1
    ctx.lineTo(x + getCellSize2(), y + margin());             // 2
    ctx.lineTo(x + cell - margin(), y + getCellSize2());  // 3
    ctx.lineTo(x + getCellSize2(), y + cell - margin());  // 4
    ctx.lineTo(x + margin(), y + getCellSize2());
    ctx.fill();
  }

function drawCross(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, cell, cell);

    ctx.fillStyle = color;

    let radius = getCellSize2() * 0.3;
    ctx.beginPath();
    ctx.moveTo(x + margin(), y + margin()); // 1
    ctx.lineTo(x + getCellSize2(), y + getCellSize2() - radius); // 2
    ctx.lineTo(x + cell - margin(), y + margin()); // 3
    ctx.lineTo(x + getCellSize2() + radius, y + getCellSize2()); // 4
    ctx.lineTo(x + cell - margin(), y + cell - margin()); // 5
    ctx.lineTo(x + getCellSize2(), y + getCellSize2() + radius); // 6
    ctx.lineTo(x + margin(), y + cell - margin()); // 7
    ctx.lineTo(x + getCellSize2() - radius, y + getCellSize2()); // 8
    ctx.lineTo(x + margin(), y + margin()); // 1
    ctx.fill();
  }

function drawTrefle(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";

    ctx.fillRect(x, y, cell, cell);
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

function drawStar(ctx, color, x, y) {
  let cell = getCellSize();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.fillStyle = "black";


    ctx.fillRect(x, y, cell, cell);

    let radius = cell*0.15;
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

function drawSave(ctx, x, y) {
  let cell = getCellSize();

  drawFrame(ctx, x, y, "red");
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.fillRect(x, y, cell, cell);
  ctx.fill();

  ctx.fillStyle = 'green';
  ctx.font = '15px san-serif';
  ctx.fillText("S", x + cell*0.15, y + cell*0.7);
}

function drawRestore(ctx, x, y) {
  let cell = getCellSize();

  drawFrame(ctx, x, y, "red");
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.fillRect(x, y, cell, cell);
  ctx.fill();

  ctx.fillStyle = 'green';
  ctx.font = '15px san-serif';
  ctx.fillText("R", x + cell*0.15, y + cell*0.7);
}

function drawSimulation(ctx, x, y) {
  let cell = getCellSize();

  drawFrame(ctx, x, y, "red");
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.fillRect(x, y, cell, cell);
  ctx.fill();

  ctx.fillStyle = 'green';
  ctx.font = '15px san-serif';
  ctx.fillText("Sim", x + cell*0, y + cell*0.7);
}

// Une instance de Tuile unique pour installer sur des cellules particulières: La cellule vide, les cellules pour les commandes
let TuileVide = TuileId (COLOR_SILVER, FORME_VIDE, 0);
let TuileZoomin = TuileId (COLOR_SILVER, FORME_ZOOMIN, 0);
let TuileZoomout = TuileId (COLOR_SILVER, FORME_ZOOMOUT, 0);
let TuileUndo = TuileId (COLOR_SILVER, FORME_UNDO, 0);
let TuileOk = TuileId (COLOR_SILVER, FORME_OK, 0);
let TuilePoubelle = TuileId (COLOR_SILVER, FORME_POUBELLE, 0);
let TuileSave = TuileId (COLOR_SILVER, FORME_SAVE, 0);
let TuileRestore = TuileId (COLOR_SILVER, FORME_RESTORE, 0);
let TuileSimulation = TuileId (COLOR_SILVER, FORME_SIMULATION, 0);

