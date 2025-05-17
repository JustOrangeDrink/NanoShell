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
    if (this.currentHp === 0) {
      addLog(`${entity.name} is dead!`);
      entity.destroy();
    }
  }
}

class Damage {
  constructor(dmg) {
    this.type = "Damage";
    this.dmg = dmg;
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
  }
}

export { Collision, Size, Health, Turns, Damage, Alignment, Behavior };
