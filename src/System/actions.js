class Action {
  constructor(name, cost, action) {
    this.name = name;
    this.cost = cost;
    this.action = action;
  }
}

const moveAction = new Action("Move", 1, (vectorComponent, dx = 0, dy = 0) => {
  vectorComponent.dx += dx;
  vectorComponent.dy += dy;
});

export { moveAction };
