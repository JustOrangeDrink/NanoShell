import { tilemap } from "../globals.js";

let entityId = 0;
class EntitySrc {
  constructor(name, x, y, z) {
    this.id = entityId++;
    this.name = name;
    this.x = x;
    this.y = y;
    this.z = z;
    this.components = {};
  }
  addComponent(component) {
    if (component.type == "Vector") vectorEntities.push(this);
    this.components[component.type] = component;
  }
  getComponent(type) {
    return this.components[type];
  }
}
const vectorEntities = [];

const Entity = new Proxy(EntitySrc, {
  construct: (target, args) => {
    const entity = new target(...args);
    tilemap[args[2]][args[1]].push(entity);
    tilemap[args[2]][args[1]].sort((a, b) => a.z - b.z);
    return entity;
  },
});

export { Entity, vectorEntities };
