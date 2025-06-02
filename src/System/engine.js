import { WeaponSlots } from "../Component/components.js";
import {
  TILE_SIZE,
  ctx,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  viewPort,
  tilemap,
  knownMap,
  uniqueAssets,
  uniqueAssetsDark,
  animationMap,
} from "../globals.js";
import { tiles } from "../tiles.js";
import { getRelativeCoords } from "../utils.js";
import { attackAction, moveAction } from "./actions.js";

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
        asset = uniqueAssets[entity.renderName];
      } else {
        asset = uniqueAssetsDark[entity.renderName];
      }

      const [relativeX, relativeY] = getRelativeCoords([entity.x, entity.y]);
      ctx.drawImage(
        asset,
        0,
        0,
        TILE_SIZE,
        TILE_SIZE,
        relativeX,
        relativeY,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  renderAnimations();
}

function renderAnimations() {
  for (let y = 0; y < animationMap.length; y++) {
    for (let x = 0; x < animationMap[y].length; x++) {
      const animationEntity = animationMap[y][x][0];
      if (!animationEntity) continue;

      const [relativeX, relativeY] = getRelativeCoords([
        animationEntity.x,
        animationEntity.y,
      ]);

      ctx.drawImage(
        uniqueAssets[animationEntity.name],
        0,
        0,
        TILE_SIZE,
        TILE_SIZE,
        relativeX,
        relativeY,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

function updateKnownMap() {
  clearVision();

  for (let y = viewPort.y; y < viewPort.y + viewPort.h; y++) {
    for (let x = viewPort.x; x < viewPort.x + viewPort.w; x++) {
      revealLine(
        Math.floor(viewPort.x + viewPort.w / 2),
        Math.floor(viewPort.y + viewPort.h / 2),
        x,
        y
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

function tryMovement(entity, dx, dy) {
  const trgEnemy = handleCollision(entity, dx, dy);

  if (trgEnemy) {
    const weapon = entity.getComponent("WeaponSlots")?.slots?.[0];
    attackAction.makeAction(
      entity,
      [entity, trgEnemy, weapon],
      [entity, trgEnemy]
    );
  } else moveAction.makeAction(entity, [entity, dx, dy], [entity, dx, dy]);
}

function getEntitiesUnder(targetEntity, ignoredEntitiesNames) {
  if (!targetEntity) return;
  if (targetEntity.y > tilemap.length - 1 || targetEntity.y < 0) return;
  if (targetEntity.x > tilemap[0].length - 1 || targetEntity.x < 0) return;
  const entitiesTile = tilemap[targetEntity.y][targetEntity.x];

  const result = [];
  for (let i = 0; i < entitiesTile.length; i++) {
    const entity = entitiesTile[i];
    if (
      entity.name == targetEntity.name ||
      ignoredEntitiesNames.includes(entity.name) ||
      entity.getComponent("Hidden")
    )
      continue;
    result.push(entity);
  }
  return result;
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
    `Collision with ${blockingEntity.name}!`;
    return blockingEntity;
  }

  if (!collision.collision) return;

  `Collision with ${blockingEntity.name}!`;
  return blockingEntity;
}

export {
  renderWorld,
  getEntitiesUnder,
  handleCollision,
  getBlockingEntity,
  tryMovement,
};
