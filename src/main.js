import { drawTile, handleMovement, renderWorld } from "./System/engine.js";
import { addEventHandler } from "./System/eventHandler.js";
import {
  TILE_SIZE,
  canvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  spritesheet,
} from "./globals.js";
import { Entity, entities } from "./Entity/entities.js";
import { Position, Vector, Render } from "./Component/components.js";

//Recalculating size so it in tiles boundaries
canvas.width = Math.floor(SCREEN_WIDTH / TILE_SIZE) * TILE_SIZE;
canvas.height = Math.floor(SCREEN_HEIGHT / TILE_SIZE) * TILE_SIZE;

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => renderWorld(entities);

const zombie = new Entity();
zombie.addComponent(new Position(3, 3));
zombie.addComponent(new Vector(0, 0));
zombie.addComponent(new Render(3, 5, "green"));
console.log(zombie);

addEventHandler(document, zombie);
document.addEventListener("moved", () => {
  handleMovement(entities);
  renderWorld(entities);
});
