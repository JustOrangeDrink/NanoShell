import { turnsEntities } from "../Entity/entities.js";
import { tilemap, time } from "../globals.js";
import { updateInventoryUi } from "../ui/inventory.js";
import { addLog } from "../ui/sidebar.js";
import { randomInt, roundToOne } from "../utils.js";

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

    const totalTimeCost = roundToOne(
      this.timeCost / entity.getComponent("Stats").qkn
    );

    if (entity.name == "Player") {
      time.currentTime = roundToOne(time.currentTime + totalTimeCost);
      time.timeJump = totalTimeCost;
      passTime();
    }

    turnsComponent.currentTime = roundToOne(
      turnsComponent.currentTime + totalTimeCost
    );
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
      turnsComponent.currentTime = time.currentTime;
      continue;
    }

    if (entity.name == "Player") continue;

    while (turnsComponent.currentTime < time.currentTime) {
      behavior.useBehavior(entity);
    }
  }
}

const skipAction = new Action("Skip", 1, () => {});
const longSkipAction = new Action("Long Skip", 50, () => {});

const moveAction = new Action("Move", 1, (src, dx, dy) => {
  src.x += dx;
  src.y += dy;
});

const attackAction = new Action("Attack", 1, (src, trg, dmg) => {
  const trgHealth = trg.getComponent("Health");

  const srcAttributes = src.getComponent("Attributes");
  const trgStats = trg.getComponent("Stats");
  const trgAttributes = trg.getComponent("Attributes");

  const ddg = trgStats.ddg + trgAttributes.agi;
  const isHit = randomInt(0, 100) + srcAttributes.agi > ddg;

  let damage =
    randomInt(0, dmg) +
    randomInt(0, srcAttributes.str) -
    randomInt(0, trgStats.arm);

  if (src.name === "Player") {
    if (!isHit) {
      addLog(`You miss ${trg.title}!`, "gray");
      return;
    }
    if (damage <= 0) {
      addLog(`${trg.title} blocks your attack!`, "gray");
      return;
    }
    addLog(`You hit ${trg.title} for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (trg.name == "Player") {
    if (!isHit) {
      addLog(`${src.title} miss you!`, "gray");
      return;
    }
    if (damage <= 0) {
      addLog(`You block ${src.title}'s attack!`, "gray");
      return;
    }
    addLog(`${src.title} hit you for ${damage} damage!`, "yellow");
    trgHealth.takeDamage(trg, damage);
    return;
  }

  if (!isHit) {
    addLog(`${src.title} miss ${trg.title}!`, "yellow");
  }
  if (damage <= 0) {
    addLog(`${trg.title} blocks ${src.title}'s attack!`, "gray");
    return;
  }

  addLog(`${src.title} hit ${trg.title} for ${damage} damage!`, "yellow");
  trgHealth.takeDamage(trg, damage);
});

const pickUpAction = new Action("Pick Up", 1, (src, trg) => {
  const inventoryComponent = src.getComponent("Inventory");
  const isPickable = trg.getComponent("Pickable");
  if (!inventoryComponent) return;
  if (!isPickable) {
    addLog(`Cant pick up ${trg.title}!`, "white");
    return;
  }

  inventoryComponent.inventory.push(trg);
  updateInventoryUi();
  addLog(`You have picked up ${trg.title}!`, "white");

  tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
});

export { moveAction, attackAction, skipAction, pickUpAction, longSkipAction };
