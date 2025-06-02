import {
  Collision,
  Size,
  Health,
  Turns,
  Damage,
  Alignment,
  Behavior,
  Stats,
  Occlusion,
  CPU,
  Attributes,
  Inventory,
  Pickable,
  Stack,
  WeaponSlots,
  Weapon,
  Hidden,
  ShieldSlots,
  Shield,
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";
import { guardBehavior } from "./System/ai.js";
import { getRenderName } from "./utils.js";

const tiles = {};

class Tile {
  constructor(
    name,
    title,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 0],
    components,
    bgColorArray = [0, 0, 0, 0]
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.name = name;
    this.title = title;
    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];
    this.renderName = getRenderName(name, colorArray, bgColorArray);

    this.components = components;

    tiles[name] = this;
  }

  init(x, y) {
    const entity = new Entity(
      this.name,
      this.title,
      x,
      y,
      this.z,
      this.charX,
      this.charY,
      this.color,
      this.bg
    );

    if (this.components) {
      for (let i = 0; i < this.components.length; i++) {
        const component = this.components[i];
        entity.addComponent(new component[0](...component[1]));
      }
    }

    return entity;
  }
}

new Tile(
  "Player",
  "Player",
  4,
  0,
  4,
  [255, 255, 255, 255],
  [
    [Collision, [0, 0]],
    [Health, [30, 30]],
    [CPU, [10]],
    [Damage, [10]],
    [Turns, [1, 1, 0]],
    [Alignment, ["Good"]],
    [Stats, [65, 10, 1]],
    [Attributes, [3, 5, 3]],
    [Inventory, []],
    [WeaponSlots, [2]],
    [ShieldSlots, [2]],
  ]
);

new Tile(
  "Guard",
  "Guard",
  3,
  7,
  4,
  [255, 0, 255, 255],
  [
    [Collision, []],
    [Health, [15, 15]],
    [Damage, [5]],
    [Turns, [1, 1, 0]],
    [Alignment, ["Bad"]],
    [Behavior, [guardBehavior]],
    [Stats, [40, 1, 1]],
    [Attributes, [1, 1, 1]],
    [WeaponSlots, [2]],
    [ShieldSlots, [2]],
  ]
);

new Tile(
  "Bit",
  "Bit",
  1,
  13,
  14,
  [255, 255, 0, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, []],
    [Stack, []],
  ]
);

new Tile(
  "Letter",
  "Letter",
  1,
  5,
  15,
  [255, 160, 160, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, []],
  ]
);

new Tile("Floor", "Floor", 0, 9, 15, [40, 40, 40, 255]);

new Tile(
  "Wall",
  "Wall",
  2,
  3,
  2,
  [0, 255, 0, 255],
  [
    [Collision, [true]],
    [Occlusion, [true]],
  ]
);

new Tile("Fist", "Fist", 0, 0, 0, [0, 0, 0, 0], [[Weapon, [2, 0]]]);

new Tile(
  "Sword",
  "Sword",
  1,
  8,
  1,
  [220, 220, 220, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, []],
    [Weapon, [10, 1]],
  ]
);

new Tile(
  "Shield",
  "Shield",
  1,
  8,
  1,
  [220, 220, 220, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, []],
    [Shield, [2, 1]],
  ]
);

new Tile("Filler", "Filler", 5, 11, 13, [255, 0, 0, 255], [[Hidden, []]]);

export { tiles };
