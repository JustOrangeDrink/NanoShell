import { entities, tilemap } from "../globals.js";
import { getRenderName, handleTitle } from "../utils.js";

let entityId = 0;
class Entity {
  constructor(
    name,
    singleTitle,
    multipleTitle,
    x,
    y,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 255],
    bgColorArray = [0, 0, 0, 0],
    animation = false
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.id = entityId++;

    this.name = name;
    this.singleTitle = singleTitle;
    this.multipleTitle = multipleTitle;
    this.currentTitle = singleTitle;

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

    this.effects = [];

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
        handleTitle(entity);
        return;
      }
    }

    tilemap[y][x].push(this);
    tilemap[y][x].sort((a, b) => a.z - b.z);
    entities.push(this);
  }

  addComponent(component) {
    this.components[component.type] = component;

    if (component.type == "Vector") vectorEntities.push(this);
    if (component.type == "Turns") turnsEntities.push(this);
    if (component.type == "ScheduledEffects") effectsEntities.push(this);
    if (component.type == "Encription") {
      encryptedEntities.push(this);
    }

    handleTitle(this);
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
const effectsEntities = [];
const encryptedEntities = [];

export {
  Entity,
  vectorEntities,
  turnsEntities,
  effectsEntities,
  encryptedEntities,
};
