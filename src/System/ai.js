import { randomInt } from "../utils.js";
import { tryMovement } from "./engine.js";

function zombieBehavior(entity) {
  const axisCoin = randomInt(0, 1);
  const directionCoin = randomInt(0, 1);

  if (axisCoin) {
    if (directionCoin) tryMovement(entity, 1, 0);
    else tryMovement(entity, -1, 0);
  } else {
    if (directionCoin) tryMovement(entity, 0, 1);
    else tryMovement(entity, 0, -1);
  }
}

export { zombieBehavior };
