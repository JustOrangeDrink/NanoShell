let entityId = 0;
class Entity {
  constructor() {
    this.id = entityId++;
    this.components = {};
    entities.push(this);
    // this.x = x;
    // this.y = y;
    // this.dx = 0;
    // this.dy = 0;
    // this.char = char;
    // this.color = color;
  }
  addComponent(component) {
    this.components[component.type] = component;
  }
  getComponent(type) {
    return this.components[type];
  }
}
const entities = [];

// const zombie = new Entity(11, 15, [10, 5], "green", true);
// const hero = new Entity(13, 10, [0, 4], "white", true);
// const test = new Entity(13, 15, [0, 0], "purple", true);

export { Entity, entities };
