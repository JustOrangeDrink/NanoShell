import { renderWorld, getEntitiesUnder } from "./System/engine.js";
import { spritesheet, viewPort, rooms } from "./globals.js";
import { populateMap, generateMap } from "./System/mapgen.js";
import { addEntityAsset, getEnemyEntitiesAround, randomInt } from "./utils.js";
import { tiles } from "./tiles.js";
import { addBelow, updateUi } from "./UI/sidebar.js";
import { handleInput } from "./System/controls.js";
import { updateInventoryUi } from "./UI/inventory.js";
import { thronglerShine } from "./Animations/animations.js";

spritesheet.src = "../assets/spritesheet.png";
spritesheet.onload = () => {
  for (const key in tiles) {
    addEntityAsset(tiles[key]);
  }
  renderWorld();
};

generateMap();
populateMap();

const spawnRoom = rooms[randomInt(0, rooms.length - 1)];

const player = tiles.Player.init(
  spawnRoom.getCenter().x,
  spawnRoom.getCenter().y
);

viewPort.scrollTo(player.x, player.y);
updateUi();
updateInventoryUi();

tiles.Guard.init(spawnRoom.getCenter().x - 1, spawnRoom.getCenter().y);

tiles.Bit.init(spawnRoom.getCenter().x + 1, spawnRoom.getCenter().y);
tiles.Bit.init(spawnRoom.getCenter().x + 2, spawnRoom.getCenter().y);

tiles.Sword.init(spawnRoom.getCenter().x + 1, spawnRoom.getCenter().y - 1);
tiles.Throngler.init(spawnRoom.getCenter().x, spawnRoom.getCenter().y - 1);

wakeUpSleepingEnemies();
addBelow(getEntitiesUnder(player, ["Floor"]));

document.addEventListener("keydown", (event) => {
  handleInput(event, player);
});

document.addEventListener("gameTurn", () => {
  handleTurn();
});

function handleTurn() {
  addBelow(getEntitiesUnder(player, ["Floor"]));
  wakeUpSleepingEnemies();
  viewPort.scrollTo(player.x, player.y);
  renderWorld();
}

function wakeUpSleepingEnemies() {
  const enemies = getEnemyEntitiesAround(player, 5);
  if (enemies.length > 0)
    enemies.forEach((el) => {
      if (el.getComponent("Behavior"))
        el.getComponent("Behavior").active = true;
    });
}
