import { colorize } from "../utils.js";
import { entities, tilemap } from "../globals.js";

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

    this.isViewed = false;
    this.revealed = false;

    this.lastX = x;
    this.lastY = y;

    if (!(this.name in uniqueAssets)) {
      uniqueAssets[this.name] = colorize(charX, charY, color);
      uniqueAssetsDark[this.name] = colorize(charX, charY, [
        color[0] / 4,
        color[1] / 4,
        color[2] / 4,
      ]);
    }

    tilemap[y][x].push(this);
    if (this.name !== "Wall" && this.name !== "Floor") {
      tilemap[y][x].sort((a, b) => a.z - b.z);
    }

    entities.push(this);
  }

  addComponent(component) {
    if (component.type == "Vector") vectorEntities.push(this);
    if (component.type == "Turns") turnsEntities.push(this);
    this.components[component.type] = component;
  }

  getComponent(type) {
    return this.components[type];
  }

  destroy() {
    tilemap[this.y][this.x].splice(tilemap[this.y][this.x].indexOf(this), 1);
    vectorEntities.splice(vectorEntities.indexOf(this), 1);
    turnsEntities.splice(turnsEntities.indexOf(this), 1);
    for (const key in this) {
      delete this[key];
    }
    document.dispatchEvent(new Event("gameTurn"));
  }
}

const uniqueAssets = {};
const uniqueAssetsDark = {};

const vectorEntities = [];
const turnsEntities = [];

export {
  Entity,
  vectorEntities,
  turnsEntities,
  uniqueAssets,
  uniqueAssetsDark,
};
