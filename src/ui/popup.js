import {
  entities,
  popupUiCanvas,
  popupUiCtx,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TILE_SIZE,
  uniqueAssets,
} from "../globals.js";
import { wieldAction } from "../System/actions.js";
import { getEntityFromArray, setContextFillStyle } from "../utils.js";

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

  let textShift = MENU_Y + 65;
  popupUiCtx.fillStyle = "white";
  popupUiCtx.fillText(
    `Choose an item to ${popupType}:`,
    MENU_X + 10,
    MENU_Y + 30
  );

  const itemList = inventory.filter(
    (item) => item.getComponent("Pickable").popupType == popupType
  );
  if (itemList.length === 0) return;

  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i];
    popupUiCtx.drawImage(
      uniqueAssets[item.renderName],
      MENU_X + 10,
      textShift - TILE_SIZE + 5
    );

    setContextFillStyle(popupUiCtx, item.color);
    popupUiCtx.fillText(`- ${item.title}`, MENU_X + 40, textShift);
    textShift += 30;
  }

  popupUiCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
  popupUiCtx.fillRect(
    MENU_X + 5,
    MENU_Y + 45 + cursor * 30,
    MENU_WIDTH - 10,
    30
  );
}

function chooseItem() {
  if (!player) player = getEntityFromArray(false, "Player", entities);
  const inventory = player.getComponent("Inventory").inventory;

  const itemsList = inventory.filter(
    (item) => item.getComponent("Pickable").popupType == currentPopupType
  );

  if (itemsList.length === 0) return;

  if (currentPopupType == "Wield")
    wieldAction.makeAction(
      player,
      [player, itemsList[cursor]],
      [player, itemsList[cursor]]
    );

  closePopup();
}

function moveCursor(vector) {
  if (!isPopupOpen) return;

  if (!player) player = getEntityFromArray(false, "Player", entities);
  const inventory = player.getComponent("Inventory").inventory;

  const itemsList = inventory.filter(
    (item) => item.getComponent("Pickable").popupType == currentPopupType
  );

  if (itemsList.length === 0) return;

  if (cursor + vector > itemsList.length - 1) cursor = 0;
  else if (cursor + vector < 0) cursor = itemsList.length - 1;
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
