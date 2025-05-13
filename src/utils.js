import { TILE_SIZE, entities, spritesheet } from "./globals.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
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
    imageData.data[i + 0] *= r;
    imageData.data[i + 1] *= g;
    imageData.data[i + 2] *= b;
  }

  ctx.putImageData(imageData, 0, 0);

  return offscreen;
}

function getEntity(id, name) {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (name === entity.name && !id) {
      return entity;
    }
  }
}

export { randomInt, colorize, getEntity };
