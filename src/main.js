import {
  handleMovement,
  renderWorld,
  handleInput,
  getEntitiesUnder,
} from "./System/engine.js";
import { spritesheet, viewPort, rooms } from "./globals.js";
import { carveRooms, fillMap, generateMap } from "./System/mapgen.js";
import { randomInt } from "./utils.js";
import { tiles } from "./tiles.js";

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => {
  fillMap();
  generateMap();
  carveRooms();
  initSpecialEntities();
  initSystem();
  renderWorld();
};

let player;

function initSpecialEntities() {
  const spawnRoom = rooms[randomInt(0, rooms.length - 1)];

  // tiles.Zombie.init(
  //   spawnRoom.getCenter().x - 1,
  //   spawnRoom.getCenter().y - 1
  // );

  player = tiles.Player.init(spawnRoom.getCenter().x, spawnRoom.getCenter().y);
}

function initSystem() {
  viewPort.scrollTo(player.x, player.y);

  document.addEventListener("keydown", (event) => handleInput(event, player));

  document.addEventListener("moved", () => {
    handleMovement();
    viewPort.scrollTo(player.x, (viewPort.y = player.y));
    renderWorld();

    const entitiesUnder = getEntitiesUnder(player, [""]);

    let entitiesUnderNames = " ";
    if (entitiesUnder)
      entitiesUnder.forEach((el) => (entitiesUnderNames += "\n" + el.name));
    console.log("Under:", entitiesUnderNames);
    entitiesUnderNames = "";
    console.log(player.x, player.y);
  });
}
