import {
  blockAnimation,
  hitAnimation,
  missAnimation,
} from "../Animations/animations.js";
import { effectsEntities, turnsEntities } from "../Entity/entities.js";
import { tilemap, time } from "../globals.js";
import { addLog } from "../ui/sidebar.js";
import {
  getEntityFromArray,
  handleTitle,
  randomInt,
  revealEncryptions,
  roundToOne,
} from "../utils.js";
import { cancelLinkedEffects, handleEffects } from "./effects.js";
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
  for (let i = 0; i < effectsEntities.length; i++) {
    const entity = effectsEntities[i];
    handleEffects(entity);
  }

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
        addLog(["You miss ", "gray", trg, false, ".", "gray"]);
        return;
      }
      if (totalDamage <= 0) {
        blockAnimation(trg);
        addLog([trg, false, " blocks your attack.", "gray"]);
        return;
      }
      hitAnimation(trg);
      addLog([
        `You ${weaponHitTitle} `,
        "yellow",
        trg,
        false,
        ` for ${totalDamage} damage!`,
        "yellow",
      ]);
      trgHealth.takeDamage(trg, totalDamage);
      return;
    }

    if (trg.name == "Player") {
      if (!isHit) {
        missAnimation(trg);
        addLog([src, false, " miss you.", "gray"]);
        return;
      }
      if (totalDamage <= 0) {
        blockAnimation(trg);
        addLog(["You block ", "gray", src, false, "'s attack!", "gray"]);
        return;
      }
      hitAnimation(trg);
      addLog([
        src,
        false,
        ` ${weaponHitTitle} you for ${totalDamage} damage!`,
        "yellow",
      ]);
      trgHealth.takeDamage(trg, totalDamage);
      return;
    }

    if (!isHit) {
      missAnimation(trg);
      addLog([src, false, "miss", "gray", trg, false, ".", "gray"]);
    }
    if (totalDamage <= 0) {
      blockAnimation(trg);
      addLog([
        trg,
        false,
        " blocks ",
        "gray",
        src,
        false,
        "'s attack.",
        "gray",
      ]);
      return;
    }

    hitAnimation(trg);
    addLog([
      `${src.currentTitle} ${weaponHitTitle} ${trg.currentTitle} for ${totalDamage} damage!`,
      "yellow",
    ]);
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
      addLog(["You now have ", "white", inventoryItem, false, "!", "white"]);
    } else {
      inventoryComponent.inventory.push(trg);
      addLog(["You have picked up ", "white", trg, false, "!", "white"]);
    }

    tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
    trg.x = undefined;
    trg.y = undefined;
  },
  (src, trg) => {
    const itemsBelow = getEntitiesUnder(src, ["Floor"]);
    if (!itemsBelow || itemsBelow.length === 0) {
      addLog(["There is nothing to pick up!", "white"]);
      return false;
    }

    const inventoryComponent = src.getComponent("Inventory");
    const isPickable = trg.getComponent("Pickable");

    if (!inventoryComponent || !isPickable) {
      addLog(["Cant pick up ", "white", trg, false, "!", "white"]);
      return false;
    }

    return true;
  }
);

const equipAction = new Action(
  "Wield",
  1,
  (src, trg) => {
    const srcInventory = src.getComponent("Inventory").inventory;

    const armorSlots = src.getComponent("ArmorSlots");
    const wieldSlots = src.getComponent("WieldSlots");
    const chipSlots = src.getComponent("ChipSlots");

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");
    const chipComponent = trg.getComponent("Chip");

    const equipEffectsComponent = trg.getComponent("EquipEffects");

    if (weaponComponent) {
      wieldSlots.weaponSlots.push(trg);
      wieldSlots.currentWeight += weaponComponent.slotWeight;
      weaponComponent.isEquipped = true;
      addLog(["Wielding ", "orangered", trg, false, " now.", "orangered"]);
    }

    if (shieldComponent) {
      wieldSlots.shieldSlots.push(trg);
      wieldSlots.currentWeight += shieldComponent.slotWeight;
      shieldComponent.isEquipped = true;
      src.getComponent("Stats").arm += shieldComponent.arm;
      addLog(["Wielding ", "orangered", trg, false, " now.", "orangered"]);
    }

    if (armorComponent) {
      armorSlots.armorSlots.push(trg);
      armorSlots.currentWeight += armorComponent.slotWeight;
      armorComponent.isEquipped = true;
      src.getComponent("Stats").arm += armorComponent.arm;
      addLog(["Wearing ", "orangered", trg, false, " now.", "orangered"]);
    }

    if (chipComponent) {
      chipSlots.chipSlots.push(trg);
      chipSlots.currentWeight += chipComponent.slotWeight;
      chipComponent.isEquipped = true;
      addLog(["Installed ", "orangered", trg, false, ".", "orangered"]);
    }

    if (equipEffectsComponent) {
      equipEffectsComponent.activateEffects(src);
    }

    srcInventory.splice(srcInventory.indexOf(trg), 1);
  },
  (src, trg) => {
    const wieldSlots = src.getComponent("WieldSlots");
    const armorSlots = src.getComponent("ArmorSlots");
    const chipSlots = src.getComponent("ChipSlots");

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");
    const chipComponent = trg.getComponent("Chip");

    if (weaponComponent) {
      if (
        wieldSlots.currentWeight + weaponComponent.slotWeight <=
        wieldSlots.maxWeight
      )
        return true;
      else {
        addLog(["Not enough space for ", "red", trg, false, ".", "red"]);
        return false;
      }
    }

    if (shieldComponent) {
      if (
        wieldSlots.currentWeight + shieldComponent.slotWeight <=
        wieldSlots.maxWeight
      )
        return true;
    }

    if (armorComponent) {
      if (
        armorSlots.currentWeight + armorComponent.slotWeight <=
        armorSlots.maxWeight
      )
        return true;
    }

    if (chipComponent) {
      if (
        chipSlots.currentWeight + chipComponent.slotWeight <=
        chipSlots.maxWeight
      )
        return true;
    }

    addLog(["Not enough space for ", "red", trg, false, ".", "red"]);
    return false;
  }
);

const dropAction = new Action(
  "Drop",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;

    const wieldSlots = src.getComponent("WieldSlots");
    const armorSlots = src.getComponent("ArmorSlots");
    const chipSlots = src.getComponent("ChipSlots");

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");
    const chipComponent = trg.getComponent("Chip");

    const commonStorage = [
      ...inventory,
      ...wieldSlots.weaponSlots,
      ...wieldSlots.shieldSlots,
      ...armorSlots.armorSlots,
      ...chipSlots.chipSlots,
    ];

    for (let i = 0; i < commonStorage.length; i++) {
      const item = commonStorage[i];
      if (item == trg) {
        if (weaponComponent?.isEquipped) {
          wieldSlots.weaponSlots.splice(wieldSlots.weaponSlots.indexOf(trg), 1);
          weaponComponent.isEquipped = false;
          wieldSlots.currentWeight -= weaponComponent.slotWeight;
        }
        if (shieldComponent?.isEquipped) {
          wieldSlots.shieldSlots.splice(wieldSlots.shieldSlots.indexOf(trg), 1);
          shieldComponent.isEquipped = false;
          wieldSlots.currentWeight -= shieldComponent.slotWeight;
          src.getComponent("Stats").arm -= shieldComponent.arm;
        }
        if (armorComponent?.isEquipped) {
          armorSlots.armorSlots.splice(armorSlots.armorSlots.indexOf(trg), 1);
          armorComponent.isEquipped = false;
          armorSlots.currentWeight -= armorComponent.slotWeight;
          src.getComponent("Stats").arm -= armorComponent.arm;
        }
        if (chipComponent?.isEquipped) {
          chipSlots.chipSlots.splice(chipSlots.chipSlots.indexOf(trg), 1);
          chipComponent.isEquipped = false;
          chipSlots.currentWeight -= chipComponent.slotWeight;
        }

        if (
          !weaponComponent?.isEquipped &&
          !shieldComponent?.isEquipped &&
          !armorComponent?.isEquipped
        ) {
          inventory.splice(inventory.indexOf(trg), 1);
        }
      }
    }

    trg.x = src.x;
    trg.y = src.y;
    tilemap[src.y][src.x].push(trg);
    addLog(["You drop ", "white", trg, false, ".", "white"]);

    cancelLinkedEffects(src, trg);
  },
  (src, trg) => {
    // conditions to remove item (might be cursed etc...)
    return true;
  }
);

const removeAction = new Action(
  "Remove",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;

    const wieldSlots = src.getComponent("WieldSlots");
    const armorSlots = src.getComponent("ArmorSlots");
    const chipSlots = src.getComponent("ChipSlots");

    const weaponComponent = trg.getComponent("Weapon");
    const shieldComponent = trg.getComponent("Shield");
    const armorComponent = trg.getComponent("Armor");
    const chipComponent = trg.getComponent("Chip");

    const commonStorage = [
      ...wieldSlots.weaponSlots,
      ...wieldSlots.shieldSlots,
      ...armorSlots.armorSlots,
      ...chipSlots.chipSlots,
    ];

    for (let i = 0; i < commonStorage.length; i++) {
      const item = commonStorage[i];
      if (item == trg) {
        if (weaponComponent?.isEquipped) {
          wieldSlots.weaponSlots.splice(wieldSlots.weaponSlots.indexOf(trg), 1);
          weaponComponent.isEquipped = false;
          wieldSlots.currentWeight -= weaponComponent.slotWeight;
          addLog(["You put your ", "white", trg, false, " away.", "white"]);
        }
        if (shieldComponent?.isEquipped) {
          wieldSlots.shieldSlots.splice(wieldSlots.shieldSlots.indexOf(trg), 1);
          shieldComponent.isEquipped = false;
          wieldSlots.currentWeight -= shieldComponent.slotWeight;
          src.getComponent("Stats").arm -= shieldComponent.arm;
          addLog(["You put your ", "white", trg, false, " away.", "white"]);
        }
        if (armorComponent?.isEquipped) {
          armorSlots.armorSlots.splice(armorSlots.armorSlots.indexOf(trg), 1);
          armorComponent.isEquipped = false;
          armorSlots.currentWeight -= armorComponent.slotWeight;
          src.getComponent("Stats").arm -= armorComponent.arm;
          addLog(["You take your ", "white", trg, false, " off.", "white"]);
        }
        if (chipComponent?.isEquipped) {
          chipSlots.chipSlots.splice(chipSlots.chipSlots.indexOf(trg), 1);
          chipComponent.isEquipped = false;
          chipSlots.currentWeight -= chipComponent.slotWeight;
          addLog(["You uninstall ", "white", trg, false, ".", "white"]);
        }

        inventory.push(trg);
      }
    }

    cancelLinkedEffects(src, trg);
  },
  (src, trg) => {
    // conditions to uneqip item (might be cursed etc...)
    return true;
  }
);

const activateAction = new Action(
  "Activate",
  1,
  (src, trg) => {
    const inventory = src.getComponent("Inventory").inventory;

    const scriptComponent = trg.getComponent("Script");
    const crystalComponent = trg.getComponent("Crystal");

    const encriptionComponent = trg.getComponent("Encription");
    const singleCryptedTitle = encriptionComponent?.singleCryptedTitle;

    // set currentTitle to a single title because we use only one item
    trg.currentTitle = encriptionComponent.isCrypted
      ? singleCryptedTitle
      : (trg.currentTitle = trg.singleTitle);

    if (scriptComponent) {
      addLog(["You execute a ", "lime", trg, false, ".", "lime"]);
    }
    if (crystalComponent) {
      addLog(["You drain energy from ", "lime", trg, false, ".", "lime"]);
    }

    if (encriptionComponent.isCrypted) {
      revealEncryptions(trg);
      trg.currentTitle = trg.singleTitle;
      addLog(["It was a ", "lime", trg, false, ".", "lime"]);
    }

    if (scriptComponent) scriptComponent.executeScript(src);
    if (crystalComponent) crystalComponent.drainCrystal(src);

    if (trg.getComponent("Stack").amount > 1) {
      trg.getComponent("Stack").amount--;
      handleTitle(trg);
    } else inventory.splice(inventory.indexOf(trg), 1);
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
  equipAction,
  dropAction,
  removeAction,
  activateAction,
};
