let entityId = 0;
class EntitySrc {
  constructor(name, z) {
    this.id = entityId++;
    this.name = name;
    this.z = z;
    this.components = {};
  }
  addComponent(component) {
    this.components[component.type] = component;
  }
  getComponent(type) {
    return this.components[type];
  }
}

const Entity = new Proxy(EntitySrc, {
  construct: (target, args) => {
    const entity = new target(...args);
    entities.push(entity);
    entities.sort((a, b) => a.z - b.z);
    return entity;
  },
});

const entities = [];

export { Entity, entities };
