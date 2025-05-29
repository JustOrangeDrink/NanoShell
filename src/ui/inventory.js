import {
  canvas,
  inventoryUiCanvas,
  inventoryUiCtx,
  mainUiCanvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  uniqueAssets,
} from "../globals.js";
import { getEntity } from "../utils.js";

const MENU_WIDTH = 500;
const MENU_HEIGHT = SCREEN_HEIGHT - 120;
const MENU_X = SCREEN_WIDTH / 2 - MENU_WIDTH / 2;
const MENU_Y = SCREEN_HEIGHT / 2 - MENU_HEIGHT / 2;

let isInventoryOpen = false;

function openInventory() {
  isInventoryOpen = true;

  inventoryUiCanvas.style.display = "block";
  canvas.style.filter = "blur(2px)";
  mainUiCanvas.style.filter = "blur(2px)";
}

function closeInventory() {
  isInventoryOpen = false;

  inventoryUiCanvas.style.display = "none";

  canvas.style.filter = "none";
  mainUiCanvas.style.filter = "none";
}

let player;
function updateInventoryUi() {
  inventoryUiCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  inventoryUiCtx.fillStyle = "black";
  inventoryUiCtx.strokeStyle = "lime";
  inventoryUiCtx.lineWidth = 4;
  inventoryUiCtx.font = "18px courier";

  inventoryUiCtx.fillRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);
  inventoryUiCtx.strokeRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);

  if (!player) player = getEntity(false, "Player");
  const inventory = player.getComponent("Inventory").inventory;

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    const red = item.color[0] * 255;
    const green = item.color[1] * 255;
    const blue = item.color[2] * 255;
    console.log(item);
    inventoryUiCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    inventoryUiCtx.drawImage(
      uniqueAssets[item.name],
      MENU_X + 10,
      MENU_Y + 14 + i * 36
    );
    inventoryUiCtx.fillText(
      `- ${item.title}`,
      MENU_X + 36,
      MENU_Y + 30 + i * 36
    );
  }
}

export { openInventory, closeInventory, isInventoryOpen, updateInventoryUi };
