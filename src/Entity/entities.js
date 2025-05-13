import { colorize } from "../utils.js";
import { tilemap } from "../globals.js";

let entityId = 0;
class Entity {
  constructor(name, x, y, z, charX, charY, color) {
    this.id = entityId++;
    this.name = name;

    this.x = x;
    this.y = y;
    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = color;
    this.components = {};

    if (!(this.name in uniqueAssets))
      uniqueAssets[this.name] = colorize(charX, charY, color);

    tilemap[y][x].push(this);
    if (this.name !== "Wall" && this.name !== "Floor") {
      tilemap[y][x].sort((a, b) => a.z - b.z);
    }
  }

  addComponent(component) {
    if (component.type == "Vector") vectorEntities.push(this);
    this.components[component.type] = component;
  }

  getComponent(type) {
    return this.components[type];
  }

  destroy() {
    if (this.name === "Player") {
      alert("You are dead!");
      throw new Error("Death");
    }
    vectorEntities.splice(vectorEntities.indexOf(this), 1);
    for (const key in this) {
      delete this[key];
    }
  }
}

const uniqueAssets = {};

const vectorEntities = [];

export { Entity, vectorEntities, uniqueAssets };
