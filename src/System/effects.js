import { ScheduledEffects } from "../Component/components.js";
import { knownMap, rooms, tilemap, time } from "../globals.js";
import { addLog } from "../ui/sidebar.js";
import { randomInt } from "../utils.js";

class ScheduledEffect {
  constructor(effectName, scheduledTime, effectFunction) {
    this.effectName = effectName;
    this.timeLeft = scheduledTime + 1;
    this.effectFunction = effectFunction;
  }
}

function handleEffects(trg) {
  const effects = trg.getComponent("ScheduledEffects").scheduledEffects;
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    console.log(effect);
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
  addLog([`${trg.currentTitle} vanishes!`, "purple"]);
}

function strengthBoost(trg, duration, boostAmount) {
  if (!trg.getComponent("ScheduledEffects"))
    trg.addComponent(new ScheduledEffects());
  const effects = trg.getComponent("ScheduledEffects").scheduledEffects;

  if (trg.name == "Player") addLog([`You suddenly feel stronger!`, "orange"]);
  else addLog([trg, false, " seems stronger now!", "pink"]);

  trg.getComponent("Attributes").str += boostAmount;

  effects.push(
    new ScheduledEffect("Strength Boost", duration, (trgEntity) => {
      trgEntity.getComponent("Attributes").str -= boostAmount;
      if (trgEntity.name == "Player")
        addLog(["Your strength wears away...", "red"]);
      else
        addLog([trgEntity, false, "'s strength seems to wear away..."], "red");
    })
  );
}

export { handleEffects, randomTp, strengthBoost };
