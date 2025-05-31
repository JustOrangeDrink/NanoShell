import { turnsEntities } from "../Entity/entities.js";
import { tilemap, time } from "../globals.js";
import { updateInventoryUi } from "../ui/inventory.js";
import { addLog } from "../ui/sidebar.js";
import { getEntityFromArray, randomInt, roundToOne } from "../utils.js";
import { getEntitiesUnder } from "./engine.js";

class Action {
  constructor(name, timeCost, action, condition = () => true) {
    this.name = name;
    this.timeCost = timeCost;
    this.action = action;
    this.condition = condition;
  }
  makeAction(src, actionArgs = [], conditionArgs = []) {
    if (!this.condition(...conditionArgs)) {
      if (src.name !== "Player") src.getComponent("Turns").currentTime++;
      return;
    }

    this.action(...actionArgs);

    const turnsComponent = src.getComponent("Turns");
    if (!turnsComponent) return;

    const totalTimeCost = roundToOne(
      this.timeCost / src.getComponent("Stats").qkn
    );

    if (src.name == "Player") {
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

const moveAction = new Action(
  "Move",
  1,
  (src, dx, dy) => {
    src.x += dx;
    src.y += dy;
  },
  (src, dx, dy) => {
    if (dx === 0 && dy === 0) return false;

    const dstX = src.x + dx;
    const dstY = src.y + dy;

    if (
      dstX > tilemap[0].length - 1 ||
      dstY > tilemap.length - 1 ||
      dstX < 0 ||
      dstY < 0
    )
      return false;

    tilemap[src.y][src.x].splice(tilemap[src.y][src.x].indexOf(src), 1);
    tilemap[src.y + dy][src.x + dx].push(src);

    return true;
  }
);

const attackAction = new Action(
  "Attack",
  1,
  (src, trg, dmg) => {
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
  },
  (src, trg) => {
    const trgHealth = trg.getComponent("Health");
    const srcDamage = src.getComponent("Damage");
    if (!srcDamage || (!trgHealth && src.name != "Player")) {
      return false;
    }

    const srcAlignment = src.getComponent("Alignment");
    const targetAlignment = trg.getComponent("Alignment");

    if (!srcAlignment || !targetAlignment) return false;

    if (
      srcAlignment.alignment === targetAlignment.alignment &&
      src.name != "Player"
    ) {
      return false;
    }

    return true;
  }
);

const pickUpAction = new Action(
  "Pick Up",
  1,
  (src, trg) => {
    const inventoryComponent = src.getComponent("Inventory");

    const inventoryItem = getEntityFromArray(
      false,
      trg.name,
      inventoryComponent.inventory
    );

    if (trg.getComponent("Stack") && inventoryItem) {
      inventoryItem.getComponent("Stack").amount++;

      inventoryItem.title = `${inventoryItem.getComponent("Stack").amount} ${
        inventoryItem.name
      }s`;

      addLog(
        `You now have ${inventoryItem.getComponent("Stack").amount} ${
          inventoryItem.name
        }s.`,
        "white"
      );
    } else {
      inventoryComponent.inventory.push(trg);
      addLog(`You have picked up ${trg.title}!`, "white");
    }

    updateInventoryUi();
    tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
  },
  (src, trg) => {
    const itemsBelow = getEntitiesUnder(src, ["Floor"]);
    if (!itemsBelow || itemsBelow.length === 0) {
      addLog("There is nothing to pick up!", "white");
      return false;
    }

    const inventoryComponent = src.getComponent("Inventory");
    const isPickable = trg.getComponent("Pickable");

    if (!inventoryComponent || !isPickable) {
      addLog(`Cant pick up ${trg.title}!`, "white");
      return false;
    }

    return true;
  }
);

const wieldAction = new Action(
  "Equip",
  1,
  (src, trg) => {
    const weaponSlots = src.getComponent("WeaponSlots");
    weaponSlots.slots.push(trg);
  },
  (trg) => {
    console.log(trg);
    if (trg.getComponent("Weapon")) return true;
    else return false;
  }
);

export {
  moveAction,
  attackAction,
  skipAction,
  pickUpAction,
  longSkipAction,
  wieldAction,
};
