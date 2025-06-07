import { entities, tilemap } from "../globals.js";
import { getRenderName } from "../utils.js";

let entityId = 0;
class Entity {
  constructor(
    name,
    x,
    y,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 255],
    bgColorArray = [0, 0, 0, 0],
    animation
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.id = entityId++;
    this.name = name;
    this.title = this.name;

    this.x = x;
    this.y = y;
    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.defaultColor = [r, g, b, a];
    this.defaultBg = [bgR, bgG, bgB, bgA];

    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];

    this.animation = animation;

    this.renderName = getRenderName(name, colorArray, bgColorArray);

    this.components = {};

    this.isViewed = false;
    this.revealed = false;

    this.lastX = x;
    this.lastY = y;

    if (this.x == undefined && this.y == undefined) {
      entities.push(this);
      return;
    }

    for (let i = 0; i < tilemap[y][x].length; i++) {
      const entity = tilemap[y][x][i];
      if (entity.getComponent("Stack") && entity.name == this.name) {
        entity.getComponent("Stack").amount++;
        entity.title = `${entity.getComponent("Stack").amount} ${entity.name}s`;
        return;
      }
    }

    tilemap[y][x].push(this);
    tilemap[y][x].sort((a, b) => a.z - b.z);
    entities.push(this);
  }

  addComponent(component) {
    if (component.type == "Vector") vectorEntities.push(this);
    if (component.type == "Turns") turnsEntities.push(this);
    if (component.type == "Weapon")
      this.title = `a +${component.acc},+${component.dmg} ${this.name}`;
    if (component.type == "Shield")
      this.title = `a +${component.arm} ${this.name}`;
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
