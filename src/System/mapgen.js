import { CANVAS_TILED_HEIGHT, CANVAS_TILED_WIDTH } from "../globals.js";
import { getEntity } from "./engine.js";
import { entities, Entity } from "../Entity/entities.js";
import { Collision, Position, Render } from "../Component/components.js";

function fillMap() {
  for (let x = 0; x < CANVAS_TILED_WIDTH; x++) {
    for (let y = 0; y < CANVAS_TILED_HEIGHT; y++) {
      const wall = new Entity("Wall", 3);
      wall.addComponent(new Position(x, y));
      wall.addComponent(new Render(11, 13, "gray"));
      wall.addComponent(new Collision());
    }
  }
}

function carveTile(x, y) {
  const wallIndex = getEntity("Wall", x, y);
  entities.splice(wallIndex, 1);

  const floor = new Entity("Floor", 0);
  floor.addComponent(new Position(x, y));
  floor.addComponent(new Render(0, 11, "Gray"));
}

function carveRoom(x, y, w, h) {
  for (let currentX = x; currentX < x + w; currentX++) {
    for (let currentY = y; currentY < y + h; currentY++) {
      carveTile(currentX, currentY);
    }
  }
}

export { fillMap, carveTile, carveRoom };
