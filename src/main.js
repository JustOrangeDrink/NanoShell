import { handleMovement, renderWorld, handleInput } from "./System/engine.js";
import {
  TILE_SIZE,
  canvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  spritesheet,
} from "./globals.js";
import { Entity } from "./Entity/entities.js";
import { Position, Vector, Render, Collision } from "./Component/components.js";

//Recalculating size so it in tiles boundaries
canvas.width = Math.floor(SCREEN_WIDTH / TILE_SIZE) * TILE_SIZE;
canvas.height = Math.floor(SCREEN_HEIGHT / TILE_SIZE) * TILE_SIZE;

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => renderWorld();

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

document.addEventListener("keydown", (event) => handleInput(event, hero));

document.addEventListener("moved", () => {
  handleMovement();
  renderWorld();
});

// setInterval(() => zombie.getComponent("Vector").dx++, 1000);
// setInterval(() => letter.getComponent("Vector").dy++, 3000);
