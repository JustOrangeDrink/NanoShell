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
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";
import { guardBehavior } from "./System/ai.js";

const tiles = {};

class Tile {
  constructor(name, z, charX, charY, rgb, components) {
    this.name = name;
    this.z = z;
    this.charX = charX;
    this.charY = charY;
    this.rgb = rgb;
    this.components = components;

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
      this.rgb
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
  3,
  0,
  4,
  [1, 1, 1],
  [
    [Collision, [0, 0]],
    [Health, [30, 30]],
    [Damage, [10]],
    [Turns, [1, 1, 0]],
    [Alignment, ["Good"]],
    [Stats, [2, 65, 10]],
  ]
);

new Tile(
  "Guard",
  2,
  7,
  4,
  [1, 0, 1],
  [
    [Collision, []],
    [Health, [15, 15]],
    [Damage, [5]],
    [Turns, [1, 1, 0]],
    [Alignment, ["Bad"]],
    [Behavior, [guardBehavior]],
    [Stats, [1, 40, 10]],
  ]
);

new Tile("Bit", 1, 13, 14, [1, 1, 0], [[Size, ["tiny"]]]);

new Tile("Letter", 1, 5, 15, [1, 0.6, 0.6], [[Size, ["tiny"]]]);

new Tile("Floor", 1, 7, 0, [0, 0, 0]);

new Tile(
  "Wall",
  3,
  0,
  11,
  [0, 0.8, 0],
  [
    [Collision, [true]],
    [Occlusion, [true]],
  ]
);

export { tiles };
