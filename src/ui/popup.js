import {
  entities,
  inventoryUiCanvas,
  inventoryUiCtx,
  popupUiCanvas,
  popupUiCtx,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../globals.js";
import { getEntityFromArray, setContextFillStyle } from "../utils.js";

const MENU_WIDTH = 500;
const MENU_HEIGHT = SCREEN_HEIGHT - 120;
const MENU_X = SCREEN_WIDTH / 2 - MENU_WIDTH / 2;
const MENU_Y = SCREEN_HEIGHT / 2 - MENU_HEIGHT / 2;

let isPopupOpen = false;
let currentPopupType;

function openPopup(popupType) {
  updatePopupUi(popupType);
  isPopupOpen = true;
  currentPopupType = popupType;

  popupUiCanvas.style.display = "block";
}

function closePopup() {
  isPopupOpen = false;
  currentPopupType = null;

  popupUiCanvas.style.display = "none";
}

let player;
function updatePopupUi(popupType) {
  popupUiCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  popupUiCtx.fillStyle = "black";
  popupUiCtx.strokeStyle = "lime";
  popupUiCtx.lineWidth = 4;
  popupUiCtx.font = "18px courier";

  popupUiCtx.fillRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);
  popupUiCtx.strokeRect(MENU_X, MENU_Y, MENU_WIDTH, MENU_HEIGHT);

  if (!player) player = getEntityFromArray(false, "Player", entities);

  const inventory = player.getComponent("Inventory").inventory;

  let textShift = MENU_Y + 55;
  popupUiCtx.fillStyle = "white";
  popupUiCtx.fillText(
    `Choose an item to ${popupType}:`,
    MENU_X + 5,
    MENU_Y + 30
  );

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    if (item.getComponent("Pickable").popupType == popupType) {
      setContextFillStyle(popupUiCtx, item.color);
      popupUiCtx.fillText(`${item.title}`, MENU_X + 5, textShift);
      textShift += 20;
    }
  }
}

export { openPopup, closePopup, isPopupOpen, currentPopupType, updatePopupUi };
