import { vectorEntities } from "../Entity/entities.js";

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

const moveAction = new Action("Move", 1, (vectorComponent, dx = 0, dy = 0) => {
  vectorComponent.dx += dx;
  vectorComponent.dy += dy;
});

export { moveAction };
