import { getEntity, randomInt } from "../utils.js";
import { tryMovement } from "./engine.js";

let player;
function zombieBehavior(entity) {
  if (!player) player = getEntity(0, "Player");

  let dx;
  let dy;
  if (player.x === entity.x) dx = 0;
  if (player.x < entity.x) dx = -1;
  if (player.x > entity.x) dx = 1;

  if (player.y === entity.y) dy = 0;
  if (player.y < entity.y) dy = -1;
  if (player.y > entity.y) dy = 1;
  tryMovement(entity, dx, dy);
  return;

  // const axisCoin = randomInt(0, 1);
  // const directionCoin = randomInt(0, 1);

  // if (axisCoin) {
  //   if (directionCoin) tryMovement(entity, 1, 0);
  //   else tryMovement(entity, -1, 0);
  // } else {
  //   if (directionCoin) tryMovement(entity, 0, 1);
  //   else tryMovement(entity, 0, -1);
  // }
}

export { zombieBehavior };
