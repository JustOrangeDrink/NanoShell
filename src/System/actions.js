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

    if (entity.name == "Player") continue;

    while (turnsComponent.currentTime < time) {
      entity.getComponent("Behavior").useBehavior(entity);
    }
  }
}

const skipAction = new Action("Skip", 1, () => {});

const moveAction = new Action("Move", 1, (entity, dx, dy) => {
  entity.x += dx;
  entity.y += dy;
});

const attackAction = new Action("Attack", 1, (src, trg, trgHealth, dmg) => {
  addLog(`${trg.name} took ${dmg} damage from ${src.name}!`, "red");
  trgHealth.takeDamage(trg, dmg);
});

export { moveAction, attackAction, skipAction, time };
