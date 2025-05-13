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
import { uniqueAssets, vectorEntities } from "../Entity/entities.js";
import { addLog } from "../ui.js";
import { attackAction, moveAction } from "./actions.js";

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

function handleMovement() {
  for (let i = 0; i < vectorEntities.length; i++) {
    const entity = vectorEntities[i];
    const vector = entity.getComponent("Vector");
    if (vector.dx == 0 && vector.dy == 0) continue;

    const targetCoordX = entity.x + vector.dx;
    const targetCoordY = entity.y + vector.dy;

    if (
      targetCoordX > tilemap[0].length - 1 ||
      targetCoordY > tilemap.length - 1 ||
      targetCoordX < 0 ||
      targetCoordY < 0
    ) {
      vector.dx = 0;
      vector.dy = 0;
      return;
    }

    handleCollision(entity);
    tilemap[entity.y][entity.x].splice(-1, 1);
    tilemap[entity.y + vector.dy][entity.x + vector.dx].push(entity);

    entity.x += vector.dx;
    entity.y += vector.dy;
    vector.dx = 0;
    vector.dy = 0;
  }
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

function handleCollision(entity) {
  const vector = entity.getComponent("Vector");
  const collision = entity.getComponent("Collision");
  if (vector.dx == 0 && vector.dy == 0) return;

  const targetEntities = tilemap[entity.y + vector.dy][entity.x + vector.dx];

  const blockingEntity = getBlockingEntity(targetEntities);
  if (!blockingEntity) return;

  // check for collision with small entities like items etc...
  const size = entity.getComponent("Size");
  const smallCollision =
    blockingEntity.getComponent("Collision").smallCollision;
  if (size && size.size == "tiny" && smallCollision) {
    vector.dx = 0;
    vector.dy = 0;
    console.log(`Collision with ${blockingEntity.name}!`);
  }

  if (!collision) return;

  console.log(`Collision with ${blockingEntity.name}!`);
  vector.dx = 0;
  vector.dy = 0;

  // other stuff like fighting system etc...
  const trgHealth = blockingEntity.getComponent("Health");
  const srcDamage = entity.getComponent("Damage");
  if (!srcDamage || !trgHealth) return;

  attackAction.makeAction(
    entity,
    entity,
    blockingEntity,
    trgHealth,
    srcDamage.dmg
  );

  if (trgHealth.hp <= 0) {
    addLog(`${blockingEntity.name} is dead!`);
    blockingEntity.destroy();
  }
}

function handleInput(event, player) {
  const vector = player.getComponent("Vector");
  switch (event.key) {
    case "a":
      moveAction.makeAction(player, vector, -1);
      break;
    case "d":
      moveAction.makeAction(player, vector, 1);
      break;
    case "w":
      moveAction.makeAction(player, vector, 0, -1);
      break;
    case "s":
      moveAction.makeAction(player, vector, 0, 1);
      break;

    default:
      break;
  }
}

export { renderWorld, handleMovement, handleInput, getEntitiesUnder };
