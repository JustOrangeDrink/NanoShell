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
    if (!position || !vector) continue;
    if (vector.dx == 0 && vector.dy == 0) continue;

    handleCollision();

    position.x += vector.dx;
    position.y += vector.dy;
    vector.dx = 0;
    vector.dy = 0;
  }
}

function getEntitiesUnder(targetEntity, ignoredEntitiesNames) {
  const position = targetEntity.getComponent("Position");
  if (!position) return;
  const entities = getEntitiesOnTile(position.x, position.y);

  if (!ignoredEntitiesNames) {
    return entities.filter((el) => el.name !== targetEntity.name);
  }
  return entities.filter(
    (el) =>
      el.name !== targetEntity.name && !ignoredEntitiesNames.includes(el.name)
  );
}

function getEntity(name, x, y) {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (x && y && name) {
      const position = entity.getComponent("Position");
      if (position.x == x && position.y == y && entity.name == name) {
        return i;
      }
    }
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

function getBlockingEntity(entitiesOnTile) {
  for (let i = 0; i < entitiesOnTile.length; i++) {
    const entityOnTile = entitiesOnTile[i];
    const collisionComponent = entityOnTile.getComponent("Collision");
    if (collisionComponent) return entitiesOnTile[i];
  }
  return false;
}

function handleCollision() {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const position = entity.getComponent("Position");
    const vector = entity.getComponent("Vector");
    const collision = entity.getComponent("Collision");
    const size = entity.getComponent("Size");
    if (!position || !vector || !collision) continue;
    if (vector.dx == 0 && vector.dy == 0) continue;

    const targetEntities = getEntitiesOnTile(
      position.x + vector.dx,
      position.y + vector.dy
    );

    const blockingEntity = getBlockingEntity(targetEntities);
    if (!blockingEntity) return;

    vector.dx = 0;
    vector.dy = 0;
    console.log(`Collision with ${blockingEntity.name}!`);
    // other stuff like fighting system etc...
  }
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

export {
  drawTile,
  renderWorld,
  handleMovement,
  handleInput,
  getEntitiesUnder,
  getEntity,
};
