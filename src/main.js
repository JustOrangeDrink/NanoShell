import { handleMovement, renderWorld, handleInput } from "./System/engine.js";
import {
  TILE_SIZE,
  canvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  spritesheet,
  viewPort,
  CANVAS_TILED_WIDTH,
  CANVAS_TILED_HEIGHT,
} from "./globals.js";
import { Entity } from "./Entity/entities.js";
import { Position, Vector, Render, Collision } from "./Component/components.js";

//Recalculating size so it in tiles boundaries
// canvas.width = Math.floor(SCREEN_WIDTH / TILE_SIZE) * TILE_SIZE;
// canvas.height = Math.floor(SCREEN_HEIGHT / TILE_SIZE) * TILE_SIZE;

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => renderWorld();

for (let x = 0; x < CANVAS_TILED_WIDTH; x++) {
  for (let y = 0; y < CANVAS_TILED_HEIGHT; y++) {
    const floor = new Entity("Floor");
    floor.addComponent(new Position(x, y));
    floor.addComponent(new Render(8, 0, "gray"));
  }
}

const zombie = new Entity("Zombie");
zombie.addComponent(new Position(23, 8));
zombie.addComponent(new Vector(0, 0));
zombie.addComponent(new Render(10, 5, "green"));
zombie.addComponent(new Collision(true));

const gold = new Entity("Gold");
gold.addComponent(new Position(25, 12));
gold.addComponent(new Render(7, 4, "gold"));

const letter = new Entity("Letter");
letter.addComponent(new Position(23, 12));
letter.addComponent(new Render(5, 15, "orange"));
letter.addComponent(new Vector(0, 0));

const hero = new Entity("Hero");
hero.addComponent(new Position(26, 10));
hero.addComponent(new Vector(0, 0));
hero.addComponent(new Render(0, 4, "white"));
hero.addComponent(new Collision(true));

viewPort.scrollTo(
  hero.getComponent("Position").x,
  hero.getComponent("Position").y
);

document.addEventListener("keydown", (event) => handleInput(event, hero));

document.addEventListener("moved", () => {
  handleMovement();
  viewPort.scrollTo(
    hero.getComponent("Position").x,
    (viewPort.y = hero.getComponent("Position").y)
  );
  renderWorld();
});
