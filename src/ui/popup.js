import {
  entities,
  popupUiCanvas,
  popupUiCtx,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TILE_SIZE,
  uniqueAssets,
} from "../globals.js";
import {
  activateAction,
  dropAction,
  equipAction,
  removeAction,
} from "../System/actions.js";
import { getEntityFromArray, getPopupItems, write } from "../utils.js";

const MENU_WIDTH = 500;
const MENU_HEIGHT = SCREEN_HEIGHT - 120;
const MENU_X = SCREEN_WIDTH / 2 - MENU_WIDTH / 2;
const MENU_Y = SCREEN_HEIGHT / 2 - MENU_HEIGHT / 2;

let player;
let isPopupOpen = false;
let currentPopupType;

let cursor = 0;

function openPopup(popupType) {
  cursor = 0;

  isPopupOpen = true;
  currentPopupType = popupType;

  popupUiCanvas.style.display = "block";

  updatePopupUi();
}

function closePopup() {
  isPopupOpen = false;
  currentPopupType = null;

  popupUiCanvas.style.display = "none";
}

function updatePopupUi() {
  popupUiCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  popupUiCtx.fillStyle = "black";
  popupUiCtx.strokeStyle = "burlywood";
  popupUiCtx.lineWidth = 4;
  popupUiCtx.font = "20px monospace";

  popupUiCtx.fillRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);
  popupUiCtx.strokeRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);

  if (!player) player = getEntityFromArray(false, "Player", entities);

  const inventory = player.getComponent("Inventory").inventory;

  const wieldSlots = player.getComponent("WieldSlots");
  const armorSlots = player.getComponent("ArmorSlots");
  const chipSlots = player.getComponent("ChipSlots");

  const freeWieldSlots = wieldSlots.maxWeight - wieldSlots.currentWeight;
  const freeArmorSlots = armorSlots.maxWeight - armorSlots.currentWeight;
  const freeChipSlots = chipSlots.maxWeight - chipSlots.currentWeight;

  let textShift = 0;

  let log;
  if (currentPopupType == "Wield") {
    log =
      freeWieldSlots == 1
        ? `You have ${freeWieldSlots} free manipulator.`
        : `You have ${freeWieldSlots} free manipulators.`;
  }
  if (currentPopupType == "Equip") {
    log =
      freeArmorSlots == 1
        ? `You have ${freeArmorSlots} free armor slot.`
        : `You have ${freeArmorSlots} free armor slots.`;
  }
  if (currentPopupType == "Install") {
    log =
      freeChipSlots == 1
        ? `You have ${freeChipSlots} free chip slot.`
        : `You have ${freeChipSlots} free chip slots.`;
  }
  if (log) {
    textShift += 30;
    write(popupUiCtx, [log, "white"], MENU_X + 85, MENU_Y + textShift);
    textShift += 30;
  } else textShift += 30;

  write(
    popupUiCtx,
    [`Choose an item to ${currentPopupType}:`, "white"],
    MENU_X + 10,
    MENU_Y + textShift
  );
  textShift += 90;

  const itemList = getPopupItems(player, currentPopupType);

  if (itemList.length === 0) return;

  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i];

    let additionalLog = "";
    if (item.getComponent("Weapon")?.isEquipped) additionalLog = " (wielded)";
    if (item.getComponent("Shield")?.isEquipped) additionalLog = " (wielded)";
    if (item.getComponent("Armor")?.isEquipped) additionalLog = " (worn)";
    if (item.getComponent("Chip")?.isEquipped) additionalLog = " (installed)";

    popupUiCtx.drawImage(
      uniqueAssets[item.renderName],
      MENU_X + 10,
      textShift - TILE_SIZE + 5
    );

    write(
      popupUiCtx,
      [`- ${item.currentTitle}`, item.color, additionalLog, item.color],
      MENU_X + 40,
      textShift
    );
    textShift += 30;
  }

  popupUiCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
  popupUiCtx.fillRect(
    MENU_X + 5,
    MENU_Y + cursor * 30 + textShift - TILE_SIZE - 30 * itemList.length - 58,
    MENU_WIDTH - 10,
    30
  );
}

function chooseItem() {
  if (!player) player = getEntityFromArray(false, "Player", entities);
  const inventory = player.getComponent("Inventory").inventory;

  const itemList = getPopupItems(player, currentPopupType);

  if (itemList.length === 0) return;

  if (currentPopupType == "Wield")
    equipAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );

  if (currentPopupType == "Equip") {
    equipAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  if (currentPopupType == "Install") {
    equipAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  if (currentPopupType == "Drop") {
    dropAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  if (currentPopupType == "Remove") {
    removeAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  if (currentPopupType == "Execute") {
    activateAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  if (currentPopupType == "Drain") {
    activateAction.makeAction(
      player,
      [player, itemList[cursor]],
      [player, itemList[cursor]]
    );
  }

  closePopup();
}

function moveCursor(vector) {
  if (!isPopupOpen) return;

  if (!player) player = getEntityFromArray(false, "Player", entities);
  const inventory = player.getComponent("Inventory").inventory;

  const itemList = getPopupItems(player, currentPopupType);

  if (itemList.length === 0) return;

  if (cursor + vector > itemList.length - 1) cursor = 0;
  else if (cursor + vector < 0) cursor = itemList.length - 1;
  else cursor += vector;

  updatePopupUi(currentPopupType);
}

export {
  isPopupOpen,
  currentPopupType,
  openPopup,
  closePopup,
  updatePopupUi,
  chooseItem,
  moveCursor,
};
