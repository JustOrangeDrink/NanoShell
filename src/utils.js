import { decryptedEntities, encryptedEntities } from "./Entity/entities.js";
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
      imageData.data[i + 0] *= r / 255;
      imageData.data[i + 1] *= g / 255;
      imageData.data[i + 2] *= b / 255;
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

  // if entity is a shallow copy used to change
  // log color we return after changing color
  if (entity.logCopy) return;

  entity.renderName = getRenderName(entity.name, colorArray, bgColorArray);
  addEntityAsset(entity);
  if (defaultRecolor) {
    entity.defaultColor = [r, g, b, a];
    entity.defaultBg = [bgR, bgG, bgB, bgA];
  }
  if (entity.x !== undefined && entity.y !== undefined) renderWorld();
  updateUi();
  updateInventoryUi();

  if (
    (isPopupOpen &&
      currentPopupType === entity.getComponent("Pickable")?.popupType) ||
    currentPopupType == "Drop" ||
    currentPopupType == "Remove"
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

function getPopupItems(src, currentPopupType) {
  const itemList = [];
  const inventory = src.getComponent("Inventory").inventory;

  const wieldSlots = src.getComponent("WieldSlots");

  const weaponSlots = wieldSlots.weaponSlots;
  const shieldSlots = wieldSlots.shieldSlots;
  const armorSlots = src.getComponent("ArmorSlots").armorSlots;
  const chipSlots = src.getComponent("ChipSlots").chipSlots;

  let trgStorage;
  if (currentPopupType == "Drop") {
    trgStorage = [
      ...inventory,
      ...weaponSlots,
      ...shieldSlots,
      ...armorSlots,
      ...chipSlots,
    ];
  } else if (currentPopupType == "Remove") {
    trgStorage = [...weaponSlots, ...shieldSlots, ...armorSlots, ...chipSlots];
  } else {
    trgStorage = [...inventory];
  }

  for (let i = 0; i < trgStorage.length; i++) {
    const item = trgStorage[i];
    if (
      item.getComponent("Pickable").popupType == currentPopupType ||
      currentPopupType == "Drop" ||
      currentPopupType == "Remove"
    ) {
      itemList.push(item);
    }
  }

  return itemList;
}

function handleTitle(trg) {
  const trgStack = trg.getComponent("Stack");

  const trgWeapon = trg.getComponent("Weapon");
  const trgShield = trg.getComponent("Shield");
  const trgArmor = trg.getComponent("Armor");

  if (trgStack?.amount > 1) {
    if (trg.getComponent("Encryption")?.isCrypted) {
      trg.currentTitle = `${trgStack.amount} ${
        trg.getComponent("Encryption").multipleCryptedTitle
      }`;
      return;
    }
    trg.currentTitle = `${trgStack.amount} ${trg.multipleTitle}`;
  } else {
    if (trg.getComponent("Encryption")?.isCrypted) {
      trg.currentTitle = `${trg.getComponent("Encryption").singleCryptedTitle}`;
      return;
    }
    trg.currentTitle = `${trg.singleTitle}`;
  }

  if (trgWeapon) {
    let accSymbol = trgWeapon.acc < 0 ? "" : "+";
    let dmgSymbol = trgWeapon.dmg < 0 ? "" : "+";
    trg.currentTitle = `${accSymbol}${trgWeapon.acc},${dmgSymbol}${trgWeapon.dmg} ${trg.currentTitle}`;
  }
  if (trgShield) {
    let ddgModSymbol = trgShield.ddgMod < 0 ? "" : "+";
    let armSymbol = trgShield.arm < 0 ? "" : "+";
    trg.currentTitle = `${ddgModSymbol}${trgShield.ddgMod},${armSymbol}${trgShield.arm} ${trg.currentTitle}`;
  }
  if (trgArmor) {
    let ddgModSymbol = trgArmor.ddgMod < 0 ? "" : "+";
    let armSymbol = trgArmor.arm < 0 ? "" : "+";
    trg.currentTitle = `${ddgModSymbol}${trgArmor.ddgMod},${armSymbol}${trgArmor.arm} ${trg.currentTitle}`;
  }
}

function revealEncryptions(trg) {
  if (!decryptedEntities.includes(trg.name)) decryptedEntities.push(trg.name);

  for (let i = 0; i < encryptedEntities.length; i++) {
    const ecryptedEntity = encryptedEntities[i];
    if (ecryptedEntity.name == trg.name) {
      ecryptedEntity.getComponent("Encryption").isCrypted = false;
    }
    handleTitle(ecryptedEntity);
  }
}

function numToRgba(num) {
  return `rgba(${num[0]}, ${num[1]}, ${num[2]}, ${num[3]})`;
}

function write(ctx, text, x, y) {
  let textShift = x;
  for (let k = 0; k < text.length; k += 2) {
    let textFragment;
    let color;

    // if passed in parameter is an object we use it's title and color as our parameters
    // passing in an object allows us to have dynamically changing message (animation)
    if (typeof text[k] == "object") {
      textFragment = text[k].currentTitle;

      // if object has animation with color change
      // then we must use it's temporary color
      if (text[k].animation)
        color = Array.isArray(text[k].color)
          ? numToRgba(text[k].color)
          : text[k].color;
      else
        color = Array.isArray(text[k].defaultColor)
          ? numToRgba(text[k].defaultColor)
          : text[k].defaultColor;
    } else {
      textFragment = text[k];
      color = Array.isArray(text[k + 1]) ? numToRgba(text[k + 1]) : text[k + 1];
    }

    ctx.fillStyle = color;
    ctx.fillText(textFragment, textShift, y);

    textShift += ctx.measureText(textFragment).width;
  }
}

function getShallowCopy(srcEntity) {
  const shallowCopy = { ...srcEntity };
  shallowCopy.logCopy = true;

  // animation function of the original isn't copied,
  // so we pass it in manually and then play it
  if (srcEntity.animation) {
    shallowCopy.animation[0] = srcEntity.animation[0];
    shallowCopy.animation[1] = srcEntity.animation[1];

    shallowCopy.animation[0](shallowCopy, shallowCopy.animation[1]);
  }

  return shallowCopy;
}

function getScrollName(lettersAmount = 5) {
  let result = "";
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'";

  for (let i = 0; i < lettersAmount; i++) {
    result += alphabet[randomInt(0, alphabet.length - 1)];
  }

  return result;
}

function getChipString(lettersAmount = 5) {
  let result = "";
  const alphabet = "01xzf-_+";

  for (let i = 0; i < lettersAmount; i++) {
    result += alphabet[randomInt(0, alphabet.length - 1)];
  }

  return result;
}

function getRandomColor(includeMaterial) {
  const white = [[255, 255, 255, 255], "Quartz"];
  const silver = [[165, 169, 180, 255], "Silver"];
  const red = [[255, 0, 0, 255], "Ruby"];
  const green = [[0, 255, 0, 255], "Emerald"];
  const blue = [[0, 0, 255, 255], "Sapphire"];
  const purple = [[255, 0, 255, 255], "Amethyst"];
  const yellow = [[255, 255, 0, 255], "Topaz"];
  const orange = [[255, 165, 0, 255], "Amber"];
  const cyan = [[0, 255, 255, 255], "Diamond"];
  const brown = [[150, 75, 0, 255], "Zircon"];

  const colors = [
    white,
    silver,
    red,
    green,
    blue,
    purple,
    yellow,
    orange,
    cyan,
    brown,
  ];

  if (includeMaterial) return colors[randomInt(0, colors.length - 1)];
  else return colors[randomInt(0, colors.length - 1)][0];
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
  addEntityAsset,
  getRelativeCoords,
  recolorize,
  getRenderName,
  getPopupItems,
  handleTitle,
  revealEncryptions,
  numToRgba,
  write,
  getShallowCopy,
  getScrollName,
  getChipString,
  getRandomColor,
};
