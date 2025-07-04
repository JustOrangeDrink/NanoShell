import { ScheduledEffects } from "../Component/components.js";
import { knownMap, rooms, tilemap, time } from "../globals.js";
import { getPresetsByTags } from "../presets.js";
import { addLog } from "../ui/sidebar.js";
import { getNeighbors, randomInt } from "../utils.js";
import { getBlockingEntity } from "./engine.js";

class ScheduledEffect {
  constructor(
    trg,
    effectName = "Unknown Effect",
    scheduledTime,
    effectFunction,
    linkedEntity,
    isCancel = false
  ) {
    this.linkedEntity = linkedEntity;
    this.effectName = effectName;
    this.timeLeft = scheduledTime + 1;
    this.effectFunction = effectFunction;
    this.isCancel = isCancel;

    if (!trg.getComponent("ScheduledEffects"))
      trg.addComponent(new ScheduledEffects());
    trg.getComponent("ScheduledEffects").scheduledEffects.push(this);
  }
}

function cancelLinkedEffects(trg, linkedEntity) {
  const effects = trg.getComponent("ScheduledEffects")?.scheduledEffects;
  if (!effects) return;

  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    if (!effect.linkedEntity.id || !linkedEntity.id) return;

    if (effect.linkedEntity.id === linkedEntity.id) {
      if (effect.isCancel) {
        effect.effectFunction(trg);
      }
      effects.splice(i, 1);
      i--;
    }
  }
}

function handleEffects(trg) {
  const effects = trg.getComponent("ScheduledEffects").scheduledEffects;
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    if (effect.timeLeft > 0) {
      effect.timeLeft -= time.timeJump;
    }
    if (effect.timeLeft <= 0) {
      effect.effectFunction(trg);
      effects.splice(i, 1);
      i--;
    }
  }
}

function randomTp(trg) {
  const randomRoom = rooms[randomInt(0, rooms.length - 1)];

  tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
  tilemap[randomRoom.getCenter().y][randomRoom.getCenter().x].push(trg);

  // remove player from his knowledge map (when player tp's he remember himself on this spot)
  for (let i = 0; i < knownMap[trg.y][trg.x].length; i++) {
    const entity = knownMap[trg.y][trg.x][i];
    if (entity.id == trg.id) knownMap[trg.y][trg.x].splice(i, 1);
  }

  trg.x = randomRoom.getCenter().x;
  trg.y = randomRoom.getCenter().y;
  addLog([trg, false, " vanishes!", "purple"]);
}

function spawnRandomEnemy(trg) {
  const enemies = getPresetsByTags("enemy");
  const randomEnemyPreset = enemies[randomInt(0, enemies.length - 1)];
  const neighbors = getNeighbors(trg.x, trg.y);

  // filter our neighbors with collision entities on them
  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    const neighborTile = tilemap[neighbor[1]][neighbor[0]];
    if (getBlockingEntity(neighborTile)) {
      neighbors.splice(i, 1);
      i--;
    }
  }

  if (neighbors.length === 0) {
    addLog(["Nothing seems to happen...", "gray"]);
    return;
  }

  const [destX, destY] = neighbors[randomInt(0, neighbors.length - 1)];
  const randomEnemy = randomEnemyPreset.init(destX, destY);

  // give new entity a 1 turn penalty
  randomEnemy.getComponent("Turns").currentTime = time.currentTime + 1;

  addLog([randomEnemy, false, " appears out of nowhere!", "brown"]);
}

function strengthBoost(trg, src, duration = 3, boostAmount = 5) {
  if (trg.name == "Player") addLog([`You feel stronger!`, "orange"]);
  else addLog([trg, false, " seems stronger now!", "pink"]);

  trg.getComponent("Attributes").str += boostAmount;

  new ScheduledEffect(
    trg,
    "Strength Boost",
    duration,
    (trgEntity) => {
      trgEntity.getComponent("Attributes").str -= boostAmount;
      if (trgEntity.name == "Player") {
        addLog(["Your strength wears away...", "red"]);
      } else {
        addLog([trgEntity, false, "'s strength seems to wear away..."], "red");
      }
    },
    src,
    true
  );
}

export {
  ScheduledEffect,
  handleEffects,
  cancelLinkedEffects,
  randomTp,
  strengthBoost,
  spawnRandomEnemy,
};
