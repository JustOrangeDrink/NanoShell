const html = document.querySelector("html");
const body = document.querySelector("body");

const SCREEN_WIDTH = html.clientWidth;
const SCREEN_HEIGHT = html.clientHeight;

const tileSize = 24;

const canvas = document.querySelector("canvas");
//Recalculating size so it in tiles boundaries
canvas.width = Math.floor(SCREEN_WIDTH / tileSize) * tileSize;
canvas.height = Math.floor(SCREEN_HEIGHT / tileSize) * tileSize;

const ctx = canvas.getContext("2d");

const spritesheet = document.createElement("img");
spritesheet.src = "assets/spritesheet.png";

spritesheet.onload = renderWorld;

function drawTile([char_x, char_y], color) {
  const offscreenCanvas = new OffscreenCanvas(tileSize, tileSize);
  const offscreenCtx = offscreenCanvas.getContext("2d");

  offscreenCtx.fillStyle = color;
  offscreenCtx.fillRect(0, 0, tileSize, tileSize);

  offscreenCtx.globalCompositeOperation = "destination-in";

  offscreenCtx.drawImage(
    spritesheet,
    char_x * tileSize,
    char_y * tileSize,
    tileSize,
    tileSize,
    0,
    0,
    tileSize,
    tileSize
  );
  return offscreenCanvas;
}

const entities = [];
class Entity {
  constructor(x, y, char, color, collision) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.char = char;
    this.color = color;
    this.collision = collision;

    entities.push(this);
  }
}

function renderWorld() {
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    const entityTile = drawTile(entity.char, entity.color);
    ctx.drawImage(entityTile, entity.x * tileSize, entity.y * tileSize);
  }
}

function clearWorld() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

const zombie = new Entity(11, 15, [10, 5], "green", true);
const hero = new Entity(13, 10, [0, 4], "white", true);

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "a":
      hero.x--;
      break;
    case "d":
      hero.x++;
      break;
    case "w":
      hero.y--;
      break;
    case "s":
      hero.y++;
      break;

    default:
      break;
  }
  clearWorld();
  renderWorld();
});
