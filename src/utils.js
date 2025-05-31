import {
  CANVAS_TILED_HEIGHT,
  CANVAS_TILED_WIDTH,
  TILE_SIZE,
  entities,
  spritesheet,
  tilemap,
  uniqueAssets,
  uniqueAssetsDark,
  viewPort,
} from "./globals.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}

// By Michał Piasecki on https://medium.com/@mpias/html-canvas-how-to-colorize-a-sprite-3150195021bf
function colorize(charX, charY, [r, g, b]) {
  const offscreen = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = offscreen.getContext("2d");

  ctx.drawImage(
    spritesheet,
    charX * TILE_SIZE,
    charY * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE
  );

  const imageData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 0] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  return offscreen;
}

function getEntityFromArray(id, name, array) {
  for (let i = 0; i < array.length; i++) {
    const entity = array[i];
    if (name === entity.name && !id) {
      return entity;
    }
  }
}

function isInSquare(x, y, x0, y0, x1, y1) {
  if (x > x0 && x < x1 && y > y0 && y < y1) return true;
  return false;
}

function getEnemyEntitiesAround(anchor, distance) {
  const entities = [];
  for (let i = anchor.y - distance; i < anchor.y + distance; i++) {
    for (let k = anchor.x - distance; k < anchor.x + distance; k++) {
      if (i < 0 || k < 0) continue;
      if (i > tilemap.length - 1 || k > tilemap[0].length - 1) continue;
      for (let j = 0; j < tilemap[i][k].length; j++) {
        const entity = tilemap[i][k][j];
        if (entity.getComponent("Alignment")?.alignment == "Bad")
          entities.push(entity);
      }
    }
  }
  return entities;
}

function getNeighbors(x, y) {
  const offsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  return offsets.map(([dx, dy]) => [x + dx, y + dy]);
}

function roundToOne(num) {
  return Math.round(num * 10) / 10;
}

function countDigits(num) {
  return num.toString().replace(",", "").length;
}

function addEntityAsset(entity) {
  if (!(entity.name in uniqueAssets)) {
    uniqueAssets[entity.name] = colorize(
      entity.charX,
      entity.charY,
      entity.color
    );
    uniqueAssetsDark[entity.name] = colorize(entity.charX, entity.charY, [
      entity.color[0] / 4,
      entity.color[1] / 4,
      entity.color[2] / 4,
    ]);
  }
}

function getRelativeCoords([x, y]) {
  const relativeX =
    (x -
      viewPort.x +
      Math.floor(CANVAS_TILED_WIDTH / 2) -
      Math.floor(viewPort.w / 2)) *
    TILE_SIZE;
  const relativeY =
    (y -
      viewPort.y +
      Math.floor(CANVAS_TILED_HEIGHT / 2) -
      Math.floor(viewPort.h / 2)) *
    TILE_SIZE;

  return [relativeX, relativeY];
}

export {
  randomInt,
  randomFloat,
  colorize,
  getEntityFromArray,
  isInSquare,
  getEnemyEntitiesAround,
  getNeighbors,
  roundToOne,
  countDigits,
  addEntityAsset,
  getRelativeCoords,
};
