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
    if (!turnsComponent) return;

    turnsComponent.currentTurns -= this.cost;

    if (turnsComponent.currentTurns <= 0) {
      for (let i = turnsComponent.currentTurns; i <= 0; i++) {
        console.log("Skip turn!");
      }
      turnsComponent.currentTurns = turnsComponent.defaultTurns;
    }
  }
}

const moveAction = new Action("Move", 1, (entity, trgVector) => {
  entity.x += trgVector.dx;
  entity.y += trgVector.dy;
});

const attackAction = new Action(
  "Attack",
  1,
  (srcName, trgName, trgHealth, dmg) => {
    trgHealth.takeDamage(dmg);
    addLog(`${trgName} took ${dmg} damage from ${srcName}!`, "red");
  }
);

export { moveAction, attackAction };
