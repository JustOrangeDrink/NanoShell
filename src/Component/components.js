import { addLog } from "../ui/sidebar.js";

class Collision {
  constructor(collision = true, smallCollision = false) {
    this.type = "Collision";
    this.collision = collision;
    this.smallCollision = smallCollision;
  }
}

class Size {
  constructor(size) {
    this.type = "Size";
    this.size = size;
  }
}

class Health {
  constructor(maxHp, currentHp) {
    this.type = "Health";
    this.maxHp = maxHp;
    this.currentHp = currentHp;
  }
  takeDamage(entity, amount) {
    this.currentHp -= amount;
    if (this.currentHp <= 0) {
      if (entity.name == "Player") {
        addLog(["You are dead!", "red"]);
        entity.destroy();
      } else {
        addLog([`${entity.currentTitle} is dead!`, "lime"]);
        entity.destroy();
      }
    }
  }
}

class CPU {
  constructor(maxTemperature) {
    this.type = "CPU";
    this.currentTemperature = 0;
    this.maxTemperature = maxTemperature;
  }
}

class Damage {
  constructor(dmg) {
    this.type = "Damage";
    this.dmg = dmg;
  }
}

class Attributes {
  constructor(str, agi, dur) {
    this.type = "Attributes";
    this.str = str;
    this.agi = agi;
    this.dur = dur;
  }
}

class Stats {
  constructor(ddg, arm, qkn) {
    this.type = "Stats";
    this.ddg = ddg;
    this.arm = arm;
    this.qkn = qkn;
  }
}

class Turns {
  constructor() {
    this.type = "Turns";
    this.currentTime = 0;
  }
}

class Alignment {
  constructor(alignment) {
    this.type = "Alignment";
    this.alignment = alignment;
  }
}

class Behavior {
  constructor(behavior) {
    this.type = "Behavior";
    this.useBehavior = behavior;
    this.active = false;
  }
}

class Occlusion {
  constructor(occlusion = true) {
    this.type = "Occlusion";
    this.occlusion = occlusion;
  }
}

class Inventory {
  constructor() {
    this.type = "Inventory";
    this.inventory = [];
  }
}

class Pickable {
  constructor(popupType) {
    this.type = "Pickable";
    this.pickable = true;
    this.popupType = popupType;
  }
}

class Stack {
  constructor() {
    this.type = "Stack";
    this.amount = 1;
    this.stackable = true;
  }
}

class Hidden {
  constructor() {
    this.type = "Hidden";
    this.hidden = true;
  }
}

class WieldSlots {
  constructor(maxWeight, unarmedWeapon) {
    this.type = "WieldSlots";
    this.weaponSlots = [];
    this.shieldSlots = [];
    this.maxWeight = maxWeight;
    this.currentWeight = 0;
    this.unarmedWeapon = unarmedWeapon;
  }
}

class ArmorSlots {
  constructor(maxWeight) {
    this.type = "ArmorSlots";
    this.armorSlots = [];
    this.maxWeight = maxWeight;
    this.currentWeight = 0;
  }
}

class ChipSlots {
  constructor(maxWeight) {
    this.type = "ChipSlots";
    this.chipSlots = [];
    this.maxWeight = maxWeight;
    this.currentWeight = 0;
  }
}

class Weapon {
  constructor(acc, dmg, slotWeight, hitTitle = "hit") {
    this.type = "Weapon";
    this.acc = acc;
    this.dmg = dmg;
    this.slotWeight = slotWeight;
    this.hitTitle = hitTitle;
    this.isEquipped = false;
  }
}

class Shield {
  constructor(arm, slotWeight) {
    this.type = "Shield";
    this.arm = arm;
    this.slotWeight = slotWeight;
    this.isEquipped = false;
  }
}

class Armor {
  constructor(arm, slotWeight) {
    this.type = "Armor";
    this.arm = arm;
    this.slotWeight = slotWeight;
    this.isEquipped = false;
  }
}

class Chip {
  constructor(slotWeight) {
    this.type = "Chip";
    this.slotWeight = slotWeight;
    this.isEquipped = false;
  }
}

class EquipEffects {
  constructor(...effects) {
    this.type = "EquipEffects";
    this.effects = effects;
  }
  activateEffects(trg) {
    for (let i = 0; i < this.effects.length; i++) {
      const [effect, ...effectArgs] = this.effects[i];
      effect(trg, ...effectArgs);
    }
  }
}

class Encryption {
  constructor(singleCryptedTitle, multipleCryptedTitle) {
    this.type = "Encryption";
    this.isCrypted = true;
    this.singleCryptedTitle = singleCryptedTitle;
    this.multipleCryptedTitle = multipleCryptedTitle;
  }
}

class Script {
  constructor(...effects) {
    this.type = "Script";
    this.effects = effects;
  }
  executeScript(trg) {
    for (let i = 0; i < this.effects.length; i++) {
      const [effect, ...effectArgs] = this.effects[i];
      effect(trg, ...effectArgs);
    }
  }
}

class Crystal {
  constructor(...effects) {
    this.type = "Crystal";
    this.effects = effects;
  }
  drainCrystal(trg) {
    for (let i = 0; i < this.effects.length; i++) {
      const [effect, ...effectArgs] = this.effects[i];
      effect(trg, ...effectArgs);
    }
  }
}

class ScheduledEffects {
  constructor() {
    this.type = "ScheduledEffects";
    this.scheduledEffects = [];
  }
}

export {
  Collision,
  Size,
  Health,
  Attributes,
  CPU,
  Turns,
  Damage,
  Alignment,
  Behavior,
  Stats,
  Occlusion,
  Inventory,
  Pickable,
  Stack,
  Hidden,
  WieldSlots,
  ArmorSlots,
  ChipSlots,
  Weapon,
  Shield,
  Armor,
  Chip,
  EquipEffects,
  Script,
  Encryption,
  Crystal,
  ScheduledEffects,
};
