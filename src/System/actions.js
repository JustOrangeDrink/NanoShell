import {
  blockAnimation,
  hitAnimation,
  missAnimation,
} from "../Animations/animations.js";
import { turnsEntities } from "../Entity/entities.js";
import { tilemap, time } from "../globals.js";
import { addLog } from "../ui/sidebar.js";
import {
  getEntityFromArray,
  handleTitle,
  randomInt,
  revealScripts,
  roundToOne,
} from "../utils.js";
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
  (src, trg) => {
    let weapon = src.getComponent("WieldSlots").weaponSlots[0];
    if (!weapon) weapon = src.getComponent("WieldSlots").unarmedWeapon;

    const weaponHitTitle = weapon.getComponent("Weapon").hitTitle;

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
      addLog(
        `You ${weaponHitTitle} ${trg.title} for ${totalDamage} damage!`,
        "yellow"
      );
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
      addLog(
        `${src.title} ${weaponHitTitle} you for ${totalDamage} damage!`,
        "yellow"
      );
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
      `${src.title} ${weaponHitTitle} ${trg.title} for ${totalDamage} damage!`,
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
      inventoryItem.getComponent("Stack").amount +=
        trg.getComponent("Stack").amount;
      handleTitle(inventoryItem);
      addLog(`You now have ${inventoryItem.title}.`, "white");
    } else {
      inventoryComponent.inventory.push(trg);
      addLog(`You have picked up ${trg.title}!`, "white");
    }

    tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
    trg.x = undefined;
    trg.y = undefined;
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
  "Wield",
  1,
  (src, trg) => {
    const srcInventory = src.getComponent("Inventory").inventory;

    const wieldSlots = src.getComponent("WieldSlots");
    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");

    if (weaponComponent) {
      addLog(`Equipped ${trg.title}!`, "orangered");
      wieldSlots.weaponSlots.push(trg);
      wieldSlots.currentWeight += weaponComponent.slotWeight;
      weaponComponent.equipped = true;
    }
    if (shieldComponent) {
      addLog(`Equipped ${trg.title}!`, "orangered");
      wieldSlots.shieldSlots.push(trg);
      wieldSlots.currentWeight += shieldComponent.slotWeight;
      shieldComponent.equipped = true;
      src.getComponent("Stats").arm += shieldComponent.arm;
    }
    srcInventory.splice(srcInventory.indexOf(trg), 1);
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

const equipAction = new Action(
  "Equip",
  1,
  (src, trg) => {
    const srcInventory = src.getComponent("Inventory").inventory;
    const armorSlotsComponent = src.getComponent("ArmorSlots");
    const armorSlots = armorSlotsComponent.armorSlots;

    const armorComponent = trg.getComponent("Armor");

    if (armorComponent) {
      addLog(`Wearing ${trg.title}!`, "orangered");
      armorSlots.push(trg);
      armorSlotsComponent.currentWeight += armorComponent.slotWeight;
      armorComponent.equipped = true;
      src.getComponent("Stats").arm += armorComponent.arm;
    }
    srcInventory.splice(srcInventory.indexOf(trg), 1);
  },
  (src, trg) => {
    const armorSlotsComponent = src.getComponent("ArmorSlots");
    const armorComponent = trg.getComponent("Armor");

    if (armorComponent) {
      if (
        armorSlotsComponent.currentWeight + armorComponent.slotWeight <=
        armorSlotsComponent.maxWeight
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

const dropAction = new Action(
  "Drop",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;

    const wieldSlots = src.getComponent("WieldSlots");
    const armorSlotsComponent = src.getComponent("ArmorSlots");

    const weaponSlots = wieldSlots.weaponSlots;
    const shieldSlots = wieldSlots.shieldSlots;
    const armorSlots = armorSlotsComponent.armorSlots;

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");

    const commonStorage = [
      ...inventory,
      ...weaponSlots,
      ...shieldSlots,
      ...armorSlots,
    ];

    for (let i = 0; i < commonStorage.length; i++) {
      const item = commonStorage[i];
      if (item == trg) {
        if (weaponComponent?.equipped) {
          weaponSlots.splice(weaponSlots.indexOf(trg), 1);
          wieldSlots.currentWeight -= weaponComponent.slotWeight;
        }
        if (shieldComponent?.equipped) {
          shieldSlots.splice(shieldSlots.indexOf(trg), 1);
          wieldSlots.currentWeight -= shieldComponent.slotWeight;
          src.getComponent("Stats").arm -= shieldComponent.arm;
        }
        if (armorComponent?.equipped) {
          armorSlots.splice(shieldSlots.indexOf(trg), 1);
          armorSlotsComponent.currentWeight -= armorComponent.slotWeight;
          src.getComponent("Stats").arm -= armorComponent.arm;
        }
        if (
          !weaponComponent?.equipped &&
          !shieldComponent?.equipped &&
          !armorComponent?.equipped
        ) {
          inventory.splice(inventory.indexOf(trg), 1);
        }
      }
    }

    trg.x = src.x;
    trg.y = src.y;
    tilemap[src.y][src.x].push(trg);
  },
  (src, trg) => {
    // conditions to remove item (cursed etc...)
    return true;
  }
);

const removeAction = new Action(
  "Remove",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;

    const wieldSlots = src.getComponent("WieldSlots");
    const armorSlotsComponent = src.getComponent("ArmorSlots");

    const weaponSlots = wieldSlots.weaponSlots;
    const shieldSlots = wieldSlots.shieldSlots;
    const armorSlots = armorSlotsComponent.armorSlots;

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");

    const commonStorage = [...weaponSlots, ...shieldSlots, ...armorSlots];

    for (let i = 0; i < commonStorage.length; i++) {
      const item = commonStorage[i];
      if (item == trg) {
        if (weaponComponent?.equipped) {
          weaponSlots.splice(weaponSlots.indexOf(trg), 1);
          wieldSlots.currentWeight -= weaponComponent.slotWeight;
        }
        if (shieldComponent?.equipped) {
          shieldSlots.splice(shieldSlots.indexOf(trg), 1);
          wieldSlots.currentWeight -= shieldComponent.slotWeight;
          src.getComponent("Stats").arm -= shieldComponent.arm;
        }
        if (armorComponent?.equipped) {
          armorSlots.splice(shieldSlots.indexOf(trg), 1);
          armorSlotsComponent.currentWeight -= armorComponent.slotWeight;
          src.getComponent("Stats").arm -= armorComponent.arm;
        }
        inventory.push(trg);
      }
    }
  },
  (src, trg) => {
    // conditions to uneqip item (cursed etc...)
    return true;
  }
);

const activateAction = new Action(
  "Activate",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;
    const scriptComponent = trg.getComponent("Script");

    if (!scriptComponent.revealed) {
      addLog(
        `You activate a Script of |${scriptComponent.cryptedName}|`,
        "bisque"
      );
      addLog(`It was a Script of ${trg.name}!`, "bisque");
    } else {
      addLog(`You activate a Script of ${trg.name}`, "lime");
    }

    if (trg.getComponent("Stack").amount > 1)
      trg.getComponent("Stack").amount--;
    else inventory.splice(inventory.indexOf(trg), 1);

    revealScripts(scriptComponent.cryptedName);
  },
  (src, trg) => {
    return true;
  }
);

export {
  moveAction,
  attackAction,
  skipAction,
  pickUpAction,
  longSkipAction,
  wieldAction,
  equipAction,
  dropAction,
  removeAction,
  activateAction,
};
