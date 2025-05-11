import { Collision, Vector, Size } from "./Component/components.js";
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
      this.components.forEach((component) => {
        entity.addComponent(component);
      });
    }

    return entity;
  }
}

new Tile("Player", 3, 15, 0, [0, 1, 0], [new Vector(0, 0), new Collision()]);
new Tile("Zombie", 2, 10, 5, [0, 1, 0], [new Vector(0, 0), new Collision()]);
new Tile("Gold", 1, 7, 4, [0.6, 0.5, 0.5], [new Size("tiny")]);
new Tile("Letter", 1, 5, 15, [1, 0.6, 0.6], [new Size("tiny")]);
new Tile("Floor", 1, 7, 0, [0, 0.03, 0]);
new Tile("Wall", 3, 0, 11, [0.1, 0.5, 0.1], [new Collision(true)]);

export { tiles };
