import { turnsEntities } from "../Entity/entities.js";
import { addLog } from "../ui.js";
import { randomInt } from "../utils.js";
import { tryMovement } from "./engine.js";

let time = 0;

class Action {
  constructor(name, timeCost, action) {
    this.name = name;
    this.timeCost = timeCost;
    this.action = action;
  }
  makeAction(entity, ...args) {
    this.action(...args);

    const turnsComponent = entity.getComponent("Turns");
    if (!turnsComponent) return;

    if (entity.name == "Player") {
      time += this.timeCost;
      passTime();
    }

    turnsComponent.currentTime += this.timeCost;
    document.dispatchEvent(new Event("gameTurn"));
  }
}

function passTime() {
  for (let i = 0; i < turnsEntities.length; i++) {
    const entity = turnsEntities[i];
    const turnsComponent = entity.getComponent("Turns");
    const behavior = entity.getComponent("Behavior");

    if (!behavior) continue;

    if (behavior.active === false) {
      turnsComponent.currentTime = time;
      continue;
    }

    if (entity.name == "Player") continue;

    while (turnsComponent.currentTime < time) {
      behavior.useBehavior(entity);
    }
  }
}

const skipAction = new Action("Skip", 1, () => {});

const moveAction = new Action("Move", 1, (entity, dx, dy) => {
  entity.x += dx;
  entity.y += dy;
});

const attackAction = new Action("Attack", 1, (src, trg, trgHealth, dmg) => {
  const hitChance = randomInt(0, 100) + src.getComponent("Stats").acc;
  const damage = randomInt(0, dmg) + src.getComponent("Stats").str;
  const armor = trg.getComponent("Stats").armor;

  if (src.name === "Player") {
    if (hitChance < armor) {
      addLog(`You miss ${trg.name}!`, "gray");
      return;
    }
    addLog(`You hit ${trg.name} for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (trg.name == "Player") {
    if (hitChance < armor) {
      addLog(`${src.name} miss you!`, "gray");
      return;
    }
    addLog(`${src.name} hit you for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (hitChance < armor) {
    addLog(`${src.name} miss ${trg.name}!`, "yellow");
  }
  addLog(`${src.name} hit ${trg.name} for ${damage} damage!`, "yellow");
  trgHealth.takeDamage(trg, damage);
});

export { moveAction, attackAction, skipAction, time };
