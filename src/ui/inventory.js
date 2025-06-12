import {
  canvas,
  entities,
  inventoryUiCanvas,
  inventoryUiCtx,
  mainUiCanvas,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TILE_SIZE,
  uniqueAssets,
} from "../globals.js";
import { getEntityFromArray, write } from "../utils.js";

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
  inventoryUiCtx.font = "20px monospace";

  inventoryUiCtx.fillRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);
  inventoryUiCtx.strokeRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);

  if (!player) player = getEntityFromArray(false, "Player", entities);

  const wieldSlots = player.getComponent("WieldSlots");

  write(inventoryUiCtx, [`Wielding:`, "coral"], MENU_X + 5, MENU_Y + 30);

  let wieldShift = 55;
  for (let i = 0; i < wieldSlots.weaponSlots.length; i++) {
    const weapon = wieldSlots.weaponSlots[i];
    inventoryUiCtx.drawImage(
      uniqueAssets[weapon.renderName],
      MENU_X + 10,
      MENU_Y + wieldShift - TILE_SIZE
    );

    write(
      inventoryUiCtx,
      [`- ${weapon.currentTitle}`, weapon.color],
      MENU_X + 36,
      MENU_Y + wieldShift
    );

    wieldShift += 30;
  }

  for (let i = 0; i < wieldSlots.shieldSlots.length; i++) {
    const shield = wieldSlots.shieldSlots[i];
    inventoryUiCtx.drawImage(
      uniqueAssets[shield.renderName],
      MENU_X + 10,
      MENU_Y + wieldShift - 20
    );

    write(
      inventoryUiCtx,
      [`- ${shield.currentTitle}`, shield.color],
      MENU_X + 36,
      MENU_Y + wieldShift
    );

    wieldShift += 30;
  }

  write(
    inventoryUiCtx,
    ["Equipped:", "burlywood"],
    MENU_X + 5,
    MENU_Y + wieldShift
  );
  wieldShift += 25;
  const armorSlots = player.getComponent("ArmorSlots").armorSlots;

  for (let i = 0; i < armorSlots.length; i++) {
    const armor = armorSlots[i];
    inventoryUiCtx.drawImage(
      uniqueAssets[armor.renderName],
      MENU_X + 10,
      MENU_Y + wieldShift - 20
    );

    write(
      inventoryUiCtx,
      [`- ${armor.currentTitle}`, armor.color],
      MENU_X + 36,
      MENU_Y + wieldShift
    );

    wieldShift += 30;
  }

  write(
    inventoryUiCtx,
    ["Storage vault:", "bisque"],
    MENU_X + 5,
    MENU_Y + wieldShift
  );

  const inventory = player.getComponent("Inventory").inventory;
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];

    inventoryUiCtx.drawImage(
      uniqueAssets[item.renderName],
      MENU_X + 10,
      MENU_Y + i * 30 + wieldShift + 5
    );

    write(
      inventoryUiCtx,
      [`- ${item.currentTitle}`, item.color],
      MENU_X + 36,
      MENU_Y + i * 30 + wieldShift + 25
    );
  }
}

export { openInventory, closeInventory, isInventoryOpen, updateInventoryUi };
