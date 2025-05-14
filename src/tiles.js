import {
  Collision,
  Vector,
  Size,
  Health,
  Turns,
  Damage,
} from "./Component/components.js";
import { Entity } from "./Entity/entities.js";

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
    [Vector, [0, 0]],
    [Collision, [0, 0]],
    [Health, [30, 30]],
    [Damage, [10]],
    [Turns, [1, 1]],
  ]
);

new Tile(
  "Zombie",
  2,
  10,
  5,
  [0, 1, 0],
  [
    [Vector, [0, 0]],
    [Collision, []],
    [Health, [30, 30]],
    [Damage, [5]],
  ]
);
new Tile("Gold", 1, 7, 4, [1, 1, 0], [[Size, ["tiny"]]]);
new Tile("Letter", 1, 5, 15, [1, 0.6, 0.6], [[Size, ["tiny"]]]);
new Tile("Floor", 1, 7, 0, [0, 0, 0]);
new Tile("Wall", 3, 0, 11, [0.1, 0.5, 0.1], [[Collision, [true]]]);

export { tiles };
