const html = document.querySelector("html");

const TILE_SIZE = 24;

const spritesheet = document.createElement("img");
spritesheet.src = "assets/spritesheet.png";

const SCREEN_WIDTH = html.clientWidth;
const SCREEN_HEIGHT = html.clientHeight;

const CANVAS_TILED_WIDTH = Math.floor((SCREEN_WIDTH * 0.7) / TILE_SIZE);
const CANVAS_TILED_HEIGHT = Math.floor(SCREEN_HEIGHT / TILE_SIZE);

const canvas = document.getElementsByClassName("game")[0];
const ctx = canvas.getContext("2d");

const mainUiCanvas = document.getElementsByClassName("main_ui")[0];
const mainUiCtx = mainUiCanvas.getContext("2d");

const inventoryUiCanvas = document.getElementsByClassName("inventory_ui")[0];
const inventoryUiCtx = inventoryUiCanvas.getContext("2d");

const popupUiCanvas = document.getElementsByClassName("popup_ui")[0];
const popupUiCtx = popupUiCanvas.getContext("2d");

canvas.width = CANVAS_TILED_WIDTH * TILE_SIZE;
canvas.height = CANVAS_TILED_HEIGHT * TILE_SIZE;

mainUiCanvas.width = CANVAS_TILED_WIDTH * 0.5 * TILE_SIZE;
mainUiCanvas.height = CANVAS_TILED_HEIGHT * TILE_SIZE;

inventoryUiCanvas.width = SCREEN_WIDTH;
inventoryUiCanvas.height = SCREEN_HEIGHT;

popupUiCanvas.width = SCREEN_WIDTH;
popupUiCanvas.height = SCREEN_HEIGHT;

const MAP_TILED_WIDTH = 100;
const MAP_TILED_HEIGHT = 100;

const tilemap = [];
const knownMap = [];
const animationMap = [];

for (let y = 0; y < MAP_TILED_HEIGHT; y++) {
  tilemap.push([]);
  knownMap.push([]);
  animationMap.push([]);
  for (let x = 0; x < MAP_TILED_WIDTH; x++) {
    tilemap[y].push([]);
    knownMap[y].push([]);
    animationMap[y].push([]);
  }
}

const entities = [];

const viewPort = {
  x: 0,
  y: 0,
  w: 30,
  h: 30,
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
  mainUiCanvas,
  mainUiCtx,
  inventoryUiCanvas,
  inventoryUiCtx,
  popupUiCanvas,
  popupUiCtx,
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
  animationMap,
  entities,
  rooms,
  time,
  uniqueAssets,
  uniqueAssetsDark,
};
