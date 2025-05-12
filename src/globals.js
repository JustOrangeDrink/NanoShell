const html = document.querySelector("html");

const SCREEN_WIDTH = html.clientWidth;
const SCREEN_HEIGHT = html.clientHeight;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 24;

const CANVAS_TILED_WIDTH = Math.floor((SCREEN_WIDTH * 0.7) / TILE_SIZE);
const CANVAS_TILED_HEIGHT = Math.floor(SCREEN_HEIGHT / TILE_SIZE);

const uiCanvas = document.querySelectorAll("canvas")[1];
const uiCtx = uiCanvas.getContext("2d");

uiCanvas.width = CANVAS_TILED_WIDTH * 0.5 * TILE_SIZE;
uiCanvas.height = CANVAS_TILED_HEIGHT * TILE_SIZE;

canvas.width = CANVAS_TILED_WIDTH * TILE_SIZE;
canvas.height = CANVAS_TILED_HEIGHT * TILE_SIZE;

const MAP_TILED_WIDTH = 100;
const MAP_TILED_HEIGHT = 100;

const spritesheet = document.createElement("img");

class Tile {
  constructor() {
    return new Proxy([], {
      set: (targ, prop, val) => {
        if (!val) return;
        targ.sort((a, b) => a.z - b.z);
        return (targ[prop] = val);
      },
      get: (targ, prop) => {
        if (prop == "splice") {
          return (...args) => targ[prop].apply(targ, args);
        }
        return targ[prop];
      },
    });
  }
}

const tilemap = [];
for (let y = 0; y < MAP_TILED_HEIGHT; y++) {
  tilemap.push([]);
  for (let x = 0; x < MAP_TILED_WIDTH; x++) {
    tilemap[y].push(new Tile());
  }
}

const viewPort = {
  x: 0,
  y: 0,
  w: 66,
  h: 66,
  scrollTo(x, y) {
    this.x = x - Math.floor(this.w / 2);
    this.y = y - Math.floor(this.h / 2);

    if (viewPort.x < -14) viewPort.x = -14;
    if (viewPort.x > 47) viewPort.x = 47;

    if (viewPort.y < -20) viewPort.y = -20;
    if (viewPort.y > 53) viewPort.y = 53;
  },
};

const rooms = [];

export {
  canvas,
  ctx,
  uiCanvas,
  uiCtx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  TILE_SIZE,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
  MAP_TILED_WIDTH,
  MAP_TILED_HEIGHT,
  spritesheet,
  viewPort,
  tilemap,
  rooms,
};
