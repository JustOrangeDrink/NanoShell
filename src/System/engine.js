import {
  TILE_SIZE,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  viewPort,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
  tilemap,
  knownMap,
} from "../globals.js";
import { uniqueAssets, uniqueAssetsDark } from "../Entity/entities.js";
import { attackAction, moveAction, skipAction } from "./actions.js";

function renderWorld() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  updateKnownMap();

  for (let y = 0; y < knownMap.length; y++) {
    for (let x = 0; x < knownMap[y].length; x++) {
      const knownTile = knownMap[y][x];

      const entity = knownTile[0];
      if (!entity) continue;
      let asset;

      if (entity.isViewed) {
        asset = uniqueAssets[entity.name];
      } else {
        asset = uniqueAssetsDark[entity.name];
      }

      ctx.drawImage(
        asset,
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

function revealLine(x0, y0, x1, y1) {
  const startX = x0;
  const startY = y0;

  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);

  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;

  let error = dx + dy;

  mainLoop: while (true) {
    if (tilemap?.[y0]?.[x0]) {
      for (let i = 0; i < tilemap[y0][x0].length; i++) {
        const entity = tilemap[y0][x0][i];
        entity.isViewed = true;

        const knownEntity = { ...tilemap[y0][x0][i] };

        knownMap[y0][x0].splice(i, 1);
        knownMap[y0][x0].push(knownEntity);
        knownMap[y0][x0].sort((a, b) => b.z - a.z);

        // this is needed to avoid "blindness" when starting point is occluded
        if (entity.x == startX && entity.y == startY) continue;

        if (entity.getComponent("Occlusion")) break mainLoop;
      }
    }

    let e2 = 2 * error;

    if (e2 >= dy) {
      if (x0 === x1) break;
      error += dy;
      x0 += sx;
    }

    if (e2 <= dx) {
      if (y0 === y1) break;
      error += dx;
      y0 += sy;
    }
  }
}

function clearVision() {
  for (let y = 0; y < knownMap.length; y++) {
    for (let x = 0; x < knownMap[0].length; x++) {
      const tile = knownMap[y][x];
      for (let i = 0; i < tile.length; i++) {
        tile[i].isViewed = false;
      }
    }
  }
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[0].length; x++) {
      const tile = tilemap[y][x];
      for (let i = 0; i < tile.length; i++) {
        tile[i].isViewed = false;
      }
    }
  }
}

function updateKnownMap() {
  clearVision();

  for (let y = viewPort.y; y < viewPort.y + viewPort.h; y++) {
    for (let x = viewPort.x; x < viewPort.x + viewPort.w; x++) {
      if (!tilemap[y]?.[x]) continue;
      if (
        !(
          y == viewPort.y ||
          y == 0 ||
          y == viewPort.y + viewPort.h - 1 ||
          y == tilemap.length - 1 ||
          x == viewPort.x ||
          x == 0 ||
          x == viewPort.x + viewPort.w - 1 ||
          x == tilemap[0].length - 1
        )
      )
        continue;

      revealLine(
        Math.floor(viewPort.x + viewPort.w / 2),
        Math.floor(viewPort.y + viewPort.h / 2),
        x,
        y
      );
    }
  }
}

function tryMovement(entity, dx, dy) {
  if (dx === 0 && dy === 0) skipAction.makeAction(entity);

  const dstX = entity.x + dx;
  const dstY = entity.y + dy;

  if (
    dstX > tilemap[0].length - 1 ||
    dstY > tilemap.length - 1 ||
    dstX < 0 ||
    dstY < 0
  ) {
    skipAction.makeAction(entity);
    return;
  }

  if (handleCollision(entity, dx, dy)) {
    return;
  }

  tilemap[entity.y][entity.x].splice(
    tilemap[entity.y][entity.x].indexOf(entity),
    1
  );
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
    if (collisionComponent?.collision) return entitiesOnTile[i];
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
  if (size?.size == "tiny" && smallCollision) {
    console.log(`Collision with ${blockingEntity.name}!`);
    return true;
  }

  if (!collision.collision) return;

  console.log(`Collision with ${blockingEntity.name}!`);

  // other stuff like fighting system etc...
  const trgHealth = blockingEntity.getComponent("Health");
  const srcDamage = entity.getComponent("Damage");
  if (!srcDamage || (!trgHealth && entity.name != "Player")) {
    skipAction.makeAction(entity);
    return true;
  }

  const entityAlignment = entity.getComponent("Alignment");
  const targetAlignment = blockingEntity.getComponent("Alignment");

  if (!entityAlignment || !targetAlignment) return true;

  if (
    entityAlignment.alignment === targetAlignment.alignment &&
    entity.name != "Player"
  ) {
    skipAction.makeAction(entity);
    return true;
  }

  attackAction.makeAction(entity, entity, blockingEntity, srcDamage.dmg);

  return true;
}

export { renderWorld, tryMovement, getEntitiesUnder };
