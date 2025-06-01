import { entities, tilemap } from "../globals.js";

let entityId = 0;
class Entity {
  constructor(
    name,
    title,
    x,
    y,
    z,
    charX,
    charY,
    colors = [0, 0, 0, 0],
    bgColors = [0, 0, 0, 0]
  ) {
    const [r, g, b, a] = colors;
    const [bgR, bgG, bgB, bgA] = bgColors;

    this.id = entityId++;
    this.name = name;
    this.title = title;

    this.x = x;
    this.y = y;
    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];

    this.renderName = `Name${name}_Color${r}_${g}_${b}_${a}_Bg${bgR}_${bgG}_${bgB}_${bgA}}`;

    this.components = {};

    this.isViewed = false;
    this.revealed = false;

    this.lastX = x;
    this.lastY = y;

    for (let i = 0; i < tilemap[y][x].length; i++) {
      const entity = tilemap[y][x][i];
      if (entity.getComponent("Stack") && entity.name == this.name) {
        entity.getComponent("Stack").amount++;
        entity.title = `${entity.getComponent("Stack").amount} ${entity.name}s`;
        return;
      }
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

const vectorEntities = [];
const turnsEntities = [];

export { Entity, vectorEntities, turnsEntities };
