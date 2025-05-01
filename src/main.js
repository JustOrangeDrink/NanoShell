import {
  handleMovement,
  renderWorld,
  handleInput,
  getEntitiesUnder,
  getEntity,
} from "./System/engine.js";
import { spritesheet, viewPort } from "./globals.js";
import { Entity } from "./Entity/entities.js";
import {
  Position,
  Vector,
  Render,
  Collision,
  Size,
} from "./Component/components.js";
import { carveRoom, carveTile, fillMap } from "./System/mapgen.js";

fillMap();

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => renderWorld();

const zombie = new Entity("Zombie", 2);
zombie.addComponent(new Position(23, 8));
zombie.addComponent(new Vector(0, 0));
zombie.addComponent(new Render(10, 5, "green"));
zombie.addComponent(new Collision(true));

const gold = new Entity("Gold", 1);
gold.addComponent(new Position(25, 12));
gold.addComponent(new Render(7, 4, "gold"));
gold.addComponent(new Size("tiny"));

const letter = new Entity("Letter", 1);
letter.addComponent(new Position(23, 12));
letter.addComponent(new Render(5, 15, "orange"));
letter.addComponent(new Size("tiny"));

const player = new Entity("Player", 3);
player.addComponent(new Position(26, 10));
player.addComponent(new Vector(0, 0));
player.addComponent(new Render(0, 4, "white"));
player.addComponent(new Collision());

viewPort.scrollTo(
  player.getComponent("Position").x,
  player.getComponent("Position").y
);

carveRoom(15, 1, 15, 12);

document.addEventListener("keydown", (event) => handleInput(event, player));

document.addEventListener("moved", () => {
  handleMovement();
  viewPort.scrollTo(
    player.getComponent("Position").x,
    (viewPort.y = player.getComponent("Position").y)
  );

  const entitiesUnder = getEntitiesUnder(player, ["Floor"]);

  let entitiesUnderNames = " ";
  if (entitiesUnder)
    entitiesUnder.forEach((el) => (entitiesUnderNames += "\n" + el.name));
  console.log("Under:", entitiesUnderNames);
  entitiesUnderNames = "";

  renderWorld();
});

// setInterval(() => zombie.getComponent("Vector").dx++, 1000);
// setInterval(() => letter.getComponent("Vector").dx++, 1000);
// setInterval(() => gold.getComponent("Vector").dx++, 1000);
// letter.addComponent(new Vector(0, 0));
// gold.addComponent(new Vector(0, 0));
