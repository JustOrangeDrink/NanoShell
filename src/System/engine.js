import {
  TILE_SIZE,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  spritesheet,
  viewPort,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
} from "../globals.js";
import { entities } from "../Entity/entities.js";

function drawTile(x, y, charX, charY, color) {
  const bgCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  const bgCtx = bgCanvas.getContext("2d");

  bgCtx.fillStyle = "black";
  bgCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  const offscreenCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  const offscreenCtx = offscreenCanvas.getContext("2d");

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
  offscreenCtx.globalCompositeOperation = "source-in";

  offscreenCtx.fillStyle = color;
  offscreenCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  // Hides elements that are under this tile
  offscreenCtx.globalCompositeOperation = "destination-over";
  offscreenCtx.fillStyle = "black";
  offscreenCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  ctx.drawImage(offscreenCanvas, x * TILE_SIZE, y * TILE_SIZE);
}

function renderWorld() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  const cameraX = viewPort.x;
  const cameraY = viewPort.y;
  const maxCameraX = viewPort.x + viewPort.w;
  const maxCameraY = viewPort.y + viewPort.h;
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const position = entity.getComponent("Position");
    const render = entity.getComponent("Render");
    if (!position || !render) continue;
    if (position.x > cameraX && position.x < maxCameraX) {
      if (position.y > cameraY && position.y < maxCameraY)
        drawTile(
          position.x - viewPort.x + CANVAS_TILED_WIDTH / 2 - viewPort.w / 2,
          position.y - viewPort.y + CANVAS_TILED_HEIGHT / 2 - viewPort.h / 2,
          render.charX,
          render.charY,
          render.color
        );
    }
  }
}

function handleMovement() {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const position = entity.getComponent("Position");
    const vector = entity.getComponent("Vector");
    const collisionComponent = entity.getComponent("Collision");
    if (!position || !vector) continue;
    if (vector.dx == 0 && vector.dy == 0) continue;

    const targetX = position.x + vector.dx;
    const targetY = position.y + vector.dy;

    const entitiesOnTile = getEntitiesOnTile(targetX, targetY);
    if (entitiesOnTile.length > 0) {
      if (isBlockedTile(entitiesOnTile, collisionComponent)) {
        vector.dx = 0;
        vector.dy = 0;
        continue;
      }
    }
    position.x += vector.dx;
    position.y += vector.dy;
    vector.dx = 0;
    vector.dy = 0;
  }
}

function getEntitiesOnTile(targetX, targetY) {
  const entitiesOnTile = [];
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const entityPosition = entity.getComponent("Position");
    if (targetX == entityPosition.x && targetY == entityPosition.y) {
      entitiesOnTile.push(entity);
    }
  }
  return entitiesOnTile;
}

function isBlockedTile(tiles, callerCollision) {
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const collisionComponent = tile.getComponent("Collision");
    if (collisionComponent && callerCollision) {
      console.log("Collision with ", tile);
      return true;
    }
  }
  return false;
}

function handleInput(event, player) {
  const vector = player.getComponent("Vector");
  switch (event.key) {
    case "a":
      vector.dx--;
      break;
    case "d":
      vector.dx++;
      break;
    case "w":
      vector.dy--;
      break;
    case "s":
      vector.dy++;
      break;

    default:
      break;
  }
}

export { drawTile, renderWorld, handleMovement, handleInput };
