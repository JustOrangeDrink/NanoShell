import {
  TILE_SIZE,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  spritesheet,
} from "../globals.js";
import { entities } from "../Entity/entities.js";

function drawTile(x, y, charX, charY, color) {
  const offscreenCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  const offscreenCtx = offscreenCanvas.getContext("2d");

  offscreenCtx.fillStyle = color;
  offscreenCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  offscreenCtx.globalCompositeOperation = "destination-in";

  offscreenCtx.drawImage(
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

  ctx.drawImage(offscreenCanvas, x * TILE_SIZE, y * TILE_SIZE);
}

function renderWorld(entities) {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const position = entity.getComponent("Position");
    const render = entity.getComponent("Render");
    if (position && render) {
      drawTile(
        position.x,
        position.y,
        render.charX,
        render.charY,
        render.color
      );
    }
  }
}

function handleMovement(entities) {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const position = entity.getComponent("Position");
    const vector = entity.getComponent("Vector");
    if (position && vector) {
      position.x += vector.dx;
      position.y += vector.dy;
      vector.dx = 0;
      vector.dy = 0;
    }
  }
}

export { drawTile, renderWorld, handleMovement };
