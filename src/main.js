import {
  handleMovement,
  renderWorld,
  handleInput,
  getEntitiesUnder,
} from "./System/engine.js";
import { spritesheet, viewPort } from "./globals.js";
import { Entity } from "./Entity/entities.js";
import { Vector, Render, Collision, Size } from "./Component/components.js";
import {
  carveRooms,
  fillMap,
  generateMap,
  hasRoomInRect,
  rooms,
} from "./System/mapgen.js";
import { randomInt } from "../utils.js";

function initEntities() {
  const zombie = new Entity("Zombie", 23, 8, 2, 10, 5, [0, 1, 0]);
  zombie.addComponent(new Vector(0, 0));
  zombie.addComponent(new Collision());

  const gold = new Entity("Gold", 25, 12, 1, 7, 4, [0.6, 0.5, 0.5]);
  gold.addComponent(new Size("tiny"));

  const letter = new Entity("Letter", 23, 12, 1, 5, 15, [1, 0.6, 0.6]);
  letter.addComponent(new Size("tiny"));

  const spawnRoom = rooms[randomInt(0, rooms.length - 1)];
  player = new Entity(
    "Player",
    spawnRoom.getCenter().x,
    spawnRoom.getCenter().y,
    3,
    4,
    0,
    [1, 1, 1]
  );
  player.addComponent(new Vector(0, 0));
  player.addComponent(new Collision());
  viewPort.scrollTo(player.x, player.y);
}
let player;

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => {
  fillMap();
  generateMap();
  carveRooms();
  initEntities();
  renderWorld();
};

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
