import { thronglerShine } from "./Animations/animations.js";
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
  WieldSlots,
  Weapon,
  Hidden,
  Shield,
  Armor,
  ArmorSlots,
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";
import { guardBehavior } from "./System/ai.js";
import { getRenderName } from "./utils.js";

const tiles = {};

class Tile {
  constructor(
    name,
    z,
    charX,
    charY,
    colorArray = [0, 0, 0, 0],
    components,
    bgColorArray = [0, 0, 0, 0],
    animation = false
  ) {
    const [r, g, b, a] = colorArray;
    const [bgR, bgG, bgB, bgA] = bgColorArray;

    this.name = name;
    this.title = this.name;
    this.z = z;

    this.charX = charX;
    this.charY = charY;
    this.color = [r, g, b, a];
    this.bg = [bgR, bgG, bgB, bgA];
    this.renderName = getRenderName(name, colorArray, bgColorArray);

    this.components = components;

    this.animation = animation;

    tiles[name] = this;
  }

  init(x, y) {
    const entity = new Entity(
      this.name,
      x,
      y,
      this.z,
      this.charX,
      this.charY,
      this.color,
      this.bg,
      this.animation
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

new Tile("Fist", 0, 0, 0, [0, 0, 0, 0], [[Weapon, [0, 0, 0, "punch"]]]);

new Tile(
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
    [Stats, [50, 0, 1]],
    [Attributes, [3, 5, 3]],
    [Inventory, []],
    [WieldSlots, [2, tiles.Fist.init()]],
    [ArmorSlots, [1]],
  ]
);

new Tile(
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
    [Stats, [40, 0, 1]],
    [Attributes, [1, 1, 1]],
    [WieldSlots, [2, tiles.Fist.init()]],
  ]
);

new Tile(
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
  "Script",
  1,
  5,
  15,
  [225, 175, 100, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, ["Read"]],
  ]
);

new Tile("Floor", 0, 9, 15, [40, 40, 40, 255]);

new Tile(
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

new Tile(
  "Sword",
  1,
  8,
  1,
  [220, 220, 220, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, ["Wield"]],
    [Weapon, [5, 10, 1, "slash"]],
  ]
);

new Tile(
  "Shield",
  1,
  8,
  14,
  [220, 220, 220, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, ["Wield"]],
    [Shield, [2, 1]],
  ]
);

new Tile(
  "Throngler",
  1,
  8,
  1,
  [255, 100, 255, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, ["Wield"]],
    [Weapon, [100, 1000, 1, "bonk"]],
  ],
  [],
  [thronglerShine]
);

new Tile(
  "Armor",
  1,
  14,
  1,
  [220, 220, 220, 255],
  [
    [Size, ["Tiny"]],
    [Pickable, ["Equip"]],
    [Armor, [4, 1]],
  ]
);

new Tile("Filler", 5, 11, 13, [255, 0, 0, 255], [[Hidden, []]]);

export { tiles };
