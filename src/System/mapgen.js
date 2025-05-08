import { tilemap, rooms } from "../globals.js";
import { Entity } from "../Entity/entities.js";
import { Collision, Render } from "../Component/components.js";
import { randomInt } from "../../utils.js";

function fillMap() {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      const wall = new Entity("Wall", x, y, 3, 0, 11, [0.1, 0.5, 0.1]);
      wall.addComponent(new Collision(true));
    }
  }
}

function carveTile(x, y) {
  const tile = tilemap[y][x];
  for (let i = 0; i < tile.length; i++) {
    const element = tile[i];
    if (element.name == "Wall") {
      tilemap[y][x].splice(i, 1);
      new Entity("Floor", x, y, 1, 7, 0, [0, 0.05, 0]);
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

class Room {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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
  tryRooms(50);

  disconnectedRooms.push(...rooms);

  const startingRoom = disconnectedRooms.splice(
    [randomInt(0, disconnectedRooms.length)],
    1
  )[0];
  connectedRooms.push(startingRoom);

  while (disconnectedRooms.length > 0) {
    const currentConnected = connectedRooms[connectedRooms.length - 1];

    const closestDisconnected = getClosestRoom(
      currentConnected,
      connectedRooms
    );

    const disconnectedRoomIndex =
      disconnectedRooms.indexOf(closestDisconnected);

    disconnectedRooms.splice(disconnectedRoomIndex, 1);
    connectedRooms.push(closestDisconnected);

    const coin = randomInt(0, 1);

    if (coin) {
      carveCorridorX(
        currentConnected.getCenter().x,
        closestDisconnected.getCenter().x,
        currentConnected.getCenter().y
      );

      carveCorridorY(
        closestDisconnected.getCenter().y,
        currentConnected.getCenter().y,
        closestDisconnected.getCenter().x
      );
    } else {
      carveCorridorY(
        currentConnected.getCenter().y,
        closestDisconnected.getCenter().y,
        currentConnected.getCenter().x
      );
      carveCorridorX(
        closestDisconnected.getCenter().x,
        currentConnected.getCenter().x,
        closestDisconnected.getCenter().y
      );
    }
  }
}

function tryRooms(attempts) {
  for (let i = 0; i < attempts; i++) {
    const roomW = randomInt(3, 10);
    const roomH = randomInt(3, 10);
    const roomX = randomInt(1, tilemap[0].length - roomW - 1);
    const roomY = randomInt(1, tilemap.length - roomH - 1);

    if (!hasRoomInRect(roomX, roomY, roomW, roomH))
      new Room(roomX, roomY, roomW, roomH);
    else continue;
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

    // Проверяем если комната ВНЕ территории по какому-то из аттрибутов.
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

export { fillMap, carveTile, carveRooms, hasRoomInRect, generateMap };
