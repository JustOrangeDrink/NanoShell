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
import { addLog } from "../ui.js";
import { attackAction, moveAction, skipAction } from "./actions.js";
import { getNeighbors, isInSquare } from "../utils.js";

function renderWorld() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  updateKnownMap();

  for (let y = 0; y < knownMap.length; y++) {
    for (let x = 0; x < knownMap[y].length; x++) {
      const knownTile = knownMap[y][x];

      const entity = knownTile[0];
      if (!entity) continue;

      let asset;

      if (
        isInSquare(
          x,
          y,
          viewPort.x - 1,
          viewPort.y - 1,
          viewPort.x + viewPort.w,
          viewPort.y + viewPort.h
        )
      ) {
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

function updateKnownMap() {
  for (let y = viewPort.y; y < viewPort.y + viewPort.h; y++) {
    for (let x = viewPort.x; x < viewPort.x + viewPort.w; x++) {
      if (!tilemap[y] || !tilemap[y][x]) continue;
      const currentTile = tilemap[y][x];

      if (currentTile.length === 0) continue;

      knownMap[y][x].splice(0, knownMap[y][x].length);
      for (let i = 0; i < currentTile.length; i++) {
        const knownEntity = { ...currentTile[i] };
        knownMap[y][x].push(knownEntity);
        knownMap[y][x].sort((a, b) => b.z - a.z);

        // remove duplicate neighbors
        const neighbors = getNeighbors(x, y);

        for (
          let neighborIndex = 0;
          neighborIndex < neighbors.length;
          neighborIndex++
        ) {
          const neighbor = neighbors[neighborIndex];

          //fallback in case neighbor is out of bounds
          if (!knownMap[neighbor[1]] || !knownMap[neighbor[1]][neighbor[0]])
            continue;
          const neighborTile = knownMap[neighbor[1]][neighbor[0]];

          for (
            let entityIndex = 0;
            entityIndex < neighborTile.length;
            entityIndex++
          ) {
            const entity = neighborTile[entityIndex];
            if (entity.id == knownEntity.id)
              neighborTile.splice(entityIndex, 1);
          }
        }
      }
    }
  }
}

function tryMovement(entity, dx, dy) {
  if (dx === 0 && dy === 0) moveAction.makeAction(entity, entity, 0, 0);

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
  if (!srcDamage || (!trgHealth && entity.name != "Player")) {
    moveAction.makeAction(entity, entity, 0, 0);
    return true;
  }

  const entityAlignment = entity.getComponent("Alignment");
  const targetAlignment = blockingEntity.getComponent("Alignment");

  if (!entityAlignment || !targetAlignment) return true;

  if (
    entityAlignment.alignment === targetAlignment.alignment &&
    entity.name != "Player"
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
      for (let i = 0; i < 50; i++) {
        skipAction.makeAction(player);
      }
      break;

    default:
      break;
  }

  if (dx || dy) tryMovement(player, dx, dy);
}

export { renderWorld, tryMovement, handleInput, getEntitiesUnder };
