import {
  tilemap,
  rooms,
  MAP_TILED_WIDTH,
  MAP_TILED_HEIGHT,
} from "../globals.js";
import { randomInt } from "../utils.js";
import { tiles } from "../tiles.js";

function fillMap() {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      tiles.Wall.init(x, y);
    }
  }
}

function carveTile(x, y) {
  const tile = tilemap[y][x];
  if (x == 0 || x > MAP_TILED_WIDTH - 1) return;
  if (y == 0 || y > MAP_TILED_HEIGHT - 1) return;
  for (let i = 0; i < tile.length; i++) {
    const element = tile[i];
    if (element.name == "Wall") {
      tilemap[y][x].splice(i, 1);
      tiles.Floor.init(x, y);
    }
  }
}

function carveRooms() {
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    for (let currentX = room.x; currentX < room.x + room.w; currentX++) {
      for (let currentY = room.y; currentY < room.y + room.h; currentY++) {
        carveTile(currentX, currentY);
      }
    }
  }
}

class Section {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

const sectionGridsX = 7;
const sectionGridsY = 7;

const sectionWidth = Math.floor(MAP_TILED_WIDTH / sectionGridsX);
const sectionHeight = Math.floor(MAP_TILED_HEIGHT / sectionGridsY);

const sectionGrid = [];
for (let y = 0; y < sectionGridsY; y++) {
  sectionGrid.push([]);
  for (let x = 0; x < sectionGridsX; x++) {
    sectionGrid[y].push([]);
  }
}

function generateSections() {
  for (let y = 0; y < sectionGrid.length; y++) {
    for (let x = 0; x < sectionGrid[0].length; x++) {
      const element = sectionGrid[y][x];
      element.push(
        new Section(
          x * sectionWidth,
          y * sectionHeight,
          sectionWidth - 1,
          sectionHeight - 1
        )
      );
    }
  }
}

class Room {
  constructor(x, y, w, h, section) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.section = section;
    rooms.push(this);
  }
  getCenter() {
    return {
      x: Math.floor(this.x + this.w / 2),
      y: Math.floor(this.y + this.h / 2),
    };
  }
}

const disconnectedRooms = [];
const connectedRooms = [];

function generateMap() {
  fillMap();
  generateSections();
  generateRooms();
  disconnectedRooms.push(...rooms);

  const startingRoom = disconnectedRooms.splice(
    [randomInt(0, disconnectedRooms.length - 1)],
    1
  )[0];

  connectedRooms.push(startingRoom);

  while (disconnectedRooms.length > 0) {
    for (let i = 0; i < disconnectedRooms.length; i++) {
      const disconnectedRoom = disconnectedRooms[i];

      const disconnectedSection = disconnectedRoom.section;
      const connectedNeighbors = [];

      for (let k = 0; k < connectedRooms.length; k++) {
        const connectedRoom = connectedRooms[k];
        const connectedSection = connectedRoom.section;
        if (
          disconnectedSection.x + disconnectedSection.w + 1 ==
            connectedSection.x &&
          disconnectedSection.y === connectedSection.y
        ) {
          connectedNeighbors.push(connectedRoom);
        }
        if (
          disconnectedSection.x - disconnectedSection.w - 1 ==
            connectedSection.x &&
          disconnectedSection.y === connectedSection.y
        ) {
          connectedNeighbors.push(connectedRoom);
        }
        if (
          disconnectedSection.y + disconnectedSection.h + 1 ==
            connectedSection.y &&
          disconnectedSection.x === connectedSection.x
        ) {
          connectedNeighbors.push(connectedRoom);
        }
        if (
          disconnectedSection.y - disconnectedSection.h - 1 ==
            connectedSection.y &&
          disconnectedSection.x === connectedSection.x
        ) {
          connectedNeighbors.push(connectedRoom);
        }
      }

      if (connectedNeighbors.length === 0) continue;
      disconnectedRooms.splice(i, 1);

      const randomIndex = randomInt(0, connectedNeighbors.length - 1);
      const randomConnectedNeighbor = connectedNeighbors[randomIndex];

      const connectedCopy = [];
      connectedCopy.push(...connectedNeighbors);
      connectedCopy.splice(randomIndex, 1);

      carveRandomCorridor(disconnectedRoom, randomConnectedNeighbor);

      connectedRooms.push(disconnectedRoom);

      if (connectedCopy.length === 0) continue;
      if (randomInt(0, 100) > 75) {
        const randomConnectedNeighbor =
          connectedCopy[randomInt(0, connectedCopy.length - 1)];
        carveRandomCorridor(disconnectedRoom, randomConnectedNeighbor);
      }
    }
  }

  carveRooms();
}

function generateRooms() {
  generateSections();
  for (let y = 0; y < sectionGrid.length; y++) {
    for (let x = 0; x < sectionGrid[0].length; x++) {
      const section = sectionGrid[y][x][0];

      const roomW = randomInt(3, section.w);
      const roomH = randomInt(3, section.h);
      const roomX = randomInt(section.x, section.x + section.w - roomW);
      const roomY = randomInt(section.y, section.y + section.h - roomH);

      new Room(roomX, roomY, roomW, roomH, sectionGrid[y][x][0]);
    }
  }
}

function getClosestRoom(targetRoom, ignoredRooms) {
  let minRoom;
  let minDistance = Infinity;

  for (const room of rooms) {
    if (room == targetRoom) continue;
    if (ignoredRooms.includes(room)) continue;

    const distance = Math.floor(
      Math.sqrt(
        Math.pow(room.getCenter().x - targetRoom.getCenter().x, 2) +
          Math.pow(room.getCenter().y - targetRoom.getCenter().x, 2)
      )
    );

    if (distance < minDistance) {
      minRoom = room;
      minDistance = distance;
    }
  }

  return minRoom;
}

function hasRoomInRect(x, y, w, h) {
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];

    const noOverlap =
      room.x + room.w < x ||
      room.x > x + w ||
      room.y + room.h < y ||
      room.y > y + h;

    if (!noOverlap) {
      return true;
    }
  }
  return false;
}

function carveRandomCorridor(srcRoom, dstRoom) {
  const commonX = [];
  const commonY = [];
  for (let i = srcRoom.x; i < srcRoom.x + srcRoom.w; i++) {
    if (dstRoom.x <= i && i < dstRoom.x + dstRoom.w) {
      commonX.push(i);
    }
  }
  for (let k = srcRoom.y; k < srcRoom.y + srcRoom.h; k++) {
    if (dstRoom.y <= k && k < dstRoom.y + dstRoom.h) {
      commonY.push(k);
    }
  }

  if (commonX.length !== 0) {
    const middleX = commonX[Math.floor((commonX.length - 1) / 2)];
    carveCorridorY(srcRoom.y + srcRoom.h - 1, dstRoom.y, middleX);
    return;
  }
  if (commonY.length !== 0) {
    const middleY = commonY[Math.floor((commonY.length - 1) / 2)];
    carveCorridorX(srcRoom.x + srcRoom.w - 1, dstRoom.x, middleY);
    return;
  }

  for (let i = srcRoom.y + srcRoom.h - 1; i < dstRoom.y + dstRoom.h; i++) {
    if (tilemap[i][srcRoom.getCenter().x][0].name == "Floor") {
      carveCorridorY(srcRoom.getCenter().y, i, srcRoom.getCenter().x);
      return;
    }
  }
  for (let i = srcRoom.getCenter().x; i < dstRoom.x + dstRoom.w; i++) {
    if (tilemap[srcRoom.getCenter().y][i][0].name == "Floor") {
      carveCorridorX(srcRoom.getCenter().x, i, srcRoom.getCenter().y);
      return;
    }
  }

  const coin = randomInt(0, 1);

  if (coin) {
    carveCorridorX(
      srcRoom.getCenter().x,
      dstRoom.getCenter().x,
      srcRoom.getCenter().y
    );

    carveCorridorY(
      dstRoom.getCenter().y,
      srcRoom.getCenter().y,
      dstRoom.getCenter().x
    );
  } else {
    carveCorridorY(
      srcRoom.getCenter().y,
      dstRoom.getCenter().y,
      srcRoom.getCenter().x
    );
    carveCorridorX(
      dstRoom.getCenter().x,
      srcRoom.getCenter().x,
      dstRoom.getCenter().y
    );
  }
}

function carveCorridorX(srcStart, srcEnd, y) {
  let start;
  let end;

  if (srcStart > srcEnd) {
    start = srcEnd;
    end = srcStart;
  } else {
    start = srcStart;
    end = srcEnd;
  }

  for (let i = start; i <= end; i++) {
    carveTile(i, y);
  }
}

function carveCorridorY(srcStart, srcEnd, x) {
  let start;
  let end;

  if (srcStart > srcEnd) {
    start = srcEnd;
    end = srcStart;
  } else {
    start = srcStart;
    end = srcEnd;
  }

  for (let i = start; i <= end; i++) {
    carveTile(x, i);
  }
}

function populateMap() {
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (randomInt(0, 100) > 50) {
      const spawnX = randomInt(room.x, room.x + room.w - 1);
      const spawnY = randomInt(room.y, room.y + room.h - 1);
      tiles.Guard.init(spawnX, spawnY);
    }
  }
}

export {
  fillMap,
  carveTile,
  carveRooms,
  hasRoomInRect,
  generateMap,
  sectionGrid,
  populateMap,
  generateRooms,
};
