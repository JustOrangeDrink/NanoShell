import { addLog } from "../ui.js";

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

class Nanites {
  constructor(nanites) {
    this.type = "Nanites";
    this.currentNanites = nanites;
    this.maxNanites = nanites;
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
  constructor(dv, av) {
    this.type = "Stats";
    this.dv = dv;
    this.av = av;
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

export {
  Collision,
  Size,
  Health,
  Attributes,
  Nanites,
  Turns,
  Damage,
  Alignment,
  Behavior,
  Stats,
  Occlusion,
  Inventory,
};
