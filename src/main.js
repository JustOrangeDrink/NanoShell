import {
  handleMovement,
  renderWorld,
  handleInput,
  getEntitiesUnder,
} from "./System/engine.js";
import {
  spritesheet,
  viewPort,
  rooms,
  ctx,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "./globals.js";
import {
  carveRooms,
  fillMap,
  generateMap,
  populateMap,
} from "./System/mapgen.js";
import { randomInt } from "./utils.js";
import { tiles } from "./tiles.js";
import { addBelow } from "./ui.js";

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => {
  fillMap();
  generateMap();
  carveRooms();
  initSpecialEntities();
  populateMap();
  initSystem();
  renderWorld();
};

let player;

function initSpecialEntities() {
  const spawnRoom = rooms[randomInt(0, rooms.length - 1)];

  tiles.Zombie.init(spawnRoom.getCenter().x - 1, spawnRoom.getCenter().y);
  tiles.Gold.init(spawnRoom.getCenter().x + 1, spawnRoom.getCenter().y);

  player = tiles.Player.init(spawnRoom.getCenter().x, spawnRoom.getCenter().y);
}

function initSystem() {
  viewPort.scrollTo(player.x, player.y);

  document.addEventListener("keydown", (event) => handleInput(event, player));

  document.addEventListener("gameTurn", () => {
    handleTurn();
    writeItemsBelow();
  });
  writeItemsBelow();
}

function writeItemsBelow() {
  const entitiesUnder = getEntitiesUnder(player, [""]);
  const entitiesUnderNames = [];
  entitiesUnder.forEach((el) => {
    entitiesUnderNames.push(el.name);
  });
  addBelow(entitiesUnderNames);
}

function handleTurn() {
  handleMovement();
  viewPort.scrollTo(player.x, player.y);
  renderWorld();
}
