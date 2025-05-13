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

class Health {
  constructor(maxHp, hp) {
    this.type = "Health";
    this.maxHp = maxHp;
    this.hp = hp;
  }
  takeDamage(amount) {
    this.hp -= amount;
  }
}

class Damage {
  constructor(dmg) {
    this.type = "Damage";
    this.dmg = dmg;
  }
}

class Turns {
  constructor(defaultTurns, turns) {
    this.type = "Turns";
    this.defaultTurns = defaultTurns;
    this.turns = turns;
  }
}

/*

entity.actions = 4

{
  name: superPunch,
  owner: entity,
  cost: 1,
  action: () => {}
}

makeAction(action) {
  action.make();
  entity.actions -= action.cost; // 3

  for (let i = entity.actions; i <= 0; i++) {
    endTurn();
    entity.actions = entity.quickness; // 1
  }
}
      
*/

export { Vector, Collision, Size, Health, Turns, Damage };
