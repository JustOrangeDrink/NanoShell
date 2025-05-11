class Vector {
  constructor(dx = 0, dy = 0) {
    return new Proxy(
      {
        type: "Vector",
        dx: dx,
        dy: dy,
      },
      {
        set: (target, prop, value) => {
          target[prop] = value;
          if (value === 0) return true;
          document.dispatchEvent(new Event("gameTurn"));
          return true;
        },
      }
    );
  }
}

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

class Combat {
  constructor(maxHp, hp, dmg) {
    this.type = "Combat";
    this.maxHp = maxHp;
    this.hp = hp;
    this.dmg = dmg;
  }
  takeDamage(amount, self, src) {
    this.hp -= amount;
    return `${self.name} took ${amount} damage from ${src.name}!`;
  }
}

export { Vector, Collision, Size, Combat };
