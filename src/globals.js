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

const tilemap = [];
const knownMap = [];

for (let y = 0; y < MAP_TILED_HEIGHT; y++) {
  tilemap.push([]);
  knownMap.push([]);
  for (let x = 0; x < MAP_TILED_WIDTH; x++) {
    tilemap[y].push([]);
    knownMap[y].push([]);
  }
}

const entities = [];

const viewPort = {
  x: 0,
  y: 0,
  w: 50,
  h: 50,
  scrollTo(x, y) {
    this.x = x - Math.floor(this.w / 2);
    this.y = y - Math.floor(this.h / 2);
  },
};

const rooms = [];

const time = {
  currentTime: 0,
  timeJump: 0,
};

const uniqueAssets = {};
const uniqueAssetsDark = {};

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
  knownMap,
  entities,
  rooms,
  time,
  uniqueAssets,
  uniqueAssetsDark,
};
