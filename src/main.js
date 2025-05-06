import {
  handleMovement,
  renderWorld,
  handleInput,
  getEntitiesUnder,
} from "./System/engine.js";
import { spritesheet, viewPort } from "./globals.js";
import { Entity } from "./Entity/entities.js";
import { Vector, Render, Collision, Size } from "./Component/components.js";
import { carveRoom, fillMap } from "./System/mapgen.js";

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => renderWorld();
fillMap();

const zombie = new Entity("Zombie", 23, 8, 2);
zombie.addComponent(new Vector(0, 0));
zombie.addComponent(new Render(10, 5, "green"));
zombie.addComponent(new Collision());

const gold = new Entity("Gold", 25, 12, 1);
gold.addComponent(new Render(7, 4, "gold"));
gold.addComponent(new Size("tiny"));

const letter = new Entity("Letter", 23, 12, 1);
letter.addComponent(new Render(5, 15, "orange"));
letter.addComponent(new Size("tiny"));

const player = new Entity("Player", 26, 10, 3);
player.addComponent(new Vector(0, 0));
// player.addComponent(new Collision());
player.addComponent(new Render(0, 4, "white"));

carveRoom(15, 1, 15, 12);

viewPort.scrollTo(player.x, player.y);

document.addEventListener("keydown", (event) => handleInput(event, player));

document.addEventListener("moved", () => {
  handleMovement();
  viewPort.scrollTo(player.x, (viewPort.y = player.y));
  renderWorld();

  const entitiesUnder = getEntitiesUnder(player, []);

  let entitiesUnderNames = " ";
  if (entitiesUnder)
    entitiesUnder.forEach((el) => (entitiesUnderNames += "\n" + el.name));
  console.log("Under:", entitiesUnderNames);
  entitiesUnderNames = "";
});

// setInterval(() => zombie.getComponent("Vector").dx++, 1000);
// setInterval(() => letter.getComponent("Vector").dx++, 1000);
// setInterval(() => gold.getComponent("Vector").dx++, 1000);
// letter.addComponent(new Vector(0, 0));
// gold.addComponent(new Vector(0, 0));
