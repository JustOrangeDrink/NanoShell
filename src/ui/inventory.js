import {
  canvas,
  entities,
  inventoryUiCanvas,
  inventoryUiCtx,
  mainUiCanvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  uniqueAssets,
} from "../globals.js";
import { getEntityFromArray, setContextFillStyle } from "../utils.js";

const MENU_WIDTH = 500;
const MENU_HEIGHT = SCREEN_HEIGHT - 120;
const MENU_X = SCREEN_WIDTH / 2 - MENU_WIDTH / 2;
const MENU_Y = SCREEN_HEIGHT / 2 - MENU_HEIGHT / 2;

let isInventoryOpen = false;

function openInventory() {
  isInventoryOpen = true;

  inventoryUiCanvas.style.display = "block";
}

function closeInventory() {
  isInventoryOpen = false;

  inventoryUiCanvas.style.display = "none";
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

  if (!player) player = getEntityFromArray(false, "Player", entities);

  const wieldSlots = player.getComponent("WieldSlots");
  const freeWieldSlots = wieldSlots.maxWeight - wieldSlots.currentWeight;
  const wieldLog =
    freeWieldSlots == 1
      ? `You have ${freeWieldSlots} unoccupied manipulator.`
      : `You have ${freeWieldSlots} unoccupied manipulators.`;

  inventoryUiCtx.fillStyle = "white";
  inventoryUiCtx.fillText(wieldLog, MENU_X + 70, MENU_Y + 30);

  inventoryUiCtx.fillStyle = "coral";
  inventoryUiCtx.fillText(`Wielding:`, MENU_X + 5, MENU_Y + 60);

  let wieldShift = 85;
  for (let i = 0; i < wieldSlots.weaponSlots.length; i++) {
    const weapon = wieldSlots.weaponSlots[i];
    inventoryUiCtx.drawImage(
      uniqueAssets[weapon.renderName],
      MENU_X + 5,
      MENU_Y + wieldShift - 20
    );

    setContextFillStyle(inventoryUiCtx, shield.color);
    inventoryUiCtx.fillText(
      `- ${weapon.title}`,
      MENU_X + 35,
      MENU_Y + wieldShift
    );

    wieldShift += 26;
  }

  for (let i = 0; i < wieldSlots.shieldSlots.length; i++) {
    const shield = wieldSlots.shieldSlots[i];
    inventoryUiCtx.drawImage(
      uniqueAssets[shield.renderName],
      MENU_X + 5,
      MENU_Y + wieldShift - 20
    );

    setContextFillStyle(inventoryUiCtx, shield.color);
    inventoryUiCtx.fillText(
      `- ${shield.title}`,
      MENU_X + 35,
      MENU_Y + wieldShift
    );

    wieldShift += 26;
  }

  inventoryUiCtx.fillStyle = "bisque";
  inventoryUiCtx.fillText(
    `Storage vault:`,
    MENU_X + 5,
    MENU_Y + wieldShift + 15
  );
  const inventory = player.getComponent("Inventory").inventory;
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    setContextFillStyle(inventoryUiCtx, item.color);
    inventoryUiCtx.drawImage(
      uniqueAssets[item.renderName],
      MENU_X + 10,
      MENU_Y + 26 + i * 26 + wieldShift
    );
    inventoryUiCtx.fillText(
      `- ${item.title}`,
      MENU_X + 36,
      MENU_Y + 42 + i * 26 + wieldShift
    );
  }
}

export { openInventory, closeInventory, isInventoryOpen, updateInventoryUi };
