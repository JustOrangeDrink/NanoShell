const html = document.querySelector("html");

const SCREEN_WIDTH = html.clientWidth;
const SCREEN_HEIGHT = html.clientHeight;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 24;

const CANVAS_TILED_WIDTH = Math.floor(SCREEN_WIDTH / TILE_SIZE);
const CANVAS_TILED_HEIGHT = Math.floor(SCREEN_HEIGHT / TILE_SIZE);

canvas.width = CANVAS_TILED_WIDTH * TILE_SIZE;
canvas.height = CANVAS_TILED_HEIGHT * TILE_SIZE;

const spritesheet = document.createElement("img");

const viewPort = {
  x: 0,
  y: 0,
  w: 10,
  h: 10,
  scrollTo(x, y) {
    this.x = x - Math.floor(this.w / 2);
    this.y = y - Math.floor(this.h / 2);
  },
};

export {
  canvas,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  TILE_SIZE,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
  spritesheet,
  viewPort,
};
