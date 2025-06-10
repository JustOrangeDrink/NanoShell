import { knownMap, rooms, tilemap } from "../globals.js";
import { addLog } from "../ui/sidebar.js";
import { randomInt } from "../utils.js";

function randomTp(trg) {
  const randomRoom = rooms[randomInt(0, rooms.length)];
  tilemap[trg.y][trg.x].splice(tilemap[trg.y][trg.x].indexOf(trg), 1);
  tilemap[randomRoom.getCenter().y][randomRoom.getCenter().x].push(trg);
  for (let i = 0; i < knownMap[trg.y][trg.x].length; i++) {
    const entity = knownMap[trg.y][trg.x][i];
    if (entity.id == trg.id) knownMap[trg.y][trg.x].splice(i, 1);
  }
  trg.x = randomRoom.getCenter().x;
  trg.y = randomRoom.getCenter().y;
  addLog(`${trg.name} vanishes!`, "purple");
}

export { randomTp };
