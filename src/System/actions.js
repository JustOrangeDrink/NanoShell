import { turnsEntities } from "../Entity/entities.js";
import { tilemap } from "../globals.js";
import { addLog } from "../ui/sidebar.js";
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

const attackAction = new Action("Attack", 1, (src, trg, dmg) => {
  const trgHealth = trg.getComponent("Health");

  const srcAttributes = src.getComponent("Attributes");
  const trgStats = trg.getComponent("Stats");
  const trgAttributes = trg.getComponent("Attributes");

  const dv = trgStats.dv + trgAttributes.agi;
  const isHit = randomInt(0, 100) + srcAttributes.agi > dv;

  let damage =
    randomInt(0, dmg) +
    randomInt(0, srcAttributes.str) -
    randomInt(0, trgStats.av);

  if (src.name === "Player") {
    if (!isHit) {
      addLog(`You miss ${trg.name}!`, "gray");
      return;
    }
    if (damage <= 0) {
      addLog(`${trg.name} blocks your attack!`, "gray");
      return;
    }
    addLog(`You hit ${trg.name} for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (trg.name == "Player") {
    if (!isHit) {
      addLog(`${src.name} miss you!`, "gray");
      return;
    }
    if (damage <= 0) {
      addLog(`You block ${src.name}'s attack!`, "gray");
      return;
    }
    addLog(`${src.name} hit you for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (!isHit) {
    addLog(`${src.name} miss ${trg.name}!`, "yellow");
  }
  if (damage <= 0) {
    addLog(`${trg.name} blocks ${src.name}'s attack!`, "gray");
    return;
  }

  addLog(`${src.name} hit ${trg.name} for ${damage} damage!`, "yellow");
  trgHealth.takeDamage(trg, damage);
});

const pickUpAction = new Action("Pick Up", 1, (src, trg) => {
  const inventoryComponent = src.getComponent("Inventory");
  const trgSizeComponent = trg.getComponent("Size");
  if (!inventoryComponent || !trgSizeComponent) return;
  if (trgSizeComponent.size !== "Tiny") {
    addLog(`${trg.name} is too big!`, "white");
    return;
  }

  inventoryComponent.inventory.push(trg);
  addLog(`Picked up ${trg.name}`, "white");

  tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
});

export { moveAction, attackAction, skipAction, pickUpAction, time };
