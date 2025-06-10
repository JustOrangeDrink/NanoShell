import {
  CANVAS_TILED_HEIGHT,
  CANVAS_TILED_WIDTH,
  TILE_SIZE,
  entities,
  spritesheet,
  tilemap,
  uniqueAssets,
  uniqueAssetsDark,
  viewPort,
} from "./globals.js";
import { renderWorld } from "./System/engine.js";
import { updateInventoryUi } from "./ui/inventory.js";
import { isPopupOpen, currentPopupType, updatePopupUi } from "./ui/popup.js";
import { updateUi } from "./ui/sidebar.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function colorize(
  charX,
  charY,
  colorArray = [0, 0, 0, 255],
  bgColorArray = [0, 0, 0, 0]
) {
  const [r, g, b, a] = colorArray;
  const [bgR, bgG, bgB, bgA] = bgColorArray;
  colorArray;

  const offscreen = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = offscreen.getContext("2d");

  ctx.drawImage(
    spritesheet,
    charX * TILE_SIZE,
    charY * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE
  );

  const imageData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);

  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] === 0) {
      imageData.data[i + 0] = bgR;
      imageData.data[i + 1] = bgG;
      imageData.data[i + 2] = bgB;
      imageData.data[i + 3] = bgA;
    } else {
      imageData.data[i + 0] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return offscreen;
}

function recolorize(
  entity,
  colorArray = [0, 0, 0, 255],
  bgColorArray = [0, 0, 0, 0],
  defaultRecolor = false
) {
  const [r, g, b, a] = colorArray;
  const [bgR, bgG, bgB, bgA] = bgColorArray;
  entity.color = [r, g, b, a];
  entity.bg = [bgR, bgG, bgB, bgA];
  entity.renderName = getRenderName(entity.name, colorArray, bgColorArray);
  addEntityAsset(entity);
  if (defaultRecolor) {
    entity.defaultColor = [r, g, b, a];
    entity.defaultBg = [bgR, bgG, bgB, bgA];
  }
  if (entity.x && entity.y) renderWorld();
  updateUi();
  updateInventoryUi();

  if (
    (isPopupOpen &&
      currentPopupType === entity.getComponent("Pickable")?.popupType) ||
    currentPopupType == "Drop"
  )
    updatePopupUi();
}

function addEntityAsset(entity) {
  if (!(entity.renderName in uniqueAssets)) {
    uniqueAssets[entity.renderName] = colorize(
      entity.charX,
      entity.charY,
      entity.color,
      entity.bg
    );
    uniqueAssetsDark[entity.renderName] = colorize(
      entity.charX,
      entity.charY,
      [
        entity.color[0] / 4,
        entity.color[1] / 4,
        entity.color[2] / 4,
        entity.color[3],
      ],
      [entity.bg[0] / 4, entity.bg[1] / 4, entity.bg[2] / 4, entity.bg[3]]
    );
  }
}

function getRenderName(
  name,
  colorArray = [0, 0, 0, 255],
  bgColorArray = [0, 0, 0, 0]
) {
  const [r, g, b, a] = colorArray;
  const [bgR, bgG, bgB, bgA] = bgColorArray;
  return `Name(${name})_Color(${r}_${g}_${b}_${a})_Bg(${bgR}_${bgG}_${bgB}_${bgA}})`;
}

function getEntityFromArray(id, name, array) {
  for (let i = 0; i < array.length; i++) {
    const entity = array[i];
    if (name === entity.name && !id) {
      return entity;
    }
  }
}

function isInSquare(x, y, x0, y0, x1, y1) {
  if (x > x0 && x < x1 && y > y0 && y < y1) return true;
  return false;
}

function getEnemyEntitiesAround(anchor, distance) {
  const entities = [];
  for (let i = anchor.y - distance; i < anchor.y + distance; i++) {
    for (let k = anchor.x - distance; k < anchor.x + distance; k++) {
      if (i < 0 || k < 0) continue;
      if (i > tilemap.length - 1 || k > tilemap[0].length - 1) continue;
      for (let j = 0; j < tilemap[i][k].length; j++) {
        const entity = tilemap[i][k][j];
        if (entity.getComponent("Alignment")?.alignment == "Bad")
          entities.push(entity);
      }
    }
  }
  return entities;
}

function getNeighbors(x, y) {
  const offsets = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  return offsets.map(([dx, dy]) => [x + dx, y + dy]);
}

function roundToOne(num) {
  return Math.round(num * 10) / 10;
}

function countDigits(num) {
  return num.toString().replace(",", "").length;
}

function getRelativeCoords([x, y]) {
  const relativeX =
    (x -
      viewPort.x +
      Math.floor(CANVAS_TILED_WIDTH / 2) -
      Math.floor(viewPort.w / 2)) *
    TILE_SIZE;
  const relativeY =
    (y -
      viewPort.y +
      Math.floor(CANVAS_TILED_HEIGHT / 2) -
      Math.floor(viewPort.h / 2)) *
    TILE_SIZE;

  return [relativeX, relativeY];
}

function setContextFillStyle(ctx, colors) {
  const red = colors[0] * 255;
  const green = colors[1] * 255;
  const blue = colors[2] * 255;
  ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
}

function getPopupItems(src, currentPopupType) {
  const itemList = [];
  const inventory = src.getComponent("Inventory").inventory;

  const wieldSlots = src.getComponent("WieldSlots");
  const weaponSlots = wieldSlots.weaponSlots;
  const shieldSlots = wieldSlots.shieldSlots;
  const armorSlots = src.getComponent("ArmorSlots").armorSlots;

  const trgStorage =
    currentPopupType == "Drop"
      ? [...inventory, ...weaponSlots, ...shieldSlots, ...armorSlots]
      : [...inventory];

  for (let i = 0; i < trgStorage.length; i++) {
    const item = trgStorage[i];
    if (
      item.getComponent("Pickable").popupType == currentPopupType ||
      currentPopupType == "Drop"
    ) {
      itemList.push(item);
    }
  }

  return itemList;
}

export {
  randomInt,
  randomFloat,
  colorize,
  getEntityFromArray,
  isInSquare,
  getEnemyEntitiesAround,
  getNeighbors,
  roundToOne,
  countDigits,
  addEntityAsset,
  getRelativeCoords,
  recolorize,
  getRenderName,
  setContextFillStyle,
  getPopupItems,
};
