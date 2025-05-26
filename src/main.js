import { renderWorld, getEntitiesUnder } from "./System/engine.js";
import { spritesheet, viewPort, rooms, entities } from "./globals.js";
import {
  carveRooms,
  fillMap,
  populateMap,
  generateMap,
} from "./System/mapgen.js";
import { getEnemyEntitiesAround, getEntity, randomInt } from "./utils.js";
import { tiles } from "./tiles.js";
import { addBelow, updateUi } from "./ui/sidebar.js";
import { handleInput } from "./System/controls.js";

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => {
  fillMap();
  generateMap();
  carveRooms();
  initSpecialEntities();
  populateMap();
  initSystem();
  renderWorld();
  updateUi();
};

let player;

function initSpecialEntities() {
  const spawnRoom = rooms[randomInt(0, rooms.length - 1)];

  tiles.Guard.init(spawnRoom.getCenter().x - 1, spawnRoom.getCenter().y);
  tiles.Bit.init(spawnRoom.getCenter().x + 1, spawnRoom.getCenter().y);

  player = tiles.Player.init(spawnRoom.getCenter().x, spawnRoom.getCenter().y);
}

function initSystem() {
  viewPort.scrollTo(player.x, player.y);

  document.addEventListener("keydown", (event) => handleInput(event, player));

  document.addEventListener("gameTurn", () => {
    handleTurn();
    writeItemsBelow();
  });

  wakeUpSleepingEnemy();
  writeItemsBelow();
}

function writeItemsBelow() {
  const entitiesUnder = getEntitiesUnder(player, ["Floor"]);
  addBelow(entitiesUnder);
}

function handleTurn() {
  wakeUpSleepingEnemy();
  viewPort.scrollTo(player.x, player.y);
  renderWorld();
}

function wakeUpSleepingEnemy() {
  const enemies = getEnemyEntitiesAround(player, 5);
  if (enemies.length > 0)
    enemies.forEach((el) => {
      if (el.getComponent("Behavior"))
        el.getComponent("Behavior").active = true;
    });
}
