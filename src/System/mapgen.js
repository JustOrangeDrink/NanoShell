import { tilemap } from "../globals.js";
import { Entity } from "../Entity/entities.js";
import { Collision, Render } from "../Component/components.js";

function fillMap() {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      const wall = new Entity("Wall", x, y, 3);
      wall.addComponent(new Render(11, 13, "gray"));
      wall.addComponent(new Collision(true));
    }
  }
}

function carveTile(x, y) {
  tilemap[y][x].forEach((el, i) => {
    if (el.name == "Wall") tilemap[y][x].splice(i, 1);
  });

  const floor = new Entity("Floor", x, y, 0);
  floor.addComponent(new Render(10, 15, "white"));
}

function carveRoom(x, y, w, h) {
  for (let currentX = x; currentX < x + w; currentX++) {
    for (let currentY = y; currentY < y + h; currentY++) {
      carveTile(currentX, currentY);
    }
  }
}

export { fillMap, carveTile, carveRoom };
