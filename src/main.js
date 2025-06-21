import { renderWorld, getEntitiesUnder } from "./System/engine.js";
import { spritesheet, viewPort, rooms, entities } from "./globals.js";
import { populateMap, generateMap } from "./System/mapgen.js";
import { addEntityAsset, getEnemyEntitiesAround, randomInt } from "./utils.js";
import { entityPresets, getPresetsByTags } from "./presets.js";
import { addBelow, updateUi } from "./ui/sidebar.js";
import { handleInput } from "./System/controls.js";
import { updateInventoryUi } from "./ui/inventory.js";

spritesheet.onload = () => {
  for (const key in entityPresets) {
    addEntityAsset(entityPresets[key]);
  }
  renderWorld();
};

generateMap();
populateMap();

const spawnRoom = rooms[randomInt(0, rooms.length - 1)];

const player = entityPresets.Player.init(
  spawnRoom.getCenter().x,
  spawnRoom.getCenter().y
);
viewPort.scrollTo(player.x, player.y);

entityPresets.Throngler.init(player.x + 1, player.y);
entityPresets.Throngler.init(player.x - 1, player.y);

updateUi();
updateInventoryUi();

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
  updateUi();
  updateInventoryUi();
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
