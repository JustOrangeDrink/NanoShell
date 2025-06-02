import {
  blockAnimation,
  hitAnimation,
  missAnimation,
} from "../Animations/animations.js";
import { turnsEntities } from "../Entity/entities.js";
import { tilemap, time } from "../globals.js";
import { tiles } from "../tiles.js";
import { updateInventoryUi } from "../UI/inventory.js";
import { addLog, updateUi } from "../UI/sidebar.js";
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
  (src, trg, srcWeapon) => {
    let weapon = srcWeapon;
    if (!weapon) {
      if (!src.getComponent("WieldSlots").unarmedSlot) {
        src.getComponent("WieldSlots").unarmedSlot = tiles.Fist.init();
      }
      weapon = src.getComponent("WieldSlots").unarmedSlot;
    }

    const srcAttributes = src.getComponent("Attributes");

    const trgHealth = trg.getComponent("Health");
    const trgStats = trg.getComponent("Stats");
    const trgAttributes = trg.getComponent("Attributes");

    const dmg = weapon.getComponent("Weapon").dmg;

    const ddg = trgStats.ddg + trgAttributes.agi;
    const isHit =
      randomInt(0, 100) +
        weapon.getComponent("Weapon").acc +
        srcAttributes.agi >
      ddg;

    let totalDamage =
      randomInt(dmg / 1.5, dmg) +
      randomInt(srcAttributes.str / 1.5, srcAttributes.str) -
      randomInt(trgStats.arm / 2, trgStats.arm);

    if (src.name === "Player") {
      if (!isHit) {
        missAnimation(trg);
        addLog(`You miss ${trg.title}!`, "gray");
        return;
      }
      if (totalDamage <= 0) {
        blockAnimation(trg);
        addLog(`${trg.title} blocks your attack!`, "gray");
        return;
      }
      hitAnimation(trg);
      addLog(`You hit ${trg.title} for ${totalDamage} damage!`, "yellow");
      trgHealth.takeDamage(trg, totalDamage);
      return;
    }

    if (trg.name == "Player") {
      if (!isHit) {
        missAnimation(trg);
        addLog(`${src.title} miss you!`, "gray");
        return;
      }
      if (totalDamage <= 0) {
        blockAnimation(trg);
        addLog(`You block ${src.title}'s attack!`, "gray");
        return;
      }
      hitAnimation(trg);
      addLog(`${src.title} hit you for ${totalDamage} damage!`, "yellow");
      trgHealth.takeDamage(trg, totalDamage);
      return;
    }

    if (!isHit) {
      missAnimation(trg);
      addLog(`${src.title} miss ${trg.title}!`, "yellow");
    }
    if (totalDamage <= 0) {
      blockAnimation(trg);
      addLog(`${trg.title} blocks ${src.title}'s attack!`, "gray");
      return;
    }

    hitAnimation(trg);
    addLog(
      `${src.title} hit ${trg.title} for ${totalDamage} damage!`,
      "yellow"
    );
    trgHealth.takeDamage(trg, totalDamage);
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
    const wieldSlots = src.getComponent("WieldSlots");
    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");

    if (weaponComponent) {
      addLog(`Equipped ${trg.title}!`, "orangered");
      wieldSlots.weaponSlots.push(trg);
      wieldSlots.currentWeight += weaponComponent.slotWeight;
    }
    if (shieldComponent) {
      addLog(`Equipped ${trg.title}!`, "orangered");
      wieldSlots.shieldSlots.push(trg);
      wieldSlots.currentWeight += shieldComponent.slotWeight;
      src.getComponent("Stats").arm += shieldComponent.arm;
    }
    updateInventoryUi();
    updateUi();
  },
  (src, trg) => {
    const wieldSlots = src.getComponent("WieldSlots");
    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");

    if (weaponComponent) {
      if (
        wieldSlots.currentWeight + weaponComponent.slotWeight <=
        wieldSlots.maxWeight
      )
        return true;
      else {
        addLog(`Not enough space for ${trg.title}`, "red");
        return false;
      }
    }

    if (shieldComponent) {
      if (
        wieldSlots.currentWeight + shieldComponent.slotWeight <=
        wieldSlots.maxWeight
      )
        return true;
      else {
        addLog(`Not enough space for ${trg.title}`, "red");
        return false;
      }
    }

    return false;
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
