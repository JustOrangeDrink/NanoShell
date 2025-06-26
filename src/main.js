import {
  renderWorld,
  getEntitiesUnder,
  wakeUpSleepingEnemies,
} from "./System/engine.js";
import { spritesheet, viewPort } from "./globals.js";
import { populateMap, generateMap, placePlayer } from "./System/mapgen.js";
import { addEntityAsset } from "./utils.js";
import { entityPresets } from "./presets.js";
import { addBelow, updateUi } from "./ui/sidebar.js";
import { handleInput } from "./System/controls.js";
import { updateInventoryUi } from "./ui/inventory.js";

spritesheet.onload = () => {
  for (const key in entityPresets) {
    addEntityAsset(entityPresets[key]);
  }
  renderWorld();
};

const player = entityPresets.Player.init();

generateMap();

placePlayer();

populateMap();

document.addEventListener("keydown", (event) => {
  handleInput(event, player);
});

document.addEventListener("gameTurn", () => {
  handleTurn();
});

function handleTurn() {
  addBelow(getEntitiesUnder(player, ["Floor"]));
  wakeUpSleepingEnemies(player);
  viewPort.scrollTo(player.x, player.y);
  updateUi();
  updateInventoryUi();
  renderWorld();
}
