import {
  TILE_SIZE,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  viewPort,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
  tilemap,
} from "../globals.js";
import { uniqueAssets } from "../Entity/entities.js";
import { addLog } from "../ui.js";
import { attackAction, moveAction, skipAction } from "./actions.js";

function renderWorld() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  let cameraX = viewPort.x;
  let cameraY = viewPort.y;
  if (cameraX < 0) cameraX = 0;
  if (cameraY < 0) cameraY = 0;
  let maxCameraX = viewPort.x + viewPort.w;
  let maxCameraY = viewPort.y + viewPort.h;
  if (maxCameraX > tilemap[0].length - 1) maxCameraX = tilemap[0].length;
  if (maxCameraY > tilemap.length - 1) maxCameraY = tilemap.length;
  for (let y = cameraY; y < maxCameraY; y++) {
    for (let x = cameraX; x < maxCameraX; x++) {
      const currentTile = tilemap[y][x];
      if (currentTile.length == 0) {
        continue;
      }

      const entity = currentTile[currentTile.length - 1];

      ctx.drawImage(
        uniqueAssets[entity.name],
        0,
        0,
        TILE_SIZE,
        TILE_SIZE,
        (entity.x -
          viewPort.x +
          Math.floor(CANVAS_TILED_WIDTH / 2) -
          Math.floor(viewPort.w / 2)) *
          TILE_SIZE,
        (entity.y -
          viewPort.y +
          Math.floor(CANVAS_TILED_HEIGHT / 2) -
          Math.floor(viewPort.h / 2)) *
          TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

function tryMovement(entity, dx, dy) {
  if (dx == 0 && dy == 0) return;

  const dstX = entity.x + dx;
  const dstY = entity.y + dy;

  if (
    dstX > tilemap[0].length - 1 ||
    dstY > tilemap.length - 1 ||
    dstX < 0 ||
    dstY < 0
  ) {
    moveAction.makeAction(entity, entity, 0, 0);
    return;
  }

  if (handleCollision(entity, dx, dy)) {
    return;
  }

  tilemap[entity.y][entity.x].splice(-1, 1);
  tilemap[entity.y + dy][entity.x + dx].push(entity);

  moveAction.makeAction(entity, entity, dx, dy);
}

function getEntitiesUnder(targetEntity, ignoredEntitiesNames) {
  if (targetEntity.y > tilemap.length - 1 || targetEntity.y < 0) return;
  if (targetEntity.x > tilemap[0].length - 1 || targetEntity.x < 0) return;
  const entities = tilemap[targetEntity.y][targetEntity.x];

  if (!ignoredEntitiesNames) {
    return entities.filter((el) => el.name !== targetEntity.name);
  }
  return entities.filter(
    (el) =>
      el.name !== targetEntity.name && !ignoredEntitiesNames.includes(el.name)
  );
}

function getBlockingEntity(entitiesOnTile) {
  for (let i = 0; i < entitiesOnTile.length; i++) {
    const entityOnTile = entitiesOnTile[i];
    const collisionComponent = entityOnTile.getComponent("Collision");
    if (collisionComponent) return entitiesOnTile[i];
  }
  return false;
}

function handleCollision(entity, dx, dy) {
  const collision = entity.getComponent("Collision");

  const targetEntities = tilemap[entity.y + dy][entity.x + dx];

  const blockingEntity = getBlockingEntity(targetEntities);
  if (!blockingEntity) return;

  // check for collision with small entities like items etc...
  const size = entity.getComponent("Size");
  const smallCollision =
    blockingEntity.getComponent("Collision").smallCollision;
  if (size && size.size == "tiny" && smallCollision) {
    console.log(`Collision with ${blockingEntity.name}!`);
    return true;
  }

  if (!collision) return;

  console.log(`Collision with ${blockingEntity.name}!`);

  // other stuff like fighting system etc...
  const trgHealth = blockingEntity.getComponent("Health");
  const srcDamage = entity.getComponent("Damage");
  if (!srcDamage || !trgHealth) {
    moveAction.makeAction(entity, entity, 0, 0);
    return true;
  }

  if (
    entity.getComponent("Alignment").alignment ===
    blockingEntity.getComponent("Alignment").alignment
  ) {
    moveAction.makeAction(entity, entity, 0, 0);
    return true;
  }

  attackAction.makeAction(
    entity,
    entity,
    blockingEntity,
    trgHealth,
    srcDamage.dmg
  );

  return true;
}

function handleInput(event, player) {
  let dx = 0;
  let dy = 0;

  switch (event.key) {
    case "4":
      dx += -1;
      break;
    case "6":
      dx += 1;
      break;
    case "8":
      dy += -1;
      break;
    case "2":
      dy += 1;
      break;
    case "7":
      dx -= 1;
      dy -= 1;
      break;
    case "9":
      dx += 1;
      dy -= 1;
      break;
    case "1":
      dx -= 1;
      dy += 1;
      break;
    case "3":
      dx += 1;
      dy += 1;
      break;

    case " ":
      skipAction.makeAction(player);
      break;
    case "5":
      skipAction.makeAction(player);
      break;
    case ".":
      skipAction.makeAction(player);
      break;

    default:
      break;
  }

  tryMovement(player, dx, dy);
}

export { renderWorld, tryMovement, handleInput, getEntitiesUnder };
