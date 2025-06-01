import { addLog } from "../UI/sidebar.js";

class Collision {
  constructor(smallCollision = false) {
    this.type = "Collision";
    this.collision = true;
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
        addLog("You are dead!", "red");
        entity.destroy();
      } else {
        addLog(`${entity.name} is dead!`, "lime");
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
  constructor(defaultTurns, currentTurns, currentTime) {
    this.type = "Turns";
    this.defaultTurns = defaultTurns;
    this.currentTurns = currentTurns;
    this.currentTime = currentTime;
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
  constructor(occlusion) {
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
  constructor() {
    this.type = "Pickable";
    this.pickable = true;
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

class WeaponSlots {
  constructor(maxSlots) {
    this.type = "WeaponSlots";
    this.slots = [];
    this.maxSlots = maxSlots;
  }
}

class ShieldSlots {
  constructor(maxSlots) {
    this.type = "ShieldSlots";
    this.slots = [];
    this.maxSlots = maxSlots;
  }
}

class ArmorSlots {
  constructor(maxSlots) {
    this.type = "ArmorSlots";
    this.slots = [];
    this.maxSlots = maxSlots;
  }
}

class Weapon {
  constructor(dmg) {
    this.type = "Weapon";
    this.dmg = dmg;
  }
}

class Shiled {
  constructor(arm) {
    this.type = "Shield";
    this.arm = arm;
  }
}

class Armor {
  constructor(arm) {
    this.type = "Armor";
    this.arm = arm;
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
  WeaponSlots,
  ShieldSlots,
  ArmorSlots,
  Weapon,
  Shiled,
  Armor,
};
