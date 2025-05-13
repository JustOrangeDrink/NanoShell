import { vectorEntities } from "../Entity/entities.js";
import { addLog } from "../ui.js";

class Action {
  constructor(name, cost, action) {
    this.name = name;
    this.cost = cost;
    this.action = action;
  }
  makeAction(entity, ...args) {
    this.action(...args);

    const turnsComponent = entity.getComponent("Turns");

    turnsComponent.turns -= this.cost;

    if (turnsComponent.turns <= 0) {
      for (let i = turnsComponent.turns; i <= 0; i++) {
        // do other entities turns
      }
      turnsComponent.turns = turnsComponent.defaultTurns;
    }
  }
}

const moveAction = new Action("Move", 1, (trgVector, dx = 0, dy = 0) => {
  trgVector.dx += dx;
  trgVector.dy += dy;
});

const attackAction = new Action("Attack", 1, (src, trg, trgHealth, dmg) => {
  trgHealth.takeDamage(dmg);
  addLog(`${trg.name} took ${dmg} damage from ${src.name}!`, "red");
});

export { moveAction, attackAction };
